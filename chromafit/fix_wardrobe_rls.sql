-- ============================================
-- Fix RLS Policies for Wardrobe Uploads
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Ensure wardrobe table exists
CREATE TABLE IF NOT EXISTS public.wardrobe (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  original_photo_url text not null,
  ai_generated_url text,
  brand text,
  size text,
  color text,
  material text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 2: Enable RLS
ALTER TABLE public.wardrobe ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own wardrobe" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.wardrobe;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.wardrobe;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.wardrobe;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.wardrobe;

-- Step 4: Create new comprehensive policies
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

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS wardrobe_user_id_idx ON public.wardrobe(user_id);
CREATE INDEX IF NOT EXISTS wardrobe_category_idx ON public.wardrobe(category);

-- Step 6: Verify setup
SELECT 
  'Table Check' as test,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'wardrobe'
  ) as table_exists;

SELECT 
  'RLS Check' as test,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'wardrobe';

SELECT 
  'Policies Check' as test,
  policyname,
  cmd as command_type
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'wardrobe'
ORDER BY policyname;

-- Step 7: Test your user permissions
SELECT 
  'Your User ID' as info,
  auth.uid() as your_user_id;

SELECT 
  'Test Insert Permission' as info,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ You are authenticated - INSERT should work'
    ELSE '❌ Not authenticated - please log in'
  END as status;

SELECT '✅ Wardrobe RLS policies configured!' as message;
SELECT '✅ You can now upload items to your wardrobe!' as message;
