-- supabase/migrations/10_refund_billing.sql

DROP FUNCTION IF EXISTS public.increment_unified_usage(UUID, INT);

-- Atomic increment function for usage limits to refund credits
CREATE OR REPLACE FUNCTION public.increment_unified_usage(user_id_val UUID, refund_val INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_speech INT;
BEGIN
  -- 1. Select the current row with FOR UPDATE lock
  SELECT 
    COALESCE(speech_analysis_count, 0)
  INTO current_speech
  FROM public.usage_limits
  WHERE user_id = user_id_val 
  FOR UPDATE;

  -- 2. Check if the user exists
  IF current_speech IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3. Refund the amount (we dump refunds back into speech_analysis_count since they all share a pool)
  UPDATE public.usage_limits
  SET 
    speech_analysis_count = current_speech + refund_val
  WHERE user_id = user_id_val;

  RETURN TRUE;
END;
$$;
