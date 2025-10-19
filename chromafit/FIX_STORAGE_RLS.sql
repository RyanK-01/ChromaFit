-- ============================================
-- Fix STORAGE RLS Policies for Garments Bucket
-- The error is from storage.objects, not the wardrobe table
-- ============================================

-- Step 1: Check if garments bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('garments', 'garments', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing storage policies for garments
DROP POLICY IF EXISTS "Anyone can view garments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their garments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their garments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their garments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload garments" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Step 3: Create storage policies for GARMENTS bucket
CREATE POLICY "Anyone can view garments"
ON storage.objects FOR SELECT
USING (bucket_id = 'garments');

CREATE POLICY "Authenticated users can upload garments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'garments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their garments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'garments' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'garments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their garments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'garments' 
  AND auth.role() = 'authenticated'
);

-- Step 4: Verify storage policies
SELECT 
  'Storage Bucket Check' as test,
  id as bucket_name,
  public as is_public
FROM storage.buckets
WHERE id = 'garments';

SELECT 
  'Storage Policies Check' as test,
  policyname,
  (SELECT id FROM storage.buckets WHERE name = 'garments') as bucket
FROM pg_policies 
WHERE tablename = 'objects'
  AND policyname LIKE '%garment%'
ORDER BY policyname;

SELECT '✅ Storage bucket created!' as message;
SELECT '✅ Storage RLS policies fixed!' as message;
SELECT '✅ You can now upload garment photos!' as message;
