import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VertexAI } from '@google-cloud/vertexai'

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
})

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
    const { photoUrl, userId, category } = await request.json()

    if (!photoUrl || !userId) {
      return NextResponse.json(
        { error: 'Photo URL and user ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting AI garment generation...')
    console.log('Category:', category)
    console.log('Photo URL:', photoUrl)

    // Step 1: Analyze the garment photo with Vertex AI Gemini Vision
    console.log('Step 1: Analyzing garment with Vertex AI Gemini Vision...')
    
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
            text: `Analyze this ${category || 'clothing item'} and describe it in detail for a fashion catalog. Include:
- Type of garment and style
- Color(s) and patterns
- Fabric texture and material appearance
- Design details (buttons, zippers, pockets, etc.)
- Overall aesthetic and vibe

Describe it as if you're creating a professional product listing. Be specific and detailed.`
          }
        ]
      }]
    }

    const visionResult = await generativeVisionModel.generateContent(visionRequest)
    const analysis = visionResult.response.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Vision analysis complete:', analysis?.substring(0, 100) + '...')

    // Step 2: Generate enhanced garment description
    console.log('Step 2: Generating enhanced product description with Vertex AI Gemini...')
    const enhancedPrompt = `Create a professional fashion catalog description for this ${category || 'clothing item'}:

Analysis: ${analysis}

Include:
1. Detailed product name and category
2. Style and design features
3. Color palette and patterns
4. Material and texture details
5. Styling suggestions
6. Ideal occasions to wear

Write it in a professional, engaging tone suitable for an online fashion store.`

    const generativeTextModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    const textRequest = {
      contents: [{
        role: 'user',
        parts: [{ text: enhancedPrompt }]
      }]
    }

    const descriptionResult = await generativeTextModel.generateContent(textRequest)
    const productDescription = descriptionResult.response.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('AI garment description generated successfully with Vertex AI')

    return NextResponse.json({
      success: true,
      productDescription,
      analysis,
      prompt: enhancedPrompt,
      note: 'Vertex AI Gemini provides detailed product descriptions. For image enhancement, integrate with Imagen API or use the description with product photography tools.'
    })
  } catch (error: any) {
    console.error('Error generating AI garment:', error)
    
    // More detailed error handling
    if (error.code === 'content_policy_violation') {
      return NextResponse.json(
        { error: 'The image was flagged by content policy. Please use a different photo.' },
        { status: 400 }
      )
    }

    if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('credentials')) {
      return NextResponse.json(
        { error: 'Vertex AI authentication failed. Please check your Google Cloud credentials.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate AI garment' },
      { status: 500 }
    )
  }
}
