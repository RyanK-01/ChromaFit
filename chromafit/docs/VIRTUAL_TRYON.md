# Virtual Try-On with Vertex AI

This document describes how ChromaFit's virtual try-on feature works using Google Cloud Vertex AI.

## Overview

The virtual try-on feature uses **Gemini 1.5 Flash** multimodal AI model via Vertex AI to analyze how well a garment would fit a person based on:
- User's body measurements
- User's avatar photo
- Garment image and measurements
- AI-powered fit analysis

## Architecture

### API Endpoint

**Route:** `/api/tryon-generate`  
**Method:** `POST`  
**Location:** `chromafit/src/app/api/tryon-generate/route.ts`

### Request Format

```typescript
{
  "userId": "uuid",      // User's ID
  "garmentId": "uuid"    // Garment's ID from database
}
```

### Response Format

```typescript
{
  "resultImageUrl": "string",   // Placeholder image URL (for now)
  "fitScore": 0.85,             // AI-calculated fit score (0.0-1.0)
  "explanation": {
    "fit": "Detailed fit analysis...",
    "style": "Style compatibility...",
    "comfort": "Comfort prediction..."
  }
}
```

## How It Works

### 1. Data Retrieval

When a try-on request is received, the API:
1. Fetches the user's profile (body metrics, avatar photo) from Supabase
2. Fetches the garment details (image, measurements, category) from Supabase
3. Downloads and converts both images to base64 format

### 2. AI Analysis with Vertex AI

The API uses **Gemini 1.5 Flash** vision model to analyze:

```typescript
const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const fitPrompt = {
  contents: [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: avatarBase64 } },
        { inlineData: { mimeType: 'image/jpeg', data: garmentBase64 } },
        { text: 'Analyze fit, style, and comfort...' }
      ]
    }
  ]
}

const result = await model.generateContent(fitPrompt)
```

**Input to AI:**
- User's avatar photo (as base64)
- Garment image (as base64)
- User's body metrics (height, chest, waist, hips)
- Garment measurements and category
- Detailed analysis prompt

**Output from AI:**
- Fit score (0.0 to 1.0)
- Detailed explanations for:
  - **Fit:** How well the garment matches body measurements
  - **Style:** Visual compatibility and aesthetic appeal
  - **Comfort:** Expected comfort based on fabric and cut

### 3. Response Generation

The API:
1. Parses the AI's JSON response
2. Validates the fit score and explanations
3. Uses a placeholder image URL (future: generate with Imagen)
4. Returns the complete try-on result

### 4. Database Storage

The client-side hook (`useTryOn.ts`) saves the result to Supabase:

```typescript
await supabase.from('tryons').insert({
  user_id: userId,
  garment_id: garmentId,
  result_image_url: resultImageUrl,
  fit_score: fitScore,
  fit_explanation: explanation
})
```

## Environment Variables

Required in `.env.local`:

```bash
# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT_ID=hac-cursor
GOOGLE_CLOUD_LOCATION=us-central1

# Supabase (for data access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Authentication

The API uses **Application Default Credentials** for Vertex AI:

```bash
# Login with gcloud
gcloud auth application-default login

# Set project
gcloud config set project hac-cursor
```

## Usage Example

### Client-Side Hook

```typescript
import { useTryOn } from '@/hooks/useTryOn'

function MyComponent() {
  const { generateTryOn } = useTryOn()
  
  const handleTryOn = async (garmentId: string) => {
    const result = await generateTryOn.mutateAsync({
      userId: user.id,
      garmentId
    })
    
    console.log('Fit Score:', result.fitScore)
    console.log('Explanation:', result.explanation)
  }
}
```

### Direct API Call

```typescript
const response = await fetch('/api/tryon-generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    garmentId: 'garment-uuid'
  })
})

