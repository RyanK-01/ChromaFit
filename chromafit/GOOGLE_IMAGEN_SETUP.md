# Google Imagen Integration for ChromaFit

## ⚠️ Important Limitation

**The current implementation uses Google Gemini Vision for analysis but CANNOT generate actual images.**

### Why?

1. **Gemini Pro** (text model) - Can analyze images and create prompts, but **cannot generate images**
2. **Imagen API** - Requires Google Cloud Platform (GCP) project setup with billing enabled

### Current Behavior

The API will:
1. ✅ Use Gemini Vision to analyze your avatar + garment images
2. ✅ Generate a detailed prompt for image generation
3. ⚠️ **Fallback to showing your avatar image** (cannot actually generate the try-on)

### Result

You'll see your **original avatar photo** instead of a generated virtual try-on, similar to what happened with OpenAI's rate limits.

---

## How to Enable True Image Generation with Imagen

To get actual image generation working, you need to:

### Option 1: Set Up Google Cloud Imagen API (Recommended but Complex)

1. **Create a GCP Project**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing one

2. **Enable Imagen API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

3. **Set Up Authentication**
   - Create a service account
   - Download the JSON key file
   - Add credentials to your environment

4. **Update the Code**
   - Replace the Imagen URL with your GCP project ID
   - Add proper authentication headers
   - Use the Vertex AI Imagen endpoint

**Cost**: Imagen charges per image generated (~$0.02-0.04 per image)

### Option 2: Use a Different Free API

Since both OpenAI and Google Imagen require payment, consider:

1. **Pollinations.ai** - Completely free, no signup
2. **Hugging Face Inference API** - Free tier available
3. **Replicate** - Free credits available

---

## Current Configuration

**API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`

**Environment Variable**: `NANOBANANA_API_KEY` (already configured in `.env.local`)

**Status**: ✅ Vision analysis working, ❌ Image generation not available

---

## Recommendation

Since Google Imagen also requires payment/setup, you have the same options as with OpenAI:

1. **Add billing to OpenAI** ($5-10 credit) - Use DALL-E 3 for best quality
2. **Set up GCP + Imagen** (more complex, similar pricing)
3. **Use a free alternative** like Pollinations.ai or Hugging Face

**My suggestion**: Either add $5 to OpenAI (simplest) or let me integrate a truly free API like Pollinations.ai.
