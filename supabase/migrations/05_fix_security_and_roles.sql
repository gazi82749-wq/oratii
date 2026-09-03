-- ==============================================================================
-- Migration: 05_fix_security_and_roles.sql
-- Fixes critical privilege escalation vulnerability and adds persistent platform settings
-- ==============================================================================

-- 1. PREVENT CLIENTS FROM ESCALATING THEIR OWN ROLE TO ADMIN
-- Create a security definer function and trigger on the profiles table
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only permit role change if the current session is the service_role (backend admin)
    -- or a postgres superuser. Standard authenticated users cannot change role.
    IF auth.role() IS NOT NULL AND auth.role() != 'service_role' THEN
      RAISE EXCEPTION 'Privilege escalation rejected: Regular users cannot modify their role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to public.profiles
DROP TRIGGER IF EXISTS tr_prevent_role_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();


-- 2. CREATE PERSISTENT PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  platform_name TEXT NOT NULL DEFAULT 'Oratii',
  contact_email TEXT NOT NULL DEFAULT 'contact@oratii.app',
  support_email TEXT NOT NULL DEFAULT 'support@oratii.app',
  upi_id TEXT NOT NULL DEFAULT 'oratii@upi',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT true,
  session_timeout_minutes INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view general platform settings
DROP POLICY IF EXISTS "Public can view platform settings" ON public.platform_settings;
CREATE POLICY "Public can view platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Only service role can modify platform settings
DROP POLICY IF EXISTS "Service role can modify platform settings" ON public.platform_settings;
CREATE POLICY "Service role can modify platform settings"
  ON public.platform_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed default settings if empty
INSERT INTO public.platform_settings (id, platform_name, contact_email, support_email, upi_id, two_factor_enabled, session_timeout_minutes)
VALUES ('default', 'Oratii', 'contact@oratii.app', 'support@oratii.app', 'oratii@upi', true, 30)
ON CONFLICT (id) DO NOTHING;