const result = await response.json()
```

## Database Schema

### tryons Table

```sql
CREATE TABLE tryons (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  garment_id UUID REFERENCES garments(id),
  result_image_url TEXT,
  fit_score REAL CHECK (fit_score >= 0 AND fit_score <= 1),
  fit_explanation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### fit_explanation Structure

```json
{
  "fit": "The garment fits well around your body type...",
  "style": "This piece complements your proportions...",
  "comfort": "The fabric and cut provide good comfort..."
}
```

## Future Enhancements

### 1. Imagen API Integration

Currently uses placeholder images. Future implementation will use **Imagen 3** to generate actual try-on images:

```typescript
const imageModel = vertexAI.getGenerativeModel({ model: 'imagegeneration@006' })

const imagePrompt = {
  instances: [{
    prompt: `Professional fashion photography of a person wearing ${garment.name}...`,
    parameters: {
      sampleCount: 1,
      aspectRatio: "9:16",
      negativePrompt: "blurry, low quality"
    }
  }]
}

const imageResult = await imageModel.predict(imagePrompt)
```

### 2. Real-Time Try-On

Integrate with specialized virtual try-on models like:
- **Outfit Anyone** (open-source)
- **IDM-VTON** (virtual try-on network)
- Commercial APIs (Pixelbin, Fashn AI)

### 3. 3D Avatar Integration

Use SMPL parameters to render 3D try-on with Three.js:
- Real-time 3D garment visualization
- 360° view of the outfit
- Fabric physics simulation

## API Cost Estimation

### Vertex AI Pricing (Gemini 1.5 Flash)

- **Input:** $0.00001875 per 1K characters
- **Output:** $0.000075 per 1K characters
- **Images:** $0.0001315 per image

**Example calculation per try-on:**
- Avatar image: ~$0.0001315
- Garment image: ~$0.0001315
- Text prompt: ~$0.0001
- Text response: ~$0.0002

**Total per try-on:** ~$0.0005 (0.05 cents)

Much cheaper than traditional virtual try-on services ($0.10-$0.50 per try-on).

## Troubleshooting

### Error: "User profile not found"

**Cause:** User hasn't completed onboarding with avatar photo.

**Solution:** Redirect to `/onboarding` to upload avatar photo.

### Error: "Failed to fetch image"

**Cause:** Image URL is invalid or inaccessible.

**Solution:** 
- Check Supabase storage policies
- Verify image URLs are public
- Ensure images exist in storage

### Error: "No response text from AI model"

**Cause:** Vertex AI API call failed or returned empty response.

**Solution:**
- Check authentication: `gcloud auth application-default login`
- Verify project ID in `.env.local`
- Check Vertex AI API is enabled in Google Cloud Console

### Fallback Analysis

If AI parsing fails, the API uses a fallback:

```typescript
fitAnalysis = {
  fitScore: 0.75,
  explanation: {
    fit: "The garment should fit well based on your measurements.",
    style: "This piece complements your style profile.",
    comfort: "Expected to be comfortable for regular wear."
  }
}
```

## Security Considerations

1. **Authentication:** API requires valid user ID
2. **Authorization:** User can only try on their own garments or public garments
3. **Rate Limiting:** Implement rate limits to prevent abuse
4. **Image Validation:** Validate image URLs and file types
5. **Service Role Key:** Keep `SUPABASE_SERVICE_ROLE_KEY` secret

## Performance Optimization

1. **Image Caching:** Cache converted base64 images
2. **Parallel Processing:** Fetch user and garment data concurrently
3. **Response Streaming:** Stream AI responses for faster perceived performance
4. **CDN:** Use CDN for result images
5. **Database Indexing:** Index `tryons` table by `user_id` and `garment_id`

## Testing

### Manual Test

```bash
# Test the API endpoint
curl -X POST http://localhost:3000/api/tryon-generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "garmentId": "your-garment-id"
  }'
```

### Expected Response

```json
{
  "resultImageUrl": "https://via.placeholder.com/400x600/e5e7eb/6b7280?text=Virtual+Try-On+Result",
  "fitScore": 0.87,
  "explanation": {
    "fit": "The garment fits excellently with your body type...",
    "style": "The color and style complement your features...",
    "comfort": "Excellent comfort expected for all-day wear..."
  }
}
```

## References

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini)
- [Imagen Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
