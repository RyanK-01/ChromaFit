-- Add height and weight columns to profiles
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
END $$;