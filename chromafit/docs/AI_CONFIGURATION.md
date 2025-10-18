# ChromaFit AI Configuration

This document describes all AI-powered features in ChromaFit and their configuration using Google Cloud Vertex AI.

## Overview

ChromaFit uses **Google Cloud Vertex AI** with the **Gemini 1.5 Flash** model for all AI features:

- ✅ **2D Avatar Generation** - Create avatar descriptions from photos
- ✅ **Garment Analysis** - Extract garment details from images
- ✅ **Styled Outfit Generation** - AI-powered outfit recommendations
- ✅ **Virtual Try-On** - Fit analysis for garments
- 🔮 **Future:** Image generation with Imagen 3

## Architecture

```
┌─────────────────────────────────────────────┐
│          ChromaFit Application              │
│  (Next.js 15 + React 19 + TypeScript)      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          API Routes (Next.js)               │
│  • /api/generate-2d-avatar                  │
│  • /api/generate-garment                    │
│  • /api/generate-styled-outfit              │
│  • /api/tryon-generate                      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│      Google Cloud Vertex AI SDK             │
│      (@google-cloud/vertexai)               │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│    Google Cloud Vertex AI Service           │
│    • Gemini 1.5 Flash (multimodal)          │
│    • Location: us-central1                  │
│    • Project: hac-cursor                    │
└─────────────────────────────────────────────┘
```

## Environment Configuration

### Required Variables (.env.local)

```bash
# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT_ID=hac-cursor
GOOGLE_CLOUD_LOCATION=us-central1

# Supabase (for data storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Authentication Setup

```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# Login with your Google account
gcloud auth application-default login

# Set the project
gcloud config set project hac-cursor

# Verify configuration
gcloud config list
```

## AI Features Breakdown

### 1. 2D Avatar Generation

**Endpoint:** `/api/generate-2d-avatar`  
**Location:** `chromafit/src/app/api/generate-2d-avatar/route.ts`

**Purpose:** Analyze user photos to create detailed avatar descriptions for the wardrobe system.

**Input:**
- User photo (base64 encoded)

**Output:**
```json
{
  "description": "Detailed appearance description...",
  "skinTone": "Medium with warm undertones",
  "hairColor": "Dark brown",
  "hairStyle": "Short, wavy",
  "bodyType": "Athletic build, medium height"
}
```

**AI Model:** Gemini 1.5 Flash (vision + text)

**Cost per request:** ~$0.0003 (0.03 cents)

---

### 2. Garment Analysis

**Endpoint:** `/api/generate-garment`  
**Location:** `chromafit/src/app/api/generate-garment/route.ts`

**Purpose:** Extract garment details and metadata from product images.

**Input:**
- Garment image (URL or upload)

**Output:**
```json
{
  "category": "t-shirt",
  "name": "Navy Blue Crew Neck T-Shirt",
  "color": "Navy Blue",
  "style": "Casual, Classic",
  "material": "Cotton",
  "pattern": "Solid",
  "description": "A classic navy blue crew neck t-shirt..."
}
```

**AI Model:** Gemini 1.5 Flash (vision + text)

**Cost per request:** ~$0.0003 (0.03 cents)

---

### 3. Styled Outfit Generation

**Endpoint:** `/api/generate-styled-outfit`  
**Location:** `chromafit/src/app/api/generate-styled-outfit/route.ts`

**Purpose:** Generate AI-powered outfit recommendations based on user preferences, occasion, and environment.

**Input:**
```json
{
  "userId": "user-uuid",
  "environmentType": "office",
  "occasionType": "meeting",
  "selectedItems": ["garment-id-1", "garment-id-2"],
  "customPrompt": "Professional but creative"
}
```

**Output:**
```json
{
  "outfitName": "Professional Creative Look",
  "description": "A balanced outfit combining...",
  "items": [
    {
      "garmentId": "uuid",
      "reason": "The navy blazer provides structure..."
    }
  ],
  "styleNotes": "Pair with minimal accessories...",
  "confidence": 0.92
}
```

**AI Model:** Gemini 1.5 Flash (text generation)

**Cost per request:** ~$0.0002 (0.02 cents)

---

### 4. Virtual Try-On

**Endpoint:** `/api/tryon-generate`  
**Location:** `chromafit/src/app/api/tryon-generate/route.ts`

**Purpose:** Analyze how well a garment would fit a user based on body measurements and visual analysis.

**Input:**
```json
{
  "userId": "user-uuid",
  "garmentId": "garment-uuid"
}
```

**Output:**
```json
{
  "resultImageUrl": "https://...",
  "fitScore": 0.87,
  "explanation": {
    "fit": "The garment fits excellently...",
    "style": "The color and style complement...",
    "comfort": "Excellent comfort expected..."
  }
}
```

**AI Model:** Gemini 1.5 Flash (multimodal: 2 images + text)

**Cost per request:** ~$0.0005 (0.05 cents)

**See:** [VIRTUAL_TRYON.md](./VIRTUAL_TRYON.md) for detailed documentation.

---

## Cost Summary

### Per-Request Costs

| Feature | Model | Cost per Request | Monthly Cost (1000 requests) |
|---------|-------|------------------|------------------------------|
| Avatar Generation | Gemini 1.5 Flash | $0.0003 | $0.30 |
| Garment Analysis | Gemini 1.5 Flash | $0.0003 | $0.30 |
| Outfit Generation | Gemini 1.5 Flash | $0.0002 | $0.20 |
| Virtual Try-On | Gemini 1.5 Flash | $0.0005 | $0.50 |
| **Total** | | **$0.0013** | **$1.30** |

### Comparison to OpenAI

| Feature | OpenAI GPT-4o | Vertex AI (Gemini) | Savings |
|---------|---------------|---------------------|---------|
| Text + Image | $0.005 | $0.0003 | 94% |
| Try-On Analysis | $0.008 | $0.0005 | 94% |
| Outfit Generation | $0.003 | $0.0002 | 93% |

**Average savings: 93-94%** 🎉

## SDK Initialization

All API routes use this pattern:

```typescript
import { VertexAI } from '@google-cloud/vertexai'

