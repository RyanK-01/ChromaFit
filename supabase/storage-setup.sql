-- ============================================
-- ChromaFit Storage Buckets and Policies Setup
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('garments', 'garments', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('tryons', 'tryons', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
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

-- Step 3: Create storage policies for AVATARS bucket
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

-- Step 4: Create storage policies for GARMENTS bucket
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

-- Step 5: Create storage policies for TRYONS bucket
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

-- Success message
SELECT 'Storage buckets and policies created successfully!' AS status;
