import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  pagemap?: {
    cse_image?: Array<{ src: string }>
    metatags?: Array<{ [key: string]: string }>
  }
}

interface TrendData {
  id: number
  keyword: string
  volume: number
  growth: number
  category: string
  tags: string[]
  imageUrl: string
  description: string
  sources?: string[]
}

// Function to search Google PSE - Now supports both web and image search
async function searchGooglePSE(query: string, searchType: 'web' | 'image' = 'web'): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.GOOGLE_PSE_API_KEY
  const engineId = process.env.GOOGLE_PSE_ENGINE_ID

  if (!apiKey || !engineId) {
    console.warn('Google PSE credentials not configured')
    return []
  }

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.append('key', apiKey)
    url.searchParams.append('cx', engineId)
    url.searchParams.append('q', `${query} fashion`)
    url.searchParams.append('num', '10')
    url.searchParams.append('safe', 'active')
    
    // Only add searchType for image search
    if (searchType === 'image') {
      url.searchParams.append('searchType', 'image')
      url.searchParams.append('imgSize', 'large')
    }

    console.log('Calling Google PSE with URL:', url.toString().replace(apiKey, 'REDACTED'))

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Google PSE API error details:', errorData)
      throw new Error(`Google PSE API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log(`Google PSE returned ${data.items?.length || 0} results for "${query}"`)
    return data.items || []
  } catch (error) {
    console.error('Error fetching from Google PSE:', error)
    return []
  }
}

// Function to analyze trends with OpenAI
async function analyzeTrendsWithAI(searchResults: GoogleSearchResult[], query: string): Promise<any> {
  try {
    const searchContext = searchResults.map(result => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link
    }))

    const prompt = `You are a fashion trend analyst. Based on the following search results about "${query}", analyze and extract key fashion trends.

Search Results:
${JSON.stringify(searchContext, null, 2)}

Please provide a JSON response with the following structure:
{
  "trends": [
    {
      "keyword": "trend name",
      "category": "style|garment|aesthetic|movement",
      "description": "brief description (max 100 chars)",
      "tags": ["tag1", "tag2", "tag3"],
      "estimatedVolume": number (estimated search volume),
      "growthRate": number (estimated growth percentage),
      "reasoning": "why this is trending"
    }
  ],
  "summary": "overall trend summary",
  "topColors": ["color1", "color2", "color3"],
  "topStyles": ["style1", "style2", "style3"]
}

Focus on current, real fashion trends. Be specific and practical.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fashion trend analyst specializing in identifying and analyzing current fashion trends from web data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')
    return analysis
  } catch (error) {
    console.error('Error analyzing trends with AI:', error)
    return null
  }
}

// Function to get fashion trend queries
function getFashionTrendQueries(): string[] {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const currentYear = new Date().getFullYear()
  
  return [
    `${currentMonth} ${currentYear} fashion trends`,
    'latest fashion trends',
    'trending styles now',
    'fashion week highlights',
    'streetwear trends',
    'sustainable fashion trends'
  ]
}