// Initialize Vertex AI
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const vertexAI = new VertexAI({ project: projectId, location })

// Get the model
const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
```

## Request Patterns

### Text-Only Request

```typescript
const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: 'Your prompt here...'
        }
      ]
    }
  ]
})

const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text
```

### Image + Text Request

```typescript
const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData
          }
        },
        {
          text: 'Analyze this image...'
        }
      ]
    }
  ]
})

const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text
```

### Multiple Images + Text Request

```typescript
const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: avatarBase64
          }
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: garmentBase64
          }
        },
        {
          text: 'Compare these images...'
        }
      ]
    }
  ]
})
```

## Error Handling

All API routes implement consistent error handling:

```typescript
try {
  const result = await model.generateContent(prompt)
  const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text
  
  if (!text) {
    throw new Error('No response from AI model')
  }
  
  // Parse and return result
  
} catch (error) {
  console.error('AI API Error:', error)
  return NextResponse.json(
    { 
      error: 'AI processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    },
    { status: 500 }
  )
}
```

## Rate Limiting

Vertex AI has default quotas:

- **Requests per minute:** 60
- **Requests per day:** 1,500 (free tier)
- **Tokens per minute:** 4,000,000

For production, request quota increases via Google Cloud Console.

## Monitoring

### Enable Logging

```bash
# View recent API calls
gcloud logging read "resource.type=aiplatform.googleapis.com/Endpoint" --limit 50

# Monitor costs
gcloud billing budgets list
```

### Application Logging

All API routes log:
- Request parameters
- Processing time
- Error details
- AI response metadata

```typescript
console.log('[Try-On] Processing request:', { userId, garmentId })
console.log('[Try-On] AI response received in', duration, 'ms')
console.error('[Try-On] Error:', error)
```

## Security

### Authentication
- Uses **Application Default Credentials**
- No API keys stored in code
- Credentials managed by gcloud CLI

### Authorization
- API routes verify user authentication
- Rate limiting per user
- Input validation on all requests

### Data Privacy
- Images converted to base64 in memory
- No persistent storage of images in API layer
- GDPR-compliant data handling

## Future Enhancements

### Phase 1: Image Generation (Q2 2025)
- Integrate **Imagen 3** for virtual try-on images
- Generate realistic outfit visualizations
- Multiple angle views

### Phase 2: Advanced AI (Q3 2025)
- **Gemini Pro** for complex analysis
- Fine-tuned models for fashion
- Custom embedding models

### Phase 3: Real-Time AI (Q4 2025)
- Streaming responses
- WebSocket integration
- Live camera try-on

## Troubleshooting

### "Error: Could not load credentials"

**Solution:**
```bash
gcloud auth application-default login
```

### "Error: Permission denied"

**Solution:**
```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Verify project
gcloud config get-value project
```

### "Error: Model not found"

**Solution:** Check model name is exactly `gemini-1.5-flash`

### High Latency

**Causes:**
- Large images (>5MB)
- Network latency
- Cold start

**Solutions:**
- Resize images before sending
- Use Cloud Run for API hosting
- Enable keep-alive connections

## Testing

### Test Individual Endpoints

```bash
# Test Avatar Generation
curl -X POST http://localhost:3000/api/generate-2d-avatar \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://..."}'

# Test Garment Analysis
curl -X POST http://localhost:3000/api/generate-garment \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://..."}'

# Test Virtual Try-On
curl -X POST http://localhost:3000/api/tryon-generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid", "garmentId": "uuid"}'
```

### Integration Tests

See test files in `chromafit/__tests__/api/`

## Documentation

- **Setup Guide:** [VERTEX_AI_SETUP.md](./VERTEX_AI_SETUP.md)
- **Quick Start:** [VERTEX_AI_QUICK_START.md](./VERTEX_AI_QUICK_START.md)
- **Virtual Try-On:** [VIRTUAL_TRYON.md](./VIRTUAL_TRYON.md)
- **Schema:** [SCHEMA.md](./SCHEMA.md)

## Support

- **Google Cloud Documentation:** https://cloud.google.com/vertex-ai/docs
- **Gemini API Reference:** https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
- **ChromaFit Issues:** GitHub Issues

---

**Last Updated:** October 19, 2025  
**Vertex AI Version:** 1.10.0  
**Gemini Model:** 1.5 Flash
