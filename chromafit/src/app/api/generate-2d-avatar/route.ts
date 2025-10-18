import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

interface OpenAIResponse {
  created: number
  data: Array<{
    url?: string
    b64_json?: string
    revised_prompt?: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, userId, style = 'realistic', useVision = true } = await request.json()

    if (!photoUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Check OpenAI API configuration
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API is not configured' },
        { status: 500 }
      )
    }

    let generatedImageUrl: string | null = null

    // Try GPT-4 Vision + DALL-E approach if enabled
    if (useVision) {
      try {
        console.log('Using GPT-4 Vision + DALL-E approach...')
        generatedImageUrl = await generateWithVision(photoUrl, style, apiKey)
      } catch (visionError) {
        console.error('Vision approach failed, falling back to basic DALL-E:', visionError)
      }
    }

    // Fallback to basic DALL-E if vision failed or not enabled
    if (!generatedImageUrl) {
      console.log('Using basic DALL-E generation...')
      generatedImageUrl = await generateBasic(photoUrl, style, apiKey)
    }

    if (generatedImageUrl) {
      return NextResponse.json({
        success: true,
        generatedImageUrl: generatedImageUrl,
        message: '2D avatar generated successfully with OpenAI'
      })
    }

    return NextResponse.json(
      { error: 'Failed to generate 2D avatar' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Error in generate-2d-avatar API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate 2D avatar' },
      { status: 500 }
    )
  }
}

async function generateWithVision(
  photoUrl: string,
  style: string,
  apiKey: string
): Promise<string | null> {
  // Step 1: Analyze photo with GPT-4 Vision
  const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this person\'s appearance in detail for creating a 2D avatar suitable for virtual fashion try-on. Focus on facial features, skin tone, hair style and color, and overall appearance. Keep it concise and suitable for image generation.'
            },
            {
              type: 'image_url',
              image_url: {
                url: photoUrl
              }
            }
          ]
        }
      ],
      max_tokens: 300
    }),
  })

  if (!visionResponse.ok) {
    throw new Error('GPT-4 Vision request failed')
  }

  const visionData = await visionResponse.json()
  const description = visionData.choices[0]?.message?.content || ''

  // Step 2: Generate image with DALL-E
  const styleInstructions: Record<string, string> = {
    realistic: 'photorealistic style',
    illustration: 'modern illustration style',
    cartoon: 'friendly cartoon style'
  }

  const prompt = `Create a ${styleInstructions[style] || 'photorealistic style'} 2D portrait for virtual fashion try-on: ${description}. Front-facing view, neutral expression, plain white background, waist-up shot, suitable for clothing overlay.`

  return generateImageWithDallE(prompt, apiKey, 'hd')
}

async function generateBasic(
  photoUrl: string,
  style: string,
  apiKey: string
): Promise<string | null> {
  const stylePrompts: Record<string, string> = {
    realistic: 'Create a photorealistic 2D portrait suitable for virtual fashion try-on. Front-facing view with neutral expression and plain white background.',
    illustration: 'Create a stylized illustrated portrait suitable for virtual fashion try-on. Clean lines and modern illustration style with neutral expression.',
    cartoon: 'Create a friendly cartoon-style portrait suitable for virtual fashion try-on. Bold colors and simple shapes with neutral expression.'
  }

  const prompt = stylePrompts[style] || stylePrompts.realistic

  return generateImageWithDallE(prompt, apiKey, 'standard')
}

async function generateImageWithDallE(
  prompt: string,
  apiKey: string,
  quality: 'standard' | 'hd' = 'standard'
): Promise<string | null> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: quality,
      response_format: 'url'
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('DALL-E API error:', response.status, errorText)
    throw new Error(`DALL-E API failed with status ${response.status}`)
  }

  const data: OpenAIResponse = await response.json()

  if (data.data && data.data.length > 0) {
    return data.data[0].url || null
  }

  return null
}
