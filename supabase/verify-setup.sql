-- ============================================
-- Verification Script - Check if everything is set up
-- Run this to verify your ChromaFit database setup
-- ============================================

-- Check 1: Storage Buckets
SELECT 
  'Storage Buckets Check' as check_name,
  COUNT(*) as bucket_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS'
    ELSE '❌ FAIL - Missing buckets'
  END as status
FROM storage.buckets
WHERE id IN ('avatars', 'garments', 'tryons');

-- Check 2: Storage Policies
SELECT 
  'Storage Policies Check' as check_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ PASS'
    ELSE '⚠️ WARN - Some policies missing'
  END as status
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- Check 3: Profiles Table
SELECT 
  'Profiles Table Check' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check 4: Profiles RLS Policies
SELECT 
  'Profiles RLS Policies Check' as check_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS'
    ELSE '❌ FAIL - Missing RLS policies'
  END as status
FROM pg_policies
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- Check 5: Your User Profile
SELECT 
  'Your Profile Check' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
    THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run profiles-setup.sql'
  END as status;

-- Check 6: List Your Profile Data
SELECT 
  user_id,
  display_name,
  avatar_photo_url,
  created_at,
  updated_at,
  CASE 
    WHEN avatar_photo_url IS NOT NULL THEN '✅ Photo uploaded'
    ELSE '⚠️ No photo yet'
  END as photo_status
FROM public.profiles
WHERE user_id = auth.uid();

-- Summary
SELECT '============ SETUP SUMMARY ============' as summary;
SELECT 
  (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('avatars', 'garments', 'tryons')) as storage_buckets,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') as storage_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') as profile_policies,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles;
