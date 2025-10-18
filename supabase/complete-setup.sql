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
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

-- Step 4: Create storage policies for GARMENTS
CREATE POLICY "Anyone can view garments"
ON storage.objects FOR SELECT
USING (bucket_id = 'garments');

CREATE POLICY "Users can upload their garments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'garments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their garments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'garments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their garments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'garments' 
  AND auth.uid() IS NOT NULL
);

-- Step 5: Create storage policies for TRYONS
CREATE POLICY "Anyone can view tryons"
ON storage.objects FOR SELECT
USING (bucket_id = 'tryons');

CREATE POLICY "Users can upload their tryons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tryons' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their tryons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tryons' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their tryons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tryons' 
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- PART 2: PROFILES TABLE SETUP
-- ============================================

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_photo_url text,
  realistic_photo_url text,
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
-- PART 3: WARDROBE TABLE SETUP
-- ============================================

-- Step 1: Create wardrobe table
CREATE TABLE IF NOT EXISTS public.wardrobe (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories', 'other')),
  original_photo_url text not null,
  ai_generated_url text,
  brand text,
  size text,
  color text,
  material text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 2: Enable RLS on wardrobe
ALTER TABLE public.wardrobe ENABLE ROW LEVEL SECURITY;

-- Step 3: Create wardrobe RLS policies
DROP POLICY IF EXISTS "Users can view their own wardrobe" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON public.wardrobe;

CREATE POLICY "Users can view their own wardrobe"
ON public.wardrobe
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items"
ON public.wardrobe
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items"
ON public.wardrobe
FOR DELETE
USING (auth.uid() = user_id);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS wardrobe_user_id_idx ON public.wardrobe(user_id);
CREATE INDEX IF NOT EXISTS wardrobe_category_idx ON public.wardrobe(category);
CREATE INDEX IF NOT EXISTS wardrobe_created_at_idx ON public.wardrobe(created_at DESC);

-- ============================================
-- PART 4: STYLED OUTFITS TABLE SETUP
-- ============================================

-- Step 1: Create styled_outfits table
CREATE TABLE IF NOT EXISTS public.styled_outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  environment_type text check (environment_type in ('office', 'school', 'gym', 'casual', 'formal')),
  occasion_type text check (occasion_type in ('party', 'date', 'wedding', 'interview', 'meeting', 'workout', 'everyday')),
  styled_image_url text not null,
  wardrobe_items uuid[] default '{}',
  prompt_used text,
  rating integer check (rating >= 1 and rating <= 5),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 2: Enable RLS on styled_outfits
ALTER TABLE public.styled_outfits ENABLE ROW LEVEL SECURITY;

-- Step 3: Create styled_outfits RLS policies
DROP POLICY IF EXISTS "Users can view their own styled outfits" ON public.styled_outfits;
DROP POLICY IF EXISTS "Users can insert their own styled outfits" ON public.styled_outfits;
DROP POLICY IF EXISTS "Users can update their own styled outfits" ON public.styled_outfits;
DROP POLICY IF EXISTS "Users can delete their own styled outfits" ON public.styled_outfits;

CREATE POLICY "Users can view their own styled outfits"
ON public.styled_outfits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own styled outfits"
ON public.styled_outfits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own styled outfits"
ON public.styled_outfits
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own styled outfits"
ON public.styled_outfits
FOR DELETE
USING (auth.uid() = user_id);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS styled_outfits_user_id_idx ON public.styled_outfits(user_id);
CREATE INDEX IF NOT EXISTS styled_outfits_environment_idx ON public.styled_outfits(environment_type);
CREATE INDEX IF NOT EXISTS styled_outfits_occasion_idx ON public.styled_outfits(occasion_type);
CREATE INDEX IF NOT EXISTS styled_outfits_created_at_idx ON public.styled_outfits(created_at DESC);

-- ============================================
-- PART 5: VERIFICATION
-- ============================================

-- Show results
SELECT '✅ Storage buckets created' as status;
SELECT '✅ Storage policies created' as status;
SELECT '✅ Profiles table created' as status;
SELECT '✅ Wardrobe table created' as status;
SELECT '✅ Styled outfits table created' as status;
SELECT '✅ RLS policies created' as status;
SELECT '✅ Trigger created for new users' as status;

-- Show summary
SELECT 
  'Summary' as info,
  (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('avatars', 'garments', 'tryons')) as buckets,
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM public.wardrobe) as wardrobe_items,
  (SELECT COUNT(*) FROM public.styled_outfits) as styled_outfits,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as profile_policies;

-- Show your profile
SELECT 
  'Your Profile' as info,
  user_id,
  display_name,
  CASE 
    WHEN avatar_photo_url IS NOT NULL THEN '✅ Has photo'
    ELSE '⚠️ No photo yet'
  END as photo_status,
  CASE 
    WHEN realistic_photo_url IS NOT NULL THEN '✅ Has realistic avatar'
    ELSE '⚠️ No realistic avatar yet'
  END as realistic_status
FROM public.profiles
WHERE user_id = auth.uid();

SELECT '🎉 Setup complete! You can now use all ChromaFit features.' as final_message;
