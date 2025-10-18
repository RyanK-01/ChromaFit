# API Contracts Documentation

This document describes the API contracts for ChromaFit's mock AI services and database operations.

## Overview

All AI endpoints are currently implemented as mock services that return deterministic outputs based on input parameters. This allows for immediate development and testing while providing a foundation for real AI integration.

## Authentication

All API endpoints require authentication via Supabase Auth. The user's JWT token is automatically included in requests.

## API Endpoints

### Body Extraction

**Endpoint:** `POST /api/body-extract`

Extract body measurements and generate SMPL parameters from a user photo.

#### Request

```typescript
{
  photoUrl: string // URL of the uploaded photo
}
```

#### Response

```typescript
{
  bodyMetrics: {
    height: number;    // cm
    chest: number;     // cm
    waist: number;     // cm
    hips: number;      // cm
    weight?: number;   // kg (optional)
  };
  smplParams: {
    shape: number[];   // 10-dimensional shape parameters
    pose: number[];    // 72-dimensional pose parameters
  };
}
```

#### Example

```bash
curl -X POST /api/body-extract \
  -H "Content-Type: application/json" \
  -d '{"photoUrl": "https://storage.supabase.co/object/public/avatars/user123/photo.jpg"}'
```

#### Mock Implementation

- Returns fixed body metrics (height: 175cm, chest: 92cm, waist: 78cm, hips: 95cm)
- Generates deterministic SMPL parameters based on photo URL hash
- Simulates realistic body shape variations

---

### Garment Extraction

**Endpoint:** `POST /api/garment-extract`

Analyze garment properties from an image URL.

#### Request

```typescript
{
  imageUrl: string;                    // URL of the garment image
  sourceType: 'upload' | 'url';       // How the garment was added
  sourceUrl?: string;                 // Original product URL (if applicable)
}
```

#### Response

```typescript
{
  category: GarmentCategory;          // Detected garment category
  measurements: GarmentMeasurements;  // Extracted measurements
  clipEmbedding: number[];           // 768-dimensional CLIP embedding
}
```

#### Garment Categories

```typescript
type GarmentCategory = 
  | 't-shirt' | 'jeans' | 'dress' | 'shirt' | 'pants' 
  | 'shorts' | 'jacket' | 'sweater' | 'skirt' | 'shoes' | 'accessories';
```

#### Garment Measurements

```typescript
interface GarmentMeasurements {
  chest?: number;        // cm or inches
  waist?: number;        // cm or inches
  hips?: number;         // cm or inches
  length?: number;       // cm or inches
  sleeve_length?: number; // cm or inches
  inseam?: number;       // cm or inches
  unit: 'cm' | 'inches';
}
```

#### Example

```bash
curl -X POST /api/garment-extract \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://storage.supabase.co/object/public/garments/user123/shirt.jpg",
    "sourceType": "upload",
    "sourceUrl": "https://example.com/product/shirt"
  }'
```

#### Mock Implementation

- Determines category based on image URL hash
- Generates realistic measurements based on category
- Creates deterministic 768-dimensional CLIP embeddings

---

### Try-On Generation

**Endpoint:** `POST /api/tryon-generate`

Generate a virtual try-on result with fit analysis.

#### Request

```typescript
{
  userId: string;      // User ID
  garmentId: string;   // Garment ID
}
```

#### Response

```typescript
{
  resultImageUrl: string;        // URL of the try-on result image
  fitScore: number;             // Fit score (0.0 - 1.0)
  explanation: {
    fit: string;                // Fit analysis text
    style: string;              // Style analysis text
    comfort: string;            // Comfort analysis text
  };
}
```

#### Example

```bash
curl -X POST /api/tryon-generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "garmentId": "garment-456"
  }'
```

#### Mock Implementation

- Returns placeholder composite image URL
- Generates fit score between 0.65-0.95 based on user/garment ID hash
- Provides structured explanations for fit, style, and comfort

---

### Outfit Embedding

**Endpoint:** `POST /api/embedding-outfit`

Generate outfit embedding from garment IDs.

#### Request

```typescript
{
  garmentIds: string[];  // Array of garment IDs
}
```

#### Response

```typescript
{
  outfitEmbedding: number[];  // 768-dimensional outfit embedding
}
```

#### Example

```bash
curl -X POST /api/embedding-outfit \
  -H "Content-Type: application/json" \
  -d '{
    "garmentIds": ["garment-1", "garment-2", "garment-3"]
  }'
```

#### Mock Implementation

- Averages CLIP embeddings of constituent garments
- Returns normalized 768-dimensional vector

## Database Schema

### Tables

#### profiles

```sql
CREATE TABLE profiles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_photo_url TEXT,
  body_metrics JSONB,
  smpl_params JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### garments

```sql
CREATE TABLE garments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  measurements JSONB,
  clip_embedding VECTOR(768),
  source_type TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### tryons

```sql
CREATE TABLE tryons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  garment_id UUID REFERENCES garments(id),
  result_image_url TEXT,
  fit_score REAL CHECK (fit_score >= 0 AND fit_score <= 1),
  fit_explanation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### outfits

```sql
CREATE TABLE outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  garment_ids JSONB NOT NULL,
  outfit_embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  error: string;  // Error message
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing required parameters)
- `401` - Unauthorized (invalid authentication)
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:

- Per-user rate limits
- API key-based limits
- Request throttling

## Future Real AI Integration

### Body Extraction
- Replace with computer vision models
- Use pose estimation libraries (MediaPipe, OpenPose)
- Implement SMPL-X body model integration

### Garment Analysis
- Use fashion-specific computer vision models
- Implement CLIP-based image classification
- Add size recommendation algorithms

### Virtual Try-On
- Integrate 3D garment simulation
- Use physics-based rendering
- Implement realistic fabric draping

### Style Similarity
- Use fashion recommendation models
- Implement collaborative filtering
- Add trend analysis capabilities

## Testing

### Unit Tests

```bash
npm run test
```

### API Testing

Use the provided Postman collection or test endpoints directly:

```bash
# Test body extraction
curl -X POST http://localhost:3000/api/body-extract \
  -H "Content-Type: application/json" \
  -d '{"photoUrl": "test-image-url"}'

# Test garment extraction
curl -X POST http://localhost:3000/api/garment-extract \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "test-garment-url", "sourceType": "upload"}'
```

## Monitoring

### Logging

All API calls are logged with:
- Request parameters
- Response status
- Processing time
- Error details (if any)

### Metrics

Track key metrics:
- API response times
- Success/error rates
- User engagement
- Feature usage

## Security Considerations

- All user data is encrypted in transit and at rest
- Row Level Security (RLS) prevents unauthorized access
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Secure file upload handling

## Performance Optimization

- Implement caching for frequently accessed data
- Use database indexes for common queries
- Optimize image processing pipelines
- Consider CDN for static assets
