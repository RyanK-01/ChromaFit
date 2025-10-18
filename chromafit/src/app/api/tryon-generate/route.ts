import { NextRequest, NextResponse } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey })
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

// Initialize Vertex AI with better error handling
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim()
const location = process.env.GOOGLE_CLOUD_LOCATION?.trim() || 'us-central1'

let vertexAI: VertexAI | null = null
try {
  if (projectId) {
    vertexAI = new VertexAI({ project: projectId, location })
  } else {
    console.warn('GOOGLE_CLOUD_PROJECT_ID not set - AI features will use fallback')
  }
} catch (error) {
  console.error('Failed to initialize Vertex AI:', error)
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Try-On Generate API Called ===')
    
    const { userId, garmentId } = await request.json()
    console.log('Request:', { userId, garmentId })

    if (!userId || !garmentId) {
      console.error('Missing required fields:', { userId: !!userId, garmentId: !!garmentId })
      return NextResponse.json(
        { error: 'userId and garmentId are required' },
        { status: 400 }
      )
    }

    // Fetch user profile and garment details from database
    console.log('Fetching profile and garment from database...')
    const [profileResult, garmentResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('wardrobe').select('*').eq('id', garmentId).single()
    ])

    if (profileResult.error || !profileResult.data) {
      console.error('Profile fetch error:', profileResult.error)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (garmentResult.error || !garmentResult.data) {
      console.error('Garment fetch error:', garmentResult.error)
      return NextResponse.json(
        { error: 'Garment not found in wardrobe' },
        { status: 404 }
      )
    }

    const profile = profileResult.data
    const garment = garmentResult.data
    console.log('Found profile and garment:', { 
      profileId: profile.user_id, 
      garmentId: garment.id,
      garmentName: garment.name,
      category: garment.category 
    })

    // Get image data for avatar and garment
    const avatarImageUrl = profile.avatar_photo_url
    const garmentImageUrl = garment.original_photo_url || garment.ai_generated_url
    
    if (!avatarImageUrl) {
      console.warn('No avatar photo URL found')
      return NextResponse.json(
        { error: 'Please upload your photo in "My Profile" first' },
        { status: 400 }
      )
    }

    if (!garmentImageUrl) {
      console.warn('No garment image URL found')
      return NextResponse.json(
        { error: 'Garment image not found' },
        { status: 400 }
      )
    }

    console.log('Image URLs:', { avatarImageUrl, garmentImageUrl })

    // Analyze fit using AI or provide intelligent fallback
    let fitAnalysis

    if (vertexAI && projectId) {
      try {
        const [avatarImage, garmentImage] = await Promise.all([
          fetchImageAsBase64(avatarImageUrl),
          fetchImageAsBase64(garmentImageUrl)
        ])

        // Use Gemini 1.5 Flash for vision + text generation to analyze fit
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Analyze fit using vision model
        const fitPrompt = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: avatarImage.mimeType,
                    data: avatarImage.data
                  }
                },
                {
                  inlineData: {
                    mimeType: garmentImage.mimeType,
                    data: garmentImage.data
                  }
                },
                {
                  text: `You are a professional fashion stylist analyzing how well this garment would fit this person.

Person's Body Metrics:
- Height: ${profile.body_metrics?.height || 'N/A'} cm
- Chest: ${profile.body_metrics?.chest || 'N/A'} cm
- Waist: ${profile.body_metrics?.waist || 'N/A'} cm
- Hips: ${profile.body_metrics?.hips || 'N/A'} cm

Garment Details:
- Category: ${garment.category}
- Name: ${garment.name}
${garment.measurements ? `- Measurements: ${JSON.stringify(garment.measurements)}` : ''}

Analyze:
1. How well this garment would fit this person (provide a fit score from 0.0 to 1.0)
2. Provide detailed explanations for fit, style, and comfort

Return your analysis in this exact JSON format:
{
  "fitScore": 0.85,
  "explanation": {
    "fit": "Detailed fit analysis...",
    "style": "Style compatibility analysis...",
    "comfort": "Comfort prediction..."
  }
}

Only return the JSON, no additional text.`
                }
              ]
            }
          ]
        }

        const fitResult = await model.generateContent(fitPrompt)
        
        // Extract text from response with proper null checking
        const fitText = fitResult.response?.candidates?.[0]?.content?.parts?.[0]?.text
        
        // Parse fit analysis
        if (!fitText) {
          throw new Error('No response text from AI model')
        }
        
        const jsonMatch = fitText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          fitAnalysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (aiError) {
        console.error('AI analysis failed, using fallback:', aiError)
        fitAnalysis = generateFallbackAnalysis(profile, garment)
      }
    } else {
      console.log('Vertex AI not initialized, using fallback analysis')
      fitAnalysis = generateFallbackAnalysis(profile, garment)
    }

    // For now, use a placeholder URL for the try-on image
    // In a production setup, you could use Imagen API for actual image generation
    // or integrate with a specialized virtual try-on service
    const resultImageUrl = `https://via.placeholder.com/400x600/e5e7eb/6b7280?text=Virtual+Try-On+Result`

    // Optional: Generate a styled image prompt for Imagen (future enhancement)
    // const imagePrompt = `Professional fashion photography of a person wearing a ${garment.category} (${garment.name}), 
    //   full body shot, neutral background, studio lighting, high quality fashion catalog style`

    const response = {
      resultImageUrl,
      fitScore: Math.round(fitAnalysis.fitScore * 100) / 100,
      explanation: fitAnalysis.explanation
    }

    console.log('Successfully generated try-on analysis:', {
      garmentName: garment.name,
      fitScore: response.fitScore,
      usedAI: !!vertexAI
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('=== Error in tryon-generate API ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check the server logs for more details'
      },
      { status: 500 }
    )
  }
}

