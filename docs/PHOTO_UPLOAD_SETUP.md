# Photo Upload Setup for 3D Avatar Generation

## Overview
This guide will help you set up the photo upload feature that captures user photos for 3D avatar generation in ChromaFit.

## Prerequisites
- Supabase project created
- Environment variables configured in `.env.local`
- Development server running

## Step 1: Run the Updated SQL Script

1. Open your Supabase dashboard: https://app.supabase.com
2. Navigate to your ChromaFit project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the **entire contents** of `supabase/complete-setup.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Wait for all statements to execute successfully

## Step 2: Verify Storage Buckets

After running the SQL, verify your storage setup:

1. In Supabase dashboard, go to **Storage**
2. You should see 3 buckets:
   - `avatars` (public)
   - `garments` (public)
   - `tryons` (public)
3. Click on each bucket and check the **Policies** tab
4. Each bucket should have 4 policies:
   - SELECT: Anyone can view
   - INSERT: Authenticated users can upload
   - UPDATE: Authenticated users can update
   - DELETE: Authenticated users can delete

## Step 3: Test Photo Upload

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Log in or sign up with a test account

4. Go to **My Profile** from the dashboard

5. Upload a test photo:
   - Click "Upload Photo"
   - Select a clear face photo
   - Minimum 512x512 pixels recommended
   - Max 10MB file size
   - Supported formats: JPEG, PNG, WebP

6. Click "Save Changes"

7. Check for success message

## Photo Requirements for 3D Avatar Generation

For best results with 3D avatar generation:

### ✅ Good Photos:
- Clear, well-lit face
- Front-facing pose
- Neutral expression
- Plain background
- Minimum 512x512 pixels
- High resolution (1024x1024+ ideal)
- No sunglasses or face coverings
- Natural lighting

### ❌ Avoid:
- Blurry or low-resolution images
- Extreme angles or poses
- Heavy filters or edits
- Poor lighting
- Obstructed face
- Group photos

## Features Implemented

### Enhanced Photo Validation
- File type validation (JPEG, PNG, WebP only)
- File size validation (10MB max)
- Image dimension validation (512x512 minimum)
- Real-time preview
- Automatic old photo cleanup

### Upload Flow
1. User selects photo
2. Client validates file type and size
3. Image dimensions are checked
4. Preview is shown
5. On save, old avatar is deleted
6. New photo is uploaded to Supabase Storage
7. Public URL is saved to database
8. Success confirmation shown

### Database Integration
- Photo URL stored in `profiles.avatar_photo_url`
- Linked to user via `user_id`
- Used for 3D avatar generation in later steps

## Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** Make sure you ran the updated `complete-setup.sql` script completely. The new policies allow any authenticated user to upload.

### Error: "Image size should be less than 10MB"
**Solution:** Compress or resize your image before uploading.

### Error: "For best 3D avatar results, please use an image at least 512x512 pixels"
**Solution:** Use a higher resolution image.

### Photo not appearing after upload
1. Check browser console for errors
2. Verify the photo uploaded to Storage:
   - Go to Supabase dashboard → Storage → avatars
   - You should see files named like `{user_id}-{timestamp}.{ext}`
3. Check the database:
   - Go to Supabase dashboard → Table Editor → profiles
   - Verify `avatar_photo_url` is populated

### Still having issues?
Use the diagnostic page:
1. Navigate to http://localhost:3000/diagnostic
2. Check all 5 system checks
3. All should show green checkmarks
4. If any are red, follow the error messages

## Next Steps

Once photo upload is working:
1. ✅ Photo upload for 3D avatar - **COMPLETE**
2. 🔄 Build wardrobe management (add/view garments)
3. 🔄 Integrate body extraction API
4. 🔄 Build 3D avatar viewer
5. 🔄 Implement virtual try-on feature

## Technical Details

### Storage Structure
```
avatars/
  ├── {user_id}-{timestamp}.jpg
  ├── {user_id}-{timestamp}.png
  └── ...
```

### Database Schema
```sql
profiles
  ├── user_id (PK)
  ├── display_name
  ├── avatar_photo_url  ← Photo URL stored here
  ├── body_metrics
  ├── smpl_params
  ├── created_at
  └── updated_at
```

### API Endpoints Used
- `supabase.auth.getUser()` - Get current user
- `supabase.storage.from('avatars').upload()` - Upload photo
- `supabase.storage.from('avatars').remove()` - Delete old photo
- `supabase.from('profiles').upsert()` - Save profile with photo URL

## Security Notes

- All uploads require authentication
- File type validation prevents non-image uploads
- File size limits prevent storage abuse
- Public URLs are read-only
- Users can only manage their own photos
- Row Level Security (RLS) enforced on all operations
