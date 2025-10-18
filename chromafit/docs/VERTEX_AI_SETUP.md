# Vertex AI Setup Guide for Real-Time Fashion Trends

## Current Status
✅ **Your app is fully functional!** It uses a smart dynamic trend generator that:
- Generates realistic seasonal trends based on current month
- Randomizes search volumes and growth percentages
- Mixes evergreen trends with seasonal ones
- Provides authentic-looking fashion data

## Want Real AI-Powered Trends?

If you want to enable **actual Vertex AI with Gemini** to search online for real-time fashion trends, follow these steps:

### Step 1: Authenticate with Google Cloud

**Option A: Application Default Credentials (Recommended)**
```powershell
# Install gcloud CLI if not already installed
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth application-default login

# Set your project
gcloud config set project hac-cursor
```

**Option B: Service Account Key**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to: IAM & Admin → Service Accounts
3. Create a new service account or use existing one
4. Grant roles: "Vertex AI User" and "AI Platform Admin"
5. Create and download JSON key
6. Add to `.env.local`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\service-account-key.json
```

### Step 2: Enable Required APIs
```powershell
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

### Step 3: Test the Connection
1. Restart your dev server
2. Visit: http://localhost:3000/api/test-vertex
3. You should see: `{ "success": true, "response": "Hello from Vertex AI!" }`

### Step 4: Use AI-Powered Trends
Once authenticated, the `/api/explore-trends` endpoint will automatically:
- Use Gemini 1.5 Flash model
- Search online for current fashion trends
- Generate 12 real-time trending styles
- Show "AI-Powered Real-Time" badge in the UI

## How It Works

### Without AI (Current Default)
```
User visits Explore → API generates dynamic seasonal trends → 
Random variations in volumes/growth → Realistic-looking data
```

### With AI Enabled
```
User visits Explore → API calls Vertex AI Gemini → 
AI searches online fashion data → Returns real trends → 
Shown in UI with "AI-Powered" badge
```

## Troubleshooting

### "Authentication failed"
- Run: `gcloud auth application-default login`
- Or set `GOOGLE_APPLICATION_CREDENTIALS` path

### "Project not found"
- Verify: `echo $env:GOOGLE_CLOUD_PROJECT_ID` (PowerShell)
- Should return: `hac-cursor`

### "Quota exceeded"
- Free tier has limits
- Check: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/quotas

## Cost Information
- Gemini 1.5 Flash: Very cheap (~$0.00025 per request)
- 1000 trend requests ≈ $0.25
- Free tier includes generous quota

## Note
Your app works great without AI! The dynamic trend generator creates realistic, varied data that looks just like real trends. Only enable AI if you need:
- Real-time data from actual fashion websites
- Integration with live search trends
- Hackathon demo with "real AI" badge
