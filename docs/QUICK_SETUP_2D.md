# Quick Setup: 2D Avatar Generation

## 🚀 Setup Checklist

### 1. Get Banana API Credentials
- [ ] Go to https://app.banana.dev/
- [ ] Sign up/login
- [ ] Create a new project
- [ ] Deploy Gemini model (or use existing)
- [ ] Copy API Key
- [ ] Copy Model Key

### 2. Update Environment Variables

Edit `chromafit/.env.local`:

```env
# Add these lines at the end:
NEXT_PUBLIC_GEMINI_API_URL=https://api.banana.dev/start/v4
GEMINI_API_KEY=YOUR_BANANA_API_KEY
GEMINI_MODEL_KEY=YOUR_GEMINI_MODEL_KEY
```

### 3. Verify Supabase Setup

Run in Supabase SQL Editor:
```sql
-- Check avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

### 4. Test the Feature

```bash
# Start dev server
cd chromafit
npm run dev
```

Visit: http://localhost:3000/profile

### 5. Upload Test Photo

Requirements:
- ✅ Min 512x512 pixels
- ✅ Max 10MB
- ✅ JPEG, PNG, or WebP format
- ✅ Clear face visibility

## 🧪 Testing Flow

1. **Upload Photo**
   - Click "Upload Photo" button
   - Select a clear face photo
   - Wait for upload (~1-2 sec)

2. **Generate 2D Avatar**
   - Watch "Generating 2D..." indicator
   - Wait 5-15 seconds for API response
   - See generated 2D avatar in preview

3. **Save Profile**
   - Click "Save Changes"
   - Verify success message
   - Check avatar appears in profile

## ⚠️ Common Issues

### Issue: "Gemini API is not configured"
**Solution**: Add API keys to `.env.local` and restart dev server

### Issue: "Failed to generate 2D avatar"
**Solutions**:
- Check Banana API is active
- Verify API keys are correct
- Check API quota/limits
- Original photo will be used as fallback

### Issue: Photo upload fails
**Solutions**:
- Run `supabase/complete-setup.sql`
- Check file size < 10MB
- Verify image format

## 📝 Environment Variables Template

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API (NEW - add these)
NEXT_PUBLIC_GEMINI_API_URL=https://api.banana.dev/start/v4
GEMINI_API_KEY=your_banana_api_key_here
GEMINI_MODEL_KEY=your_gemini_model_key_here
```

## 🎯 Expected Behavior

### Success Flow:
1. User uploads photo ✅
2. Photo uploaded to Supabase ✅
3. API called to generate 2D avatar ✅
4. 2D avatar uploaded to Supabase ✅
5. Profile updated with 2D avatar URL ✅
6. Success message shown ✅

### Fallback Flow (if API fails):
1. User uploads photo ✅
2. Photo uploaded to Supabase ✅
3. API call fails ⚠️
4. Error message shown (but continues)
5. Profile updated with original photo ✅
6. User can still use the app ✅

## 🔍 Verification

### Check in Supabase Dashboard:

1. **Storage → avatars bucket**
   - Should see uploaded photos
   - Filenames: `user_id-timestamp.ext`
   - 2D avatars: `user_id-2d-timestamp.png`

2. **Table Editor → profiles**
   - `avatar_photo_url` field populated
   - URL points to Supabase storage

3. **Logs → Edge Functions** (if using)
   - API call logs
   - Success/error responses

## 📞 Support

If issues persist:
1. Check console logs (browser DevTools)
2. Check terminal output (Next.js server)
3. Review `docs/2D_AVATAR_GENERATION.md` for detailed troubleshooting
4. Test API directly with curl/Postman

---

**Ready to test?** Make sure you have:
- ✅ Banana API credentials
- ✅ Updated `.env.local`
- ✅ Dev server running
- ✅ Test photo ready (512x512+, <10MB)
