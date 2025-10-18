# Google Cloud Vertex AI Setup Guide

## ✅ Migration Complete: Gemini API → Vertex AI

Your ChromaFit app has been successfully migrated to use **Google Cloud Vertex AI** instead of the Gemini API (AI Studio).

---

## 🎯 Why Vertex AI?

| Feature | Gemini API (AI Studio) | Vertex AI |
|---------|------------------------|-----------|
| **Use Case** | Quick prototyping | Production applications |
| **Authentication** | Simple API key | Google Cloud credentials |
| **Features** | Basic Gemini models | Full Gemini + Imagen + more |
| **Scalability** | Limited | Enterprise-grade |
| **Integration** | Standalone | Full Google Cloud ecosystem |
| **Cost** | Free tier + pay-as-you-go | Enterprise pricing |
| **Image Generation** | ❌ Not available | ✅ Imagen API available |

---

## 📋 Setup Instructions

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Enter project name (e.g., "ChromaFit")
   - Click "Create"
   - Note your **Project ID** (e.g., `chromafit-12345`)

### Step 2: Enable Vertex AI API

1. **Enable Vertex AI**
   - Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
   - Click "Enable"
   - Wait for activation (takes 1-2 minutes)

2. **Enable Required APIs**
   Also enable these APIs:
   - Vertex AI API
   - Cloud AI Platform API  
   - Generative Language API

### Step 3: Set Up Authentication

You have **three options** for authentication:

#### **Option A: Application Default Credentials (Recommended for Development)**

1. Install Google Cloud SDK:
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. Authenticate:
   ```bash
   gcloud auth application-default login
   ```

3. Set project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

This is the **easiest** option for local development.

#### **Option B: Service Account Key (Recommended for Production)**

1. **Create Service Account**:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click "Create Service Account"
   - Name: `chromafit-api`
   - Click "Create and Continue"

2. **Grant Roles**:
   Add these roles:
   - `Vertex AI User`
   - `AI Platform User`

3. **Create Key**:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose JSON format
   - Download the key file

4. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account-key.json"

   # Or add to your .env.local:
   GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\service-account-key.json
   ```

#### **Option C: API Key (Not Recommended)**

API keys have limited functionality with Vertex AI. Use Options A or B instead.

### Step 4: Configure Environment Variables

Update your `chromafit/.env.local` file:

```bash
# Google Cloud Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_LOCATION=us-central1

# Optional: If using service account key
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json
```

**Important**: Replace `your-project-id-here` with your actual Google Cloud Project ID!

### Step 5: Verify Setup

1. **Restart Development Server**:
   ```bash
   cd chromafit
   npm run dev
   ```

2. **Test API Connection**:
   - Open browser: `http://localhost:3000/test-gemini`
   - Click "Test Again" button
   - Should see: "Vertex AI Gemini is working correctly! ✅"

---

## 🔧 Configuration Options

### Available Regions

Choose the region closest to you for better performance:

```bash
# North America
GOOGLE_CLOUD_LOCATION=us-central1  # Iowa
GOOGLE_CLOUD_LOCATION=us-east4     # Virginia
GOOGLE_CLOUD_LOCATION=us-west1     # Oregon

# Europe
GOOGLE_CLOUD_LOCATION=europe-west4  # Netherlands
GOOGLE_CLOUD_LOCATION=europe-west1  # Belgium

# Asia Pacific
GOOGLE_CLOUD_LOCATION=asia-southeast1  # Singapore
GOOGLE_CLOUD_LOCATION=asia-northeast1  # Tokyo
```

### Available Models

Current setup uses `gemini-1.5-flash`, but you can change to:

- `gemini-1.5-flash` - Fast and cost-effective
- `gemini-1.5-pro` - More capable, slower
- `gemini-1.0-pro-vision` - Vision tasks
- Future: `imagegeneration@*` models (Imagen)

---

## 🚀 What's Different?

