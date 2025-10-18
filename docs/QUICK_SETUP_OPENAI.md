# Quick Setup: 2D Avatar Generation with OpenAI

## 🚀 Setup Checklist

### 1. Get OpenAI API Key
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Sign up/login to OpenAI account
- [ ] Click "Create new secret key"
- [ ] Copy the API key (starts with `sk-`)
- [ ] **Important**: Save it securely (you won't see it again!)

### 2. Update Environment Variables

Edit `chromafit/.env.local`:

```env
# Add this line:
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Verify Supabase Setup

Run in Supabase SQL Editor:
```sql
-- Check avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

### 4. Restart Development Server

```bash
# Stop current server (Ctrl+C)
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

2. **Generate 2D Avatar with OpenAI**
   - Watch "Generating 2D..." indicator
   - **Two-step process**:
     - Step 1: GPT-4 Vision analyzes your photo (~3-5 sec)
     - Step 2: DALL-E 3 generates 2D avatar (~10-20 sec)
   - Total time: ~15-25 seconds
   - See generated 2D avatar in preview

3. **Save Profile**
   - Avatar automatically downloaded and saved to Supabase
   - Click "Save Changes"
   - Verify success message
   - Check avatar appears in profile

## 🎯 How It Works

### Two-Generation Approaches:

#### 1. **GPT-4 Vision + DALL-E 3** (Default, Better Results)
```
Photo Upload → GPT-4 Vision analyzes → 
Creates detailed description → DALL-E 3 generates → 
2D Avatar created
```

**Pros:**
- More accurate to original photo
- Better understanding of facial features
- Higher quality results

**Cons:**
- Takes longer (~15-25 seconds)
- Uses more API credits
- Requires GPT-4 Vision access

#### 2. **Basic DALL-E 3** (Fallback)
```
Photo Upload → Generic prompt → 
DALL-E 3 generates → 2D Avatar created
```

**Pros:**
- Faster (~10-15 seconds)
- Uses fewer API credits
- Simpler approach

**Cons:**
- Less accurate to original photo
- Generic results

## ⚠️ Common Issues

### Issue: "OpenAI API is not configured"
**Solution**: Add `OPENAI_API_KEY` to `.env.local` and restart server

### Issue: "Insufficient credits" or rate limit errors
**Solutions**:
- Check your OpenAI account has credits
- Wait a few minutes and try again
- Upgrade your OpenAI plan if needed

### Issue: "Failed to generate 2D avatar"
**Solutions**:
- Check OpenAI API key is valid
- Verify you have GPT-4 and DALL-E 3 access
- Check API status at https://status.openai.com/
- Original photo will be used as fallback

### Issue: Photo upload fails
**Solutions**:
- Run `supabase/complete-setup.sql`
- Check file size < 10MB
- Verify image format

## 💰 Cost Information

### OpenAI API Pricing (as of 2025):

#### GPT-4 Vision:
- ~$0.01 per image analysis
- Used for understanding the photo

#### DALL-E 3:
- **Standard quality**: ~$0.040 per image (1024x1024)
- **HD quality**: ~$0.080 per image (1024x1024)
- We use **HD quality** when Vision is enabled for best results

#### Estimated Cost Per Avatar:
- **With Vision** (default): ~$0.09 per avatar ($0.01 + $0.08)
- **Without Vision**: ~$0.04 per avatar

**Example**: 100 avatars = ~$9 with Vision, ~$4 without

## 📝 Environment Variables Template

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API (NEW - add this)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## 🎯 Expected Behavior

### Success Flow:
1. User uploads photo ✅
2. Photo uploaded to Supabase ✅
3. GPT-4 Vision analyzes photo (3-5 sec) ✅
4. DALL-E 3 generates 2D avatar (10-20 sec) ✅
5. 2D avatar downloaded and uploaded to Supabase ✅
6. Profile updated with 2D avatar URL ✅
7. Success message shown ✅

### Fallback Flow (if Vision fails):
1. User uploads photo ✅
2. Photo uploaded to Supabase ✅
3. Vision analysis fails ⚠️
4. Falls back to basic DALL-E generation ✅
5. 2D avatar generated (10-15 sec) ✅
6. Profile updated ✅

### Ultimate Fallback (if all fails):
1. User uploads photo ✅
2. Photo uploaded to Supabase ✅
3. All generation attempts fail ⚠️
4. Error message shown
5. **Original photo used** ✅
6. User can still use the app ✅

## 🔍 Verification

### Check in Supabase Dashboard:

1. **Storage → avatars bucket**
   - Original photos: `user_id-timestamp.ext`
   - 2D avatars: `user_id-2d-timestamp.png`

2. **Table Editor → profiles**
   - `avatar_photo_url` field populated
   - URL points to 2D avatar in Supabase storage

3. **Browser Console**
   - Should see: "Generating 2D avatar with OpenAI..."
   - Should see: "2D avatar generated successfully with OpenAI"

## 🎨 Customization Options

### Change Generation Style

In profile page, modify the API call:
```typescript
style: 'realistic',  // or 'illustration', 'cartoon'
useVision: true      // or false for faster, cheaper generation
```

### Disable Vision (Faster/Cheaper)

```typescript
useVision: false  // Skip GPT-4 Vision, go straight to DALL-E
```

### Change Quality

In `generate-2d-avatar/route.ts`:
```typescript
quality: 'standard'  // or 'hd' for better quality
```

## 📞 Support & Troubleshooting

### Check Logs:
1. **Browser Console** (F12): Client-side errors
2. **Terminal**: Server-side logs
3. **OpenAI Dashboard**: API usage and errors

### Common Error Messages:

| Error | Meaning | Solution |
|-------|---------|----------|
| `invalid_api_key` | API key is wrong | Check `.env.local` |
| `insufficient_quota` | Out of credits | Add credits to OpenAI account |
| `rate_limit_exceeded` | Too many requests | Wait and try again |
| `model_not_found` | No access to model | Upgrade OpenAI plan |

## 🔗 Useful Links

- **OpenAI Platform**: https://platform.openai.com/
- **API Keys**: https://platform.openai.com/api-keys
- **Usage Dashboard**: https://platform.openai.com/usage
- **API Status**: https://status.openai.com/
- **Pricing**: https://openai.com/pricing
- **Documentation**: https://platform.openai.com/docs

---

**Ready to test?** Make sure you have:
- ✅ OpenAI API key with GPT-4 Vision and DALL-E 3 access
- ✅ Updated `.env.local`
- ✅ Dev server restarted
- ✅ Test photo ready (512x512+, <10MB)
- ✅ Some credits in your OpenAI account (~$0.09 per test)
