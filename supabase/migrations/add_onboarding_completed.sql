-- Add onboarding_completed column to profiles
DO $$ 
BEGIN
  -- Add onboarding_completed column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
    RAISE NOTICE '✅ Added onboarding_completed column to profiles table';
  ELSE
    RAISE NOTICE 'ℹ️  Column onboarding_completed already exists';
  END IF;
END $$;