-- 07_push_subscriptions.sql
-- Store Web Push API subscription objects for each user+device

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),

  -- Each browser endpoint is unique globally
  CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

-- Enable Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read/insert/delete their own push subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (backend) can read all subscriptions for broadcast
-- (handled automatically by service_role key bypassing RLS)

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id
  ON public.push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint
  ON public.push_subscriptions(endpoint);
