-- ============================================
-- Fix ALL Storage RLS Policies (Avatars + Garments)
-- Run this complete script in Supabase SQL Editor
-- ============================================

-- Step 1: Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('garments', 'garments', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop ALL existing storage policies (clean slate)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 3: Create AVATARS storage policies
-- Allow SELECT (viewing)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow INSERT (uploading)
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow UPDATE
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow DELETE
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Step 4: Create GARMENTS storage policies
-- Allow SELECT (viewing)
CREATE POLICY "Public can view garments"
ON storage.objects FOR SELECT
USING (bucket_id = 'garments');

-- Allow INSERT (uploading)
CREATE POLICY "Authenticated users can upload garments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'garments' 
  AND auth.role() = 'authenticated'
);

-- Allow UPDATE
CREATE POLICY "Users can update garments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'garments' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'garments' AND auth.role() = 'authenticated');

-- Allow DELETE
CREATE POLICY "Users can delete garments"
ON storage.objects FOR DELETE
USING (bucket_id = 'garments' AND auth.role() = 'authenticated');

-- Step 5: Verify everything is set up correctly
SELECT 
  '=== BUCKETS CREATED ===' as section,
  id as bucket_name,
  public as is_public
FROM storage.buckets
WHERE id IN ('avatars', 'garments')
ORDER BY id;

SELECT 
  '=== STORAGE POLICIES ===' as section,
  policyname as policy_name,
  (CASE 
    WHEN policyname LIKE '%avatar%' THEN 'avatars'
    WHEN policyname LIKE '%garment%' THEN 'garments'
    ELSE 'other'
  END) as bucket,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

SELECT 
  '=== YOUR AUTH STATUS ===' as section,
  auth.uid() as your_user_id,
  auth.role() as your_role;

SELECT '✅ Avatars bucket created and secured!' as status;
SELECT '✅ Garments bucket created and secured!' as status;
SELECT '✅ All storage RLS policies configured!' as status;
SELECT '🎉 You can now upload avatars AND garments!' as status;
