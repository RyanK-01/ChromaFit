# 2D Avatar Generation Feature

## Overview
ChromaFit now uses AI-powered 2D avatar generation instead of 3D models. When users upload their photo, the system automatically generates a stylized 2D avatar using the Gemini API via Banana's image processing platform.

## How It Works

### 1. Photo Upload Flow
```
User uploads photo → Validate image → Upload to Supabase → 
Generate 2D avatar via Gemini API → Save 2D avatar → Update profile
```

### 2. Technical Architecture

#### Frontend (Profile Page)
- **Photo validation**: Min 512x512px, max 10MB
- **Upload progress**: Shows uploading and generating states
- **Real-time preview**: Updates with generated 2D avatar
- **Error handling**: Falls back to original photo if generation fails

#### API Route (`/api/generate-2d-avatar`)
- **Server-side processing**: Calls Gemini API securely
- **Handles authentication**: Uses service role key
- **Response processing**: Extracts generated image from API response
- **Error management**: Returns detailed error messages

#### Gemini Integration (`lib/api/gemini.ts`)
- **API client**: Makes requests to Banana's Gemini endpoint
- **Image processing**: Converts base64 to blob for storage
- **Configuration check**: Validates API keys before calling

## Setup Instructions

### Step 1: Get Banana API Credentials

1. Go to https://app.banana.dev/
2. Sign up for an account
3. Create a new project
4. Deploy or select the Gemini image generation model
5. Copy your API key and model key

### Step 2: Configure Environment Variables

Add to `chromafit/.env.local`:

```env
# Gemini API Configuration (via Banana)
NEXT_PUBLIC_GEMINI_API_URL=https://api.banana.dev/start/v4
GEMINI_API_KEY=your_banana_api_key_here
GEMINI_MODEL_KEY=your_gemini_model_key_here
```

### Step 3: Update Supabase Storage

The `avatars` bucket now stores both:
- **Original photos**: `user_id-timestamp.ext`
- **2D avatars**: `user_id-2d-timestamp.png`

No changes needed - existing storage policies work for both.

### Step 4: Test the Feature

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/profile

3. Upload a clear face photo (min 512x512px)

4. Wait for:
   - ✅ Photo upload (1-2 seconds)
   - ✅ 2D generation (5-15 seconds depending on API)
   - ✅ Profile update

5. Verify the 2D avatar appears in the preview

## API Specifications

### Request Format

**Endpoint**: `POST /api/generate-2d-avatar`

**Body**:
```json
{
  "photoUrl": "https://your-storage.com/photo.jpg",
  "userId": "uuid",
  "style": "realistic" // or "illustration", "cartoon"
}
```

**Response** (Success):
```json
{
  "success": true,
  "generatedImageUrl": "https://...",
  "message": "2D avatar generated successfully"
}
```

**Response** (Error):
```json
{
  "error": "Error message details"
}
```

### Banana API Call

**Endpoint**: `https://api.banana.dev/start/v4`

**Payload**:
```json
{
  "apiKey": "your_api_key",
  "modelKey": "your_model_key",
  "modelInputs": {
    "image_url": "photo_url",
    "style": "realistic",
    "user_id": "uuid",
    "prompt": "Generate a clean 2D avatar suitable for virtual fashion try-on",
    "output_format": "png"
  },
  "startOnly": false
}
```

## Features

### ✅ Implemented
- Photo upload with validation
- Automatic 2D avatar generation
- Progress indicators (uploading, generating)
- Error handling with fallback
- Base64 to blob conversion
- Supabase storage integration
- Profile database updates

### 🔄 Available Options
- **Style variations**: realistic, illustration, cartoon
- **Output format**: PNG (default)
- **Fallback**: Uses original photo if generation fails

### 🎨 Styling Use Cases
1. **Virtual Try-On**: Overlay garments on 2D avatar
2. **Outfit Recommendations**: Style matching based on avatar
3. **Size Fitting**: Visual representation for garment fit
4. **Personalization**: Custom styling suggestions

## Error Handling

### Common Errors

1. **"Gemini API is not configured"**
   - Solution: Add API keys to `.env.local`

2. **"Failed to generate 2D avatar"**
   - Solution: Check Banana API quota/status
   - Fallback: Original photo is used

3. **"Image size should be at least 512x512 pixels"**
   - Solution: Use higher resolution photo

4. **"Failed to upload photo"**
   - Solution: Check Supabase storage policies
   - Run `supabase/complete-setup.sql`

### Debugging

Enable console logging:
```typescript
// In profile page
console.log('Photo uploaded:', uploadedUrl)
console.log('2D avatar generated:', generated2DUrl)
```

Check API response:
```bash
# Browser DevTools → Network → generate-2d-avatar
```

## Performance

### Expected Timings
- Photo upload: 1-2 seconds
- 2D generation: 5-15 seconds (depends on Banana API)
- Total flow: 6-17 seconds

### Optimization Tips
1. **Cache generated avatars**: Don't regenerate on every save
2. **Background processing**: Generate asynchronously if needed
3. **Compression**: Optimize uploaded photos before sending
4. **CDN**: Use Supabase CDN for faster image delivery

## Security

### ✅ Implemented
- Server-side API key management
- Supabase RLS policies
- File type validation
- File size limits
- User authentication checks

### 🔒 Best Practices
- Never expose API keys in client code
- Validate all user inputs
- Use HTTPS for all API calls
- Implement rate limiting for API calls
- Monitor API usage and costs

## Troubleshooting

### Photo Won't Upload
1. Check file size < 10MB
2. Check file format (JPEG, PNG, WebP)
3. Check Supabase storage bucket exists
4. Verify RLS policies are active

### 2D Avatar Not Generating
1. Verify Banana API credentials
2. Check API quota/limits
3. Check console for error messages
4. Test API directly with Postman/curl

### Avatar Not Saving to Profile
1. Check Supabase connection
2. Verify profiles table has `avatar_photo_url` column
3. Check RLS policies allow updates
4. Verify user is authenticated

## Future Enhancements

### Potential Features
- [ ] Multiple style options in UI
- [ ] Side-by-side original vs 2D comparison
- [ ] Regenerate button for different styles
- [ ] Batch processing for multiple photos
- [ ] Avatar customization tools
- [ ] Quality settings (fast/standard/high)
- [ ] Progress percentage indicator
- [ ] Webhook support for async processing

## Cost Considerations

### Banana API Pricing
- Check current pricing at https://banana.dev/pricing
- Monitor API call volume
- Consider caching to reduce calls
- Implement usage limits per user

### Supabase Storage
- Each 2D avatar ~1-3MB
- Monitor storage quota
- Implement cleanup for old avatars
- Use CDN for bandwidth savings

## References

- **Banana Docs**: https://docs.banana.dev/
- **Gemini API**: Check Banana model marketplace
- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

**Last Updated**: After implementing 2D avatar generation
**Status**: Ready for testing with Banana API credentials