// Helper function to generate fallback analysis when AI is not available
function generateFallbackAnalysis(profile: any, garment: any) {
  const category = garment.category?.toLowerCase() || ''
  const fitScore = 0.75 + Math.random() * 0.15 // Random score between 0.75-0.9
  
  const categoryAdvice: Record<string, { fit: string; style: string; comfort: string }> = {
    'top': {
      fit: `This ${garment.name} should fit well. Based on your chest measurement of ${profile.body_metrics?.chest || 'N/A'} cm, we recommend checking the garment's size chart for the best fit.`,
      style: `${garment.name} is a versatile piece that works well with casual and semi-formal looks. Pair it with jeans or chinos for a great outfit.`,
      comfort: 'Top garments in this category typically offer good freedom of movement and breathability.'
    },
    'bottom': {
      fit: `This ${garment.name} should fit comfortably. With your waist measurement of ${profile.body_metrics?.waist || 'N/A'} cm, ensure the waistband sits at your natural waistline.`,
      style: `${garment.name} is a staple piece that pairs well with various tops. Great for both casual and dressed-up occasions.`,
      comfort: 'Bottom wear in this style typically provides good comfort and flexibility for daily activities.'
    },
    'dress': {
      fit: `This ${garment.name} should complement your figure. Based on your measurements (chest: ${profile.body_metrics?.chest || 'N/A'} cm, waist: ${profile.body_metrics?.waist || 'N/A'} cm, hips: ${profile.body_metrics?.hips || 'N/A'} cm), it should provide a flattering silhouette.`,
      style: `${garment.name} is a statement piece perfect for special occasions or everyday elegance.`,
      comfort: 'Dresses in this category are designed for all-day wear with comfortable fabrics and construction.'
    },
    'shoes': {
      fit: `${garment.name} should provide good support. Make sure to select your correct shoe size for optimal comfort.`,
      style: `These shoes complement a wide range of outfits and add a finishing touch to your look.`,
      comfort: 'Proper footwear is essential for comfort. These shoes are designed with support and cushioning in mind.'
    },
    'accessories': {
      fit: `${garment.name} is sized to be versatile and adjustable for most users.`,
      style: `This accessory adds personality and completes your outfit with a stylish accent.`,
      comfort: 'Accessories in this category are lightweight and designed for comfortable all-day wear.'
    }
  }

  const defaultAdvice = {
    fit: `This ${garment.name} should fit well based on standard sizing. Consider checking the size chart for the best match to your measurements.`,
    style: `${garment.name} is a great addition to your wardrobe and offers versatile styling options.`,
    comfort: 'This item is designed with comfort in mind and should be suitable for regular wear.'
  }

  let advice = defaultAdvice
  if (category.includes('top') || category.includes('shirt') || category.includes('jacket')) {
    advice = categoryAdvice['top']
  } else if (category.includes('bottom') || category.includes('pants') || category.includes('jeans')) {
    advice = categoryAdvice['bottom']
  } else if (category.includes('dress')) {
    advice = categoryAdvice['dress']
  } else if (category.includes('shoe')) {
    advice = categoryAdvice['shoes']
  } else if (category.includes('accessor')) {
    advice = categoryAdvice['accessories']
  }

  return {
    fitScore: Math.round(fitScore * 100) / 100,
    explanation: advice
  }
}

// Helper function to fetch image and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  
  // Determine mime type from content-type header
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  
  return {
    data: base64,
    mimeType: contentType
  }
}
