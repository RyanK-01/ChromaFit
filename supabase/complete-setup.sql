-- ============================================
-- ChromaFit Complete Database Setup
-- Run this ENTIRE script in ONE go in Supabase SQL Editor
-- This combines storage, profiles, and verification
-- ============================================

-- ============================================
-- PART 1: STORAGE SETUP
-- ============================================

-- Step 1: Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('garments', 'garments', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('tryons', 'tryons', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their avatar" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view garments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their garments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their garments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their garments" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view tryons" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their tryons" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their tryons" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their tryons" ON storage.objects;

-- Step 3: Create storage policies for AVATARS
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 4: Create storage policies for GARMENTS
CREATE POLICY "Anyone can view garments"
ON storage.objects FOR SELECT
USING (bucket_id = 'garments');

CREATE POLICY "Users can upload their garments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'garments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their garments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'garments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their garments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'garments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Create storage policies for TRYONS
CREATE POLICY "Anyone can view tryons"
ON storage.objects FOR SELECT
USING (bucket_id = 'tryons');

CREATE POLICY "Users can upload their tryons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tryons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their tryons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tryons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their tryons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tryons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- PART 2: PROFILES TABLE SETUP
-- ============================================

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_photo_url text,
  body_metrics jsonb,
  smpl_params jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing profile policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Step 4: Create profile RLS policies
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;

-- Step 6: Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create profiles for existing users
INSERT INTO public.profiles (user_id, display_name, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  now(),
  now()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- PART 3: VERIFICATION
-- ============================================

-- Show results
SELECT '✅ Storage buckets created' as status;
SELECT '✅ Storage policies created' as status;
SELECT '✅ Profiles table created' as status;
SELECT '✅ RLS policies created' as status;
SELECT '✅ Trigger created for new users' as status;

-- Show summary
SELECT 
  'Summary' as info,
  (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('avatars', 'garments', 'tryons')) as buckets,
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as profile_policies;

-- Show your profile
SELECT 
  'Your Profile' as info,
  user_id,
  display_name,
  CASE 
    WHEN avatar_photo_url IS NOT NULL THEN '✅ Has photo'
    ELSE '⚠️ No photo yet'
  END as photo_status
FROM public.profiles
WHERE user_id = auth.uid();

SELECT '🎉 Setup complete! You can now upload photos in the profile page.' as final_message;
