import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Step 1: Analyze the garment photo with GPT-4 Vision
    console.log('Step 1: Analyzing garment with GPT-4 Vision...')
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ${category || 'clothing item'} and describe it in detail for a fashion catalog. Include:
- Type of garment and style
- Color(s) and patterns
- Fabric texture and material appearance
- Design details (buttons, zippers, pockets, etc.)
- Overall aesthetic and vibe

Describe it as if you're creating a professional product listing. Be specific and detailed.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: photoUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const analysis = visionResponse.choices[0].message.content
    console.log('Vision analysis complete:', analysis?.substring(0, 100) + '...')

    // Step 2: Generate enhanced garment image with DALL-E 3
    console.log('Step 2: Generating enhanced image with DALL-E 3...')
    const enhancedPrompt = `Professional fashion photography of a ${category || 'clothing item'} on a clean white background. High-end product photo style, studio lighting, sharp focus on fabric details and texture. ${analysis}

Style: Professional product photography, magazine quality, centered composition, no model, just the garment displayed elegantly.`

    console.log('DALL-E prompt:', enhancedPrompt)

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
    })

    const generatedImageUrl = imageResponse.data?.[0]?.url

    if (!generatedImageUrl) {
      throw new Error('No image URL received from DALL-E')
    }

    console.log('AI garment generated successfully')

    return NextResponse.json({
      success: true,
      generatedImageUrl,
      analysis,
      prompt: enhancedPrompt,
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

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API authentication failed. Please check your API key.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate AI garment' },
      { status: 500 }
    )
  }
}
