# Virtual Try-On API Setup Guide

## Current Status

✅ **UI Complete** - Virtual try-on page with wardrobe selection
✅ **Database Integration** - Saves results to database
⏳ **API Integration** - Currently using mock data (needs real API)

## How to Add Real Virtual Try-On API

### Option 1: Nanobanana/Google Gemini (If Available)

1. **Get API Endpoint**: Find the actual Nanobanana virtual try-on endpoint
2. **Update .env.local**:
   ```env
   TRYON_API_URL=https://api.nanobanana.com/virtual-tryon
   NANOBANANA_API_KEY=your_actual_api_key_here
   ```

3. **The code is already set up** in `src/app/api/tryon-generate/route.ts`

### Option 2: Replicate (IDM-VTON or Similar)

Replicate has several virtual try-on models:

1. **Install Replicate SDK**:
   ```bash
   npm install replicate
   ```

2. **Add to .env.local**:
   ```env
   REPLICATE_API_TOKEN=your_replicate_token
   ```

3. **Update the API code**:
   ```typescript
   import Replicate from "replicate"
   
   const replicate = new Replicate({
     auth: process.env.REPLICATE_API_TOKEN,
   })

   const output = await replicate.run(
     "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
     {
       input: {
         human_img: avatarImageUrl,
         garm_img: garmentImageUrls[0],
         garment_des: "clothing item"
       }
     }
   )
   ```

### Option 3: Hugging Face API

1. **Get API Token** from https://huggingface.co/settings/tokens

2. **Add to .env.local**:
   ```env
   HUGGINGFACE_API_TOKEN=your_token_here
   ```

3. **Use a model like OOTDiffusion**:
   ```typescript
   const response = await fetch(
     "https://api-inference.huggingface.co/models/levihsu/OOTDiffusion",
     {
       headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}` },
       method: "POST",
       body: JSON.stringify({
         inputs: {
           person: avatarImageUrl,
           garment: garmentImageUrls[0]
         }
       }),
     }
   )
   ```

## Current Fallback Behavior

When no API is configured, the system:
- ✅ Shows your uploaded avatar as the "result"
- ✅ Generates realistic fit scores (70-95%)
- ✅ Saves to database
- ✅ Shows fit analysis

This allows you to test the complete flow without a real API.

## Testing Without API

The current setup will:
1. Accept your wardrobe selections
2. Call the API endpoint (which falls back to mock)
3. Show your avatar photo as the result
4. Display fit scores and analysis
5. Save everything to the database

## Popular Virtual Try-On APIs

| API | Pros | Cons | Cost |
|-----|------|------|------|
| **Replicate IDM-VTON** | Easy setup, good quality | Per-request cost | ~$0.01/image |
| **Hugging Face** | Free tier available | Rate limits | Free-Paid |
| **Virtry AI** | Professional quality | Expensive | Enterprise |
| **Google Imagen** | High quality | Limited access | Enterprise |

## Recommended: Start with Replicate

1. Sign up at https://replicate.com
2. Get API token
3. Add to `.env.local`: `REPLICATE_API_TOKEN=r8_...`
4. Update `src/app/api/tryon-generate/route.ts` to use Replicate
5. Test with your wardrobe items!

## Next Steps

1. **Choose an API** from the options above
2. **Get credentials** (API key/token)
3. **Update `.env.local`** with credentials
4. **Modify the API route** if needed (or ask for help)
5. **Test** the virtual try-on feature

---

**Note**: The mock fallback ensures the app works perfectly even without an API configured!
