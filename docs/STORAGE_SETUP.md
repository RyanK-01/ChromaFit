# Supabase Storage Setup for ChromaFit

This guide will help you set up the storage buckets needed for profile photos and other images.

## Option 1: Using Supabase Dashboard (Easiest)

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create the following buckets:

#### Avatars Bucket
- **Name:** `avatars`
- **Public:** ✅ Yes (check the box)
- Click **Create bucket**

#### Garments Bucket  
- **Name:** `garments`
- **Public:** ✅ Yes (check the box)
- Click **Create bucket**

#### Try-ons Bucket
- **Name:** `tryons`
- **Public:** ✅ Yes (check the box)
- Click **Create bucket**

### Step 2: Set Up Storage Policies

For each bucket, you need to set up policies to allow users to upload and manage their files.

#### For `avatars` bucket:

1. Click on the `avatars` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Choose **For full customization** → **Get started**

Add these policies:

**Policy 1: Allow public read access**
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy 2: Allow users to upload their avatars**
```sql
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Allow users to update their avatars**
```sql
CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Allow users to delete their avatars**
```sql
CREATE POLICY "Users can delete their avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Repeat similar policies for `garments` and `tryons` buckets (just replace 'avatars' with the bucket name).

## Option 2: Using SQL Editor (Faster)

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **New Query**
3. Paste and run this SQL:

```sql
-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('garments', 'garments', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('tryons', 'tryons', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY IF NOT EXISTS "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for garments
CREATE POLICY IF NOT EXISTS "Anyone can view garments"
ON storage.objects FOR SELECT
USING (bucket_id = 'garments');

CREATE POLICY IF NOT EXISTS "Users can upload their garments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'garments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their garments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'garments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their garments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'garments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for tryons
CREATE POLICY IF NOT EXISTS "Anyone can view tryons"
ON storage.objects FOR SELECT
USING (bucket_id = 'tryons');

CREATE POLICY IF NOT EXISTS "Users can upload their tryons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tryons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their tryons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tryons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their tryons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tryons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

4. Click **Run** to execute the SQL

## Verify Setup

1. Go to **Storage** in Supabase Dashboard
2. You should see three buckets: `avatars`, `garments`, `tryons`
3. Each bucket should have a green "Public" badge
4. Click on each bucket and go to **Policies** tab
5. Verify that 4 policies exist for each bucket

## Testing

1. Go to your ChromaFit app: http://localhost:3000
2. Sign in to your account
3. Go to **My Profile**
4. Try uploading a profile photo
5. The photo should upload successfully and display in the profile

## Troubleshooting

### Error: "new row violates row-level security policy"
- Make sure you've set up all the storage policies correctly
- Check that the buckets are marked as public

### Error: "bucket does not exist"
- Verify the bucket names are exactly: `avatars`, `garments`, `tryons`
- Make sure they're created in the Storage section

### Photo not uploading
- Check browser console for errors
- Verify your `.env.local` has the correct Supabase URL and keys
- Make sure the image is under 5MB

### Photo not displaying
- Check if the URL in the database starts with your Supabase storage URL
- Verify the bucket is set to public
- Check browser console for CORS or network errors

## Next Steps

Once storage is set up, you can:
1. Upload profile photos
2. Add garments with images
3. Store virtual try-on results
4. Build the wardrobe management feature

---

**Need Help?** Check the Supabase documentation: https://supabase.com/docs/guides/storage
