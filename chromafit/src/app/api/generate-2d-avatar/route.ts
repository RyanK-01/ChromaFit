import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { VertexAI } from '@google-cloud/vertexai'

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
})

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to convert image URL to base64
async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = response.headers.get('content-type') || 'image/jpeg'
  return { data: base64, mimeType }
}

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, userId, style = 'realistic' } = await request.json()

    if (!photoUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Check Vertex AI configuration
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID

    if (!projectId) {
      return NextResponse.json(
        { error: 'Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT_ID.' },
        { status: 500 }
      )
    }

    console.log('Using Vertex AI Gemini Vision approach...')
    
    // Step 1: Analyze photo with Vertex AI Gemini Vision
    const { data: base64Image, mimeType } = await urlToBase64(photoUrl)
    
    const generativeVisionModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })
    
    const visionRequest = {
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType
            }
          },
          {
            text: `Describe this person's appearance in detail for creating a 2D avatar suitable for virtual fashion try-on. Focus on facial features, skin tone, hair style and color, and overall appearance. Keep it concise and suitable for avatar creation.`
          }
        ]
      }]
    }

    const visionResult = await generativeVisionModel.generateContent(visionRequest)
    const description = visionResult.response.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Step 2: Generate avatar description
    const styleInstructions: Record<string, string> = {
      realistic: 'photorealistic style',
      illustration: 'modern illustration style',
      cartoon: 'friendly cartoon style'
    }

    const generativeTextModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    const prompt = `Create a detailed description for a ${styleInstructions[style] || 'photorealistic style'} 2D portrait avatar based on: ${description}. 
    
The avatar should be:
- Front-facing view
- Neutral expression
- Plain white background
- Waist-up shot
- Suitable for virtual clothing try-on overlay

Provide specific details about the avatar's appearance, pose, and style.`

    const textRequest = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    }

    const avatarResult = await generativeTextModel.generateContent(textRequest)
    const avatarDescription = avatarResult.response.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('Avatar description generated with Vertex AI Gemini')

    return NextResponse.json({
      success: true,
      avatarDescription,
      personAnalysis: description,
      message: '2D avatar description generated successfully with Vertex AI Gemini',
      note: 'Vertex AI Gemini provides text descriptions. To generate actual avatar images, integrate with Imagen API or use a 3rd party avatar generation service.'
    })
    
  } catch (error: any) {
    console.error('Error in generate-2d-avatar API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate 2D avatar description' },
      { status: 500 }
    )
  }
}
