-- supabase/migrations/09_atomic_billing.sql

-- Drop the function if it already exists to allow safe replays
DROP FUNCTION IF EXISTS public.decrement_unified_usage(UUID, INT);

-- Atomic decrement function for usage limits
CREATE OR REPLACE FUNCTION public.decrement_unified_usage(user_id_val UUID, cost_val INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available INT;
  speech INT;
  ppt INT;
  viva INT;
  rem INT;
BEGIN
  -- 1. Select the current row with FOR UPDATE lock to prevent concurrent modifications
  SELECT 
    COALESCE(speech_analysis_count, 0),
    COALESCE(ppt_analysis_count, 0),
    COALESCE(viva_sessions_count, 0)
  INTO speech, ppt, viva
  FROM public.usage_limits
  WHERE user_id = user_id_val 
  FOR UPDATE;

  -- 2. Check if the user exists in usage_limits
  IF speech IS NULL AND ppt IS NULL AND viva IS NULL THEN
    RETURN FALSE;
  END IF;

  available := speech + ppt + viva;
  
  -- 3. Check if they have enough credits
  IF available < cost_val THEN
    RETURN FALSE;
  END IF;

  -- 4. Calculate deductions logically without going below zero
  rem := cost_val;
  
  IF speech >= rem THEN
    speech := speech - rem;
    rem := 0;
  ELSE
    rem := rem - speech;
    speech := 0;
  END IF;

  IF rem > 0 THEN
    IF ppt >= rem THEN
      ppt := ppt - rem;
      rem := 0;
    ELSE
      rem := rem - ppt;
      ppt := 0;
    END IF;
  END IF;

  IF rem > 0 THEN
    viva := viva - rem;
    rem := 0;
  END IF;

  -- 5. Commit the new totals back to the database
  UPDATE public.usage_limits
  SET 
    speech_analysis_count = speech,
    ppt_analysis_count = ppt,
    viva_sessions_count = viva
  WHERE user_id = user_id_val;

  RETURN TRUE;
END;
$$;
