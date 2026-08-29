-- Add avatar_url column to public.profiles safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