export async function GET(request: Request) {
  try {
    console.log('Starting Google PSE + OpenAI trend exploration...')

    const trendQueries = getFashionTrendQueries()
    const allTrends: TrendData[] = []
    
    // Search Google PSE for each query (using WEB search now)
    for (const query of trendQueries.slice(0, 2)) { // Reduced to 2 queries to save API calls
      console.log(`Searching for: ${query}`)
      const searchResults = await searchGooglePSE(query, 'web')
      
      if (searchResults.length > 0) {
        console.log(`Got ${searchResults.length} results, analyzing with OpenAI...`)
        
        // Analyze with OpenAI
        const analysis = await analyzeTrendsWithAI(searchResults, query)
        
        if (analysis && analysis.trends) {
          console.log(`OpenAI extracted ${analysis.trends.length} trends`)
          
          // For each trend, try to get an image
          for (let i = 0; i < analysis.trends.length && i < 4; i++) {
            const trend = analysis.trends[i]
            
            // Try to get an image for this specific trend
            let imageUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
            
            // Try to find image from the search results
            const imageResult = searchResults[i]
            if (imageResult?.pagemap?.cse_image?.[0]?.src) {
              imageUrl = imageResult.pagemap.cse_image[0].src
            } else if (imageResult?.pagemap?.metatags?.[0]?.['og:image']) {
              imageUrl = imageResult.pagemap.metatags[0]['og:image']
            }
            
            // Alternatively, search for an image of this specific trend
            const trendImageSearch = await searchGooglePSE(`${trend.keyword} fashion outfit`, 'image')
            if (trendImageSearch.length > 0 && trendImageSearch[0]?.link) {
              imageUrl = trendImageSearch[0].link
            }

            allTrends.push({
              id: allTrends.length + 1,
              keyword: trend.keyword,
              volume: trend.estimatedVolume || Math.floor(Math.random() * 500000) + 100000,
              growth: trend.growthRate || Math.floor(Math.random() * 50) + 10,
              category: trend.category,
              tags: trend.tags || [],
              imageUrl: imageUrl,
              description: trend.description,
              sources: searchResults.slice(0, 3).map(r => r.link)
            })
          }
        }
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // If we have trends, return them
    if (allTrends.length > 0) {
      console.log(`✅ Successfully generated ${allTrends.length} trends from Google PSE + OpenAI`)
      return NextResponse.json({
        trends: allTrends,
        source: 'google-pse-openai',
        timestamp: new Date().toISOString()
      })
    }

    // Fallback to basic trends
    console.log('No trends found from Google PSE, using fallback data')
    const fallbackTrends = generateFallbackTrends()
    
    return NextResponse.json({
      trends: fallbackTrends,
      source: 'fallback-curated',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in explore-trends-pse API:', error)
    
    // Return fallback trends on error
    const fallbackTrends = generateFallbackTrends()
    return NextResponse.json({
      trends: fallbackTrends,
      source: 'fallback-error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

// Fallback trends function
function generateFallbackTrends(): TrendData[] {
  const currentSeason = getCurrentSeason()
  const categories = ['style', 'garment', 'aesthetic', 'movement']
  
  const fallbackData = [
    { 
      keyword: 'Dopamine Dressing', 
      category: 'aesthetic', 
      tags: ['bold', 'colorful', 'mood-boosting'], 
      description: 'Bright, joyful colors that boost mood and confidence',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
    },
    { 
      keyword: 'Coastal Grandmother', 
      category: 'aesthetic', 
      tags: ['relaxed', 'neutral', 'timeless'], 
      description: 'Effortless elegance with linen and soft neutrals',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    },
    { 
      keyword: 'Barbiecore', 
      category: 'style', 
      tags: ['pink', 'feminine', 'playful'], 
      description: 'Hot pink everything inspired by Barbie aesthetics',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
    },
    { 
      keyword: 'Gorpcore', 
      category: 'movement', 
      tags: ['outdoor', 'functional', 'utilitarian'], 
      description: 'Outdoor functional wear meets streetstyle',
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80'
    },
    { 
      keyword: 'Ballet Flats', 
      category: 'garment', 
      tags: ['comfortable', 'classic', 'elegant'], 
      description: 'Classic ballet flats making a major comeback',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'
    },
    { 
      keyword: 'Oversized Blazers', 
      category: 'garment', 
      tags: ['structured', 'power', 'versatile'], 
      description: 'Relaxed, oversized blazers for effortless style',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'
    },
    { 
      keyword: 'Cargo Pants', 
      category: 'garment', 
      tags: ['utility', 'streetwear', 'functional'], 
      description: 'Utilitarian cargo pants dominating streetwear',
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'
    },
    { 
      keyword: 'Quiet Luxury', 
      category: 'aesthetic', 
      tags: ['minimalist', 'quality', 'subtle'], 
      description: 'Understated elegance with premium materials',
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'
    },
  ]

  return fallbackData.map((item, index) => ({
    id: index + 1,
    keyword: item.keyword,
    volume: Math.floor(Math.random() * 500000) + 100000,
    growth: Math.floor(Math.random() * 50) + 10,
    category: item.category as any,
    tags: item.tags,
    imageUrl: item.imageUrl,
    description: item.description
  }))
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}
