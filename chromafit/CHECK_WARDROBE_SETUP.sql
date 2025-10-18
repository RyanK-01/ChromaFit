-- Check RLS Policies for Wardrobe
-- Run this to see what's configured

-- 1. Check if table exists
SELECT 
  'Table exists' as check_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'wardrobe'
  ) as result;

-- 2. Check RLS is enabled
SELECT 
  'RLS enabled' as check_name,
  tablename,
  rowsecurity as result
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'wardrobe';

-- 3. List all policies
SELECT 
  'Policies' as check_name,
  policyname as policy_name,
  cmd as operation,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'wardrobe'
ORDER BY policyname;

-- 4. Check your authentication
SELECT 
  'Your user ID' as check_name,
  auth.uid() as result;

-- 5. Test if you can select from wardrobe
SELECT 
  'Can select' as check_name,
  COUNT(*) as your_items_count
FROM public.wardrobe
WHERE user_id = auth.uid();

-- 6. Check table structure
SELECT 
  'Table columns' as check_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'wardrobe'
ORDER BY ordinal_position;
