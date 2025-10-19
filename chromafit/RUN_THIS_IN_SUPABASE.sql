-- ========================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ========================================
-- This ensures the profiles table has all required columns for onboarding

-- 1. Add height and weight columns if they don't exist
DO $$ 
BEGIN
  -- Add height column (in cm)
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'height'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN height integer;
    RAISE NOTICE '✅ Added height column to profiles table';
  ELSE
    RAISE NOTICE 'ℹ️  Column height already exists';
  END IF;

  -- Add weight column (in kg)
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'weight'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN weight integer;
    RAISE NOTICE '✅ Added weight column to profiles table';
  ELSE
    RAISE NOTICE 'ℹ️  Column weight already exists';
  END IF;

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

-- 2. Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check current profile structure
SELECT * FROM profiles LIMIT 1;
