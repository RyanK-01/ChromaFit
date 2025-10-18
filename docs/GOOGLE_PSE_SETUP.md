# Google Programmable Search Engine (PSE) + OpenAI Integration Setup

This document explains how to set up and configure the Google Programmable Search Engine integration with OpenAI for the ChromaFit Explore Trends feature.

## Overview

The Explore Trends feature uses a powerful combination of:
1. **Google Programmable Search Engine (PSE)** - To fetch real-time web data about fashion trends
2. **OpenAI GPT-4** - To analyze and extract meaningful insights from the search results

## Architecture

```
User Request → Google PSE API → Search Results → OpenAI Analysis → Structured Trends → Display
```

### Flow:
1. System generates fashion-related search queries (e.g., "October 2025 fashion trends")
2. Google PSE searches the web and returns relevant results with images
3. OpenAI GPT-4 analyzes the search results and extracts:
   - Trend keywords
   - Categories (style, garment, aesthetic, movement)
   - Descriptions
   - Tags
   - Estimated popularity metrics
4. Results are formatted and displayed to users

## Setup Instructions

### 1. Get Google Programmable Search Engine API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Create a Programmable Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" or "Get Started"
3. Configure your search engine:
   - **Name**: ChromaFit Fashion Trends
   - **What to search**: Select "Search the entire web"
   - **Search settings**: 
     - Enable "Image search"
     - Enable "SafeSearch"
4. Click "Create"
5. Copy your **Search Engine ID** (cx parameter)

### 3. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Google Programmable Search Engine Configuration
GOOGLE_PSE_API_KEY=your_actual_api_key_here
GOOGLE_PSE_ENGINE_ID=your_search_engine_id_here

# OpenAI Configuration (should already exist)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Verify OpenAI API Key

Make sure your OpenAI API key has access to GPT-4. You can check this at [OpenAI Platform](https://platform.openai.com/).

## API Usage & Rate Limits

### Google PSE Limits:
- **Free Tier**: 100 queries per day
- **Paid Tier**: Up to 10,000 queries per day (requires billing setup)
- Cost: $5 per 1,000 queries after free tier

### OpenAI GPT-4 Limits:
- Depends on your OpenAI plan
- Current implementation uses ~500-1000 tokens per request
- Estimated cost: $0.03 - $0.06 per trend analysis

### Optimization Tips:
1. The API limits to 3 search queries per request to avoid rate limits
2. Results are cached on the frontend
3. Users can manually refresh trends using the "Refresh" button
4. Consider implementing server-side caching for production

## API Endpoint

### `/api/explore-trends-pse`

**Method**: GET

**Response**:
```json
{
  "trends": [
    {
      "id": 1,
      "keyword": "Dopamine Dressing",
      "volume": 250000,
      "growth": 45.2,
      "category": "aesthetic",
      "tags": ["bold", "colorful", "mood-boosting"],
      "imageUrl": "https://...",
      "description": "Bright, joyful colors that boost mood",
      "sources": ["https://...", "https://..."]
    }
  ],
  "source": "google-pse-openai",
  "timestamp": "2025-10-19T..."
}
```

**Source Types**:
- `google-pse-openai` - Successfully fetched and analyzed with Google PSE + OpenAI
- `fallback-curated` - Using curated fallback data (when APIs unavailable)
- `fallback-error` - Error occurred, using fallback data

## Testing

### Test Without API Keys:
The system will automatically fall back to curated trends if API keys are not configured.

### Test With API Keys:
1. Configure your `.env.local` with valid API keys
2. Restart your dev server: `npm run dev`
3. Navigate to `/dashboard/explore`
4. Click the "Refresh" button to fetch new trends
5. Check the browser console for detailed logs
6. Look for the status badge: "Powered by Google Search + AI"

## Troubleshooting

### Issue: "Google PSE credentials not configured"
- **Solution**: Ensure `GOOGLE_PSE_API_KEY` and `GOOGLE_PSE_ENGINE_ID` are set in `.env.local`

### Issue: "Google PSE API error: 429"
- **Solution**: You've exceeded the rate limit. Wait or upgrade to paid tier.

### Issue: "No trends found"
- **Solution**: Check your search engine settings allow image search and web search.

### Issue: OpenAI API errors
- **Solution**: Verify your OpenAI API key has GPT-4 access and sufficient credits.

## Fallback System

The implementation includes a robust fallback system:

1. **Primary**: Google PSE + OpenAI analysis
2. **Fallback**: Curated fashion trends based on current season
3. **Error Handling**: Graceful degradation with user notifications

This ensures the Explore feature always works, even if external APIs are unavailable.

## Future Enhancements

Potential improvements for the explore feature:

1. **Server-side caching** - Cache trends for 1-6 hours to reduce API calls
2. **User preferences** - Personalize trends based on user's wardrobe
3. **Social signals** - Integrate Instagram/Pinterest trending data
4. **Real-time updates** - WebSocket for live trend updates
5. **Advanced filtering** - By color, season, price range, etc.
6. **Trend predictions** - ML model to predict upcoming trends
7. **Regional trends** - Localized trends based on user location

## Cost Estimation

For a production deployment with 1,000 daily active users:

- Google PSE: ~$15-30/month (assuming 3,000-6,000 queries)
- OpenAI GPT-4: ~$30-60/month (for trend analysis)
- **Total**: ~$45-90/month

Consider implementing caching to reduce these costs significantly.

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider implementing rate limiting on your API endpoint
- Monitor API usage in Google Cloud Console and OpenAI dashboard
- Rotate API keys periodically

## Support

For issues or questions:
- Check the browser console for detailed error logs
- Review the server logs in your terminal
- Ensure all environment variables are correctly set
- Verify API keys are valid and have proper permissions

---

**Last Updated**: October 19, 2025
**Feature Status**: Active on `explore` branch
