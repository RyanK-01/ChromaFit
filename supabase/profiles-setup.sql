-- ============================================
-- ChromaFit Database Tables and RLS Policies
-- Run this in Supabase SQL Editor AFTER storage-setup.sql
-- ============================================

-- Step 1: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_photo_url text,
  body_metrics jsonb,
  smpl_params jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 2: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Step 4: Create RLS policies for profiles table
-- Allow users to view all profiles (for social features)
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create or replace the trigger function for new users
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

-- Step 6: Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create profiles for existing users (if any don't have one)
INSERT INTO public.profiles (user_id, display_name, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  now(),
  now()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'Profiles table and RLS policies created successfully!' AS status;
SELECT 'Total users: ' || COUNT(*)::text AS user_count FROM auth.users;
SELECT 'Total profiles: ' || COUNT(*)::text AS profile_count FROM public.profiles;
