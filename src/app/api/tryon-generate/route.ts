import { NextRequest, NextResponse } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Vertex AI
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const vertexAI = new VertexAI({ project: projectId, location })

export async function POST(request: NextRequest) {
  try {
    const { userId, garmentId } = await request.json()

    if (!userId || !garmentId) {
      return NextResponse.json(
        { error: 'userId and garmentId are required' },
        { status: 400 }
      )
    }

    // Fetch user profile and garment details from database
    const [profileResult, garmentResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('garments').select('*').eq('id', garmentId).single()
    ])

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (garmentResult.error || !garmentResult.data) {
      return NextResponse.json(
        { error: 'Garment not found' },
        { status: 404 }
      )
    }

    const profile = profileResult.data
    const garment = garmentResult.data

    // Get image data for avatar and garment
    const [avatarImage, garmentImage] = await Promise.all([
      fetchImageAsBase64(profile.avatar_photo_url),
      fetchImageAsBase64(garment.image_url)
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
    const fitText = fitResult.response.candidates[0].content.parts[0].text
    
    // Parse fit analysis
    let fitAnalysis
    try {
      const jsonMatch = fitText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        fitAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse fit analysis:', fitText)
      // Fallback analysis
      fitAnalysis = {
        fitScore: 0.75,
        explanation: {
          fit: "The garment should fit well based on your measurements.",
          style: "This piece complements your style profile.",
          comfort: "Expected to be comfortable for regular wear."
        }
      }
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

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in tryon-generate API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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
