# ChromaFit - Current AI Configuration

## ✅ Active Setup: Google Cloud Vertex AI

Your ChromaFit application is now configured to use **Google Cloud Vertex AI** for all AI features.

---

## 📦 Current Packages

### AI/ML Package
- **@google-cloud/vertexai** v1.10.0 - Google Cloud Vertex AI SDK

### Removed Packages
- ~~openai~~ - Removed
- ~~@google/generative-ai~~ - Removed (Gemini API / nano banana)

---

## 🔧 Configuration Required

### Environment Variables (.env.local)
```bash
# Google Cloud Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_LOCATION=us-central1

# Optional: Service Account Authentication
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

### Authentication Setup
You need to set up Google Cloud authentication. Choose ONE method:

**Method 1: Application Default Credentials (Easiest)**
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

**Method 2: Service Account Key**
1. Create service account in Google Cloud Console
2. Grant "Vertex AI User" role
3. Download JSON key file
4. Set `GOOGLE_APPLICATION_CREDENTIALS` path in .env.local

---

## 🚀 API Endpoints

All endpoints use Vertex AI Gemini models:

| Endpoint | Purpose | Model |
|----------|---------|-------|
| `/api/generate-styled-outfit` | Outfit recommendations | gemini-1.5-flash |
| `/api/generate-2d-avatar` | Avatar descriptions | gemini-1.5-flash |
| `/api/generate-garment` | Product descriptions | gemini-1.5-flash |
| `/api/test-gemini` | Test Vertex AI connection | gemini-1.5-flash |

---

## 📚 Documentation

### Setup Guides
- **VERTEX_AI_SETUP.md** - Complete setup instructions
- **VERTEX_AI_QUICK_START.md** - Quick reference guide

### Other Documentation
- **2D_AVATAR_GENERATION.md** - Avatar generation details
- **API_CONTRACTS.md** - API specifications
- **SCHEMA.md** - Database schema
- **STORAGE_SETUP.md** - Supabase storage configuration

---

## 🎯 Features

### What Vertex AI Provides
✅ **Vision Analysis** - Analyze images (photos, garments)
✅ **Text Generation** - Intelligent recommendations and descriptions
✅ **Multimodal AI** - Process images and text together
✅ **Enterprise Scale** - Production-ready infrastructure

### Future Enhancements Available
🔮 **Imagen API** - Actual image generation (not just descriptions)
🔮 **Advanced Models** - Access to Gemini Pro and other models
🔮 **Fine-tuning** - Custom model training

---

## 💰 Cost Overview

### Vertex AI Pricing (Gemini 1.5 Flash)
- Input: $0.00125 per 1K characters
- Output: $0.00375 per 1K characters
- Images: $0.00025 per image

### Free Credits
- $300 free credits for new Google Cloud accounts
- Valid for 90 days

### Example Cost
- 1,000 outfit recommendations: ~$5
- 10,000 garment analyses: ~$50

**Much cheaper than OpenAI!**

---

## 🧪 Testing

### Test Your Setup
1. Start dev server: `cd chromafit; npm run dev`
2. Visit: `http://localhost:3000/test-gemini`
3. Should see: "Vertex AI Gemini is working correctly! ✅"

### Test Features
- Upload a photo → Generate outfit recommendations
- Add garment → Get product description
- Create avatar → Get avatar specification

---

## 🐛 Troubleshooting

### Common Issues

**"Vertex AI is not configured"**
→ Set `GOOGLE_CLOUD_PROJECT_ID` in .env.local

**"Could not load credentials"**
→ Run: `gcloud auth application-default login`

**"Permission denied"**
→ Enable Vertex AI API in Google Cloud Console
→ Grant "Vertex AI User" role to your account/service account

**"Project not found"**
→ Verify Project ID is correct (copy from Cloud Console)

---

## 📋 Migration History

### Evolution of AI Integration

1. **OpenAI** (Original)
   - GPT-4 Vision + DALL-E 3
   - Cost: ~$0.05-$0.09 per request
   - ❌ Removed

2. **Gemini API** (AI Studio / nano banana)
   - Simple API key authentication
   - Free tier available
   - ❌ Removed - Limited to text-based AI

3. **Vertex AI** (Current) ✅
   - Enterprise-grade platform
   - Access to Gemini + Imagen
   - Production-ready
   - ✅ Currently Active

---

## ✅ Setup Checklist

Before you can use the AI features:

- [ ] Create Google Cloud project
- [ ] Enable Vertex AI API
- [ ] Set up authentication (gcloud or service account)
- [ ] Update .env.local with project ID
- [ ] Restart development server
- [ ] Test API connection at /test-gemini

---

## 🔗 Important Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Enable Vertex AI**: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
- **Vertex AI Docs**: https://cloud.google.com/vertex-ai/docs
- **Gemini Models**: https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini

---

## 📝 Notes

### Current Limitations
- AI returns **text descriptions** (not images)
- Image generation requires separate Imagen API integration
- Requires Google Cloud account setup

### Advantages Over Previous Solutions
- ✅ More cost-effective than OpenAI
- ✅ Better integration with Google Cloud ecosystem
- ✅ Access to latest Gemini models
- ✅ Enterprise-ready scalability
- ✅ Path to image generation (Imagen API)

---

**Status**: Ready to configure and deploy!

**Last Updated**: October 19, 2025
