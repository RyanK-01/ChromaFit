import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TrendData {
  id: number
  keyword: string
  volume: number
  growth: number
  category: string
  tags: string[]
  imageUrl: string
  description: string
}

// Function to generate trends using ONLY OpenAI
async function generateTrendsWithOpenAI(): Promise<TrendData[]> {
  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    const currentYear = new Date().getFullYear()
    
    const prompt = `You are a fashion trend analyst with expertise in current runway trends, street style, and social media fashion movements. Generate a list of 15 REAL, SPECIFIC, and CURRENT fashion trends for ${currentMonth} ${currentYear}.

IMPORTANT: Be very specific and accurate. Research actual trends happening RIGHT NOW in fashion.

Include a diverse mix of:
- Style trends (e.g., "Quiet Luxury", "Mob Wife Aesthetic", "Clean Girl Aesthetic")
- Garment trends (e.g., "Wide-Leg Trousers", "Oversized Blazers", "Maxi Skirts")
- Aesthetic trends (e.g., "Coastal Grandmother", "Old Money Style", "Dark Academia")
- Movement trends (e.g., "Gorpcore", "Tenniscore", "Balletcore")

For each trend, provide:
1. A SPECIFIC, catchy keyword (2-4 words) - use actual trend names
2. Category: style, garment, aesthetic, or movement
3. Brief, accurate description (max 60 characters)
4. 3-4 highly relevant tags that describe the trend
5. Realistic search volume (between 80,000-800,000)
6. Realistic growth percentage (between 10-65%)
7. Specific Unsplash search term that will find the BEST matching image

For Unsplash search terms, be VERY SPECIFIC to get accurate images:
- For color trends: include the exact color + "fashion outfit"
- For styles: use the exact style name + "fashion street style"
- For garments: use "person wearing [garment] fashion photography"
- For aesthetics: combine key visual elements

Return ONLY valid JSON in this exact format:
{
  "trends": [
    {
      "keyword": "Quiet Luxury",
      "category": "aesthetic",
      "description": "Minimalist elegance with premium quality fabrics",
      "tags": ["minimalist", "timeless", "sophisticated", "quality"],
      "volume": 420000,
      "growth": 52.8,
      "unsplashSearch": "elegant minimalist fashion neutral tones"
    }
  ]
}

Make sure ALL 15 trends are:
- Real and currently trending in ${currentMonth} ${currentYear}
- Specific and well-defined
- Have accurate, descriptive Unsplash search terms
- Diverse across all 4 categories`

    console.log('Asking OpenAI to generate fashion trends...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini instead of gpt-4
      messages: [
        {
          role: 'system',
          content: 'You are an expert fashion trend analyst with deep knowledge of current fashion trends, runway shows, street style, and social media fashion movements. You provide accurate, current trend data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
    console.log(`OpenAI generated ${response.trends?.length || 0} trends`)

    if (!response.trends || !Array.isArray(response.trends)) {
      throw new Error('Invalid response from OpenAI')
    }

    // Map to our format and fetch real Unsplash images
    const trends: TrendData[] = await Promise.all(
      response.trends.map(async (trend: any, index: number) => {
        // Try to get a real Unsplash image for this specific trend
        let imageUrl = getUnsplashImage(index)
        
        if (trend.unsplashSearch) {
          try {
            const unsplashImage = await fetchUnsplashImage(trend.unsplashSearch)
            if (unsplashImage) {
              imageUrl = unsplashImage
            }
          } catch (error) {
            console.log(`Could not fetch Unsplash image for "${trend.keyword}", using fallback`)
          }
        }
        
        return {
          id: index + 1,
          keyword: trend.keyword,
          volume: trend.volume || Math.floor(Math.random() * 500000) + 100000,
          growth: trend.growth || Math.floor(Math.random() * 50) + 10,
          category: trend.category,
          tags: trend.tags || [],
          imageUrl: imageUrl,
          description: trend.description
        }
      })
    )

    return trends

  } catch (error) {
    console.error('Error generating trends with OpenAI:', error)
    return []
  }
}

// Fetch a real image from Unsplash based on search query
async function fetchUnsplashImage(searchQuery: string): Promise<string | null> {
  try {
    // Using Unsplash's public API with source.unsplash.com
    // This is a simplified approach that works without API key
    const query = encodeURIComponent(searchQuery)
    
    // Try to fetch from Unsplash Source API
    const imageUrl = `https://source.unsplash.com/800x1000/?${query}`
    
    // Test if the URL is accessible
    const testResponse = await fetch(imageUrl, { method: 'HEAD' })
    if (testResponse.ok) {
      return imageUrl
    }
    
    return null
  } catch (error) {
    console.error('Error fetching Unsplash image:', error)
    return null
  }
}

// Get curated Unsplash images for fashion (fallback)
function getUnsplashImage(index: number): string {
  const fashionImages = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', // colorful fashion
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', // neutral tones
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // pink outfit
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80', // street style
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', // shoes
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', // blazer
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', // pants
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', // minimal
    'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80', // accessories
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80', // streetwear
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80', // casual
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80', // elegant
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80', // fashion
    'https://images.unsplash.com/photo-1558769132-cb1aea8f5a3?w=800&q=80', // style
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', // outfit
  ]
  
  return fashionImages[index % fashionImages.length]
}

// Fallback trends - 15 curated fashion trends
function generateFallbackTrends(): TrendData[] {
  const fallbackData = [
    { 
      keyword: 'Quiet Luxury', 
      category: 'aesthetic', 
      tags: ['minimalist', 'quality', 'timeless', 'sophisticated'], 
      description: 'Understated elegance with premium materials',
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'
    },
    { 
      keyword: 'Dopamine Dressing', 
      category: 'aesthetic', 
      tags: ['bold', 'colorful', 'mood-boosting', 'vibrant'], 
      description: 'Bright, joyful colors that boost mood',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
    },
    { 
      keyword: 'Wide-Leg Trousers', 
      category: 'garment', 
      tags: ['comfortable', 'elegant', 'versatile', 'retro'], 
      description: 'Flowing wide-leg pants for effortless style',
      imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80'
    },
    { 
      keyword: 'Mob Wife Aesthetic', 
      category: 'style', 
      tags: ['glamorous', 'bold', 'luxe', 'dramatic'], 
      description: 'Bold glamour with furs and statement pieces',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    },
    { 
      keyword: 'Tenniscore', 
      category: 'movement', 
      tags: ['athletic', 'preppy', 'clean', 'sporty'], 
      description: 'Tennis-inspired preppy athletic wear',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80'
    },
    { 
      keyword: 'Maxi Skirts', 
      category: 'garment', 
      tags: ['flowing', 'bohemian', 'feminine', 'romantic'], 
      description: 'Floor-length skirts making a major return',
      imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80'
    },
    { 
      keyword: 'Oversized Blazers', 
      category: 'garment', 
      tags: ['structured', 'power', 'versatile', 'tailored'], 
      description: 'Relaxed, oversized blazers for any occasion',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'
    },
    { 
      keyword: 'Clean Girl Aesthetic', 
      category: 'aesthetic', 
      tags: ['minimal', 'fresh', 'natural', 'polished'], 
      description: 'Effortlessly polished minimalist style',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
    },
    { 
      keyword: 'Cargo Pants', 
      category: 'garment', 
      tags: ['utility', 'streetwear', 'functional', 'y2k'], 
      description: 'Utilitarian cargo pants dominating streetwear',
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'
    },
    { 
      keyword: 'Balletcore', 
      category: 'movement', 
      tags: ['feminine', 'delicate', 'romantic', 'graceful'], 
      description: 'Ballet-inspired delicate feminine pieces',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'
    },
    { 
      keyword: 'Old Money Style', 
      category: 'aesthetic', 
      tags: ['classic', 'elegant', 'refined', 'heritage'], 
      description: 'Timeless elegance of inherited wealth',
      imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80'
    },
    { 
      keyword: 'Statement Sleeves', 
      category: 'style', 
      tags: ['dramatic', 'bold', 'sculptural', 'feminine'], 
      description: 'Bold, oversized, or puffed sleeve designs',
      imageUrl: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80'
    },
    { 
      keyword: 'Gorpcore', 
      category: 'movement', 
      tags: ['outdoor', 'functional', 'utilitarian', 'hiking'], 
      description: 'Outdoor functional wear meets street style',
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80'
    },
    { 
      keyword: 'Leather Everything', 
      category: 'style', 
      tags: ['edgy', 'bold', 'luxe', 'textured'], 
      description: 'Head-to-toe leather in all forms',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'
    },
    { 
      keyword: 'Sheer Layers', 
      category: 'style', 
      tags: ['romantic', 'delicate', 'layered', 'ethereal'], 
      description: 'Transparent and semi-sheer layered looks',
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80'
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

export async function GET(request: Request) {
  try {
    console.log('🤖 Starting OpenAI-powered trend generation...')

    // Try to generate trends with OpenAI
    const aiTrends = await generateTrendsWithOpenAI()
    
    if (aiTrends.length > 0) {
      console.log(`✅ Successfully generated ${aiTrends.length} AI-powered trends`)
      return NextResponse.json({
        trends: aiTrends,
        source: 'openai-generated',
        timestamp: new Date().toISOString()
      })
    }

    // Fallback to curated trends
    console.log('📚 Using curated fallback trends')
    const fallbackTrends = generateFallbackTrends()
    
    return NextResponse.json({
      trends: fallbackTrends,
      source: 'fallback-curated',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in explore-trends-openai API:', error)
    
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