### Before (Gemini API via AI Studio)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
const result = await model.generateContent('prompt')
const text = result.response.text()
```

### After (Vertex AI)
```javascript
import { VertexAI } from '@google-cloud/vertexai'
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.GOOGLE_CLOUD_LOCATION
})
const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
const request = {
  contents: [{
    role: 'user',
    parts: [{ text: 'prompt' }]
  }]
}
const result = await model.generateContent(request)
const text = result.response.candidates[0].content.parts[0].text
```

---

## 💰 Pricing

### Vertex AI Gemini Pricing (as of 2025)

**Gemini 1.5 Flash:**
- Input: $0.00125 per 1K characters
- Output: $0.00375 per 1K characters
- Images: $0.00025 per image

**Gemini 1.5 Pro:**
- Input: $0.00125 per 1K characters
- Output: $0.00375 per 1K characters
- Images: $0.00025 per image

**Free Tier:**
- $300 free credits for new Google Cloud users
- Valid for 90 days

### Cost Example

1,000 outfit recommendations:
- ~500 characters input × 1,000 = 500K chars = $0.625
- ~1,000 characters output × 1,000 = 1M chars = $3.75
- 1,000 image analyses = $0.25
- **Total: ~$4.625 for 1,000 requests**

Much cheaper than OpenAI!

---

## 🧪 Testing Your Setup

### 1. Test API Endpoint
Visit: http://localhost:3000/api/test-gemini

Expected response:
```json
{
  "success": true,
  "message": "Vertex AI Gemini is working correctly! ✅",
  "geminiResponse": "Hello from Vertex AI Gemini! ...",
  "projectConfigured": true,
  "model": "gemini-1.5-flash",
  "location": "us-central1"
}
```

### 2. Test Web Page
Visit: http://localhost:3000/test-gemini

Should show:
- ✅ Green checkmark
- Vertex AI response message
- All endpoints status

### 3. Test Features
- Upload a photo → Generate styled outfit
- Add garment → Get product description
- Create avatar → Get avatar description

---

## 🐛 Troubleshooting

### Error: "Vertex AI is not configured"
**Solution**: 
- Set `GOOGLE_CLOUD_PROJECT_ID` in `.env.local`
- Restart dev server

### Error: "Could not load the default credentials"
**Solution**:
- Run: `gcloud auth application-default login`
- OR set `GOOGLE_APPLICATION_CREDENTIALS` to service account key path

### Error: "Permission denied"
**Solution**:
- Verify Vertex AI API is enabled
- Check service account has `Vertex AI User` role
- Wait 5-10 minutes for permissions to propagate

### Error: "Project not found"
**Solution**:
- Verify Project ID is correct (copy from Cloud Console)
- Check you're logged into correct Google account
- Ensure project is active (not deleted)

### Error: "API not enabled"
**Solution**:
- Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
- Click "Enable"
- Wait 1-2 minutes

### Error: "Quota exceeded"
**Solution**:
- Check your usage: https://console.cloud.google.com/apis/dashboard
- Request quota increase if needed
- Wait for quota to reset (usually daily)

---

## 📚 Additional Resources

- **Vertex AI Documentation**: https://cloud.google.com/vertex-ai/docs
- **Gemini API Docs**: https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini
- **Google Cloud Console**: https://console.cloud.google.com/
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Support**: https://cloud.google.com/support

---

## 🎨 Next Steps: Add Image Generation

Vertex AI also provides **Imagen API** for image generation:

```javascript
// Example: Future Imagen integration
const imageModel = vertexAI.getGenerativeModel({
  model: 'imagegeneration@002'
})

const imageRequest = {
  instances: [{ prompt: 'Your image description here' }],
  parameters: {
    sampleCount: 1
  }
}

const imageResult = await imageModel.predict(imageRequest)
```

This would enable actual outfit image generation!

---

## ✅ Migration Checklist

- [x] Installed `@google-cloud/vertexai` package
- [x] Updated all API routes to use Vertex AI
- [x] Configured environment variables
- [ ] Created Google Cloud project
- [ ] Enabled Vertex AI API
- [ ] Set up authentication (gcloud or service account)
- [ ] Updated `.env.local` with project ID
- [ ] Tested API connection
- [ ] Verified all features work

---

**Created**: October 19, 2025  
**Status**: Ready to configure and test!
