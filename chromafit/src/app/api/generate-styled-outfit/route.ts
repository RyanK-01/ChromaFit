import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { WardrobeItem } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { environmentType, occasionType, selectedItems, customPrompt } = await request.json()

    const supabase = await createClient()

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting AI styled outfit generation...')
    console.log('Environment:', environmentType)
    console.log('Occasion:', occasionType)
    console.log('Selected items:', selectedItems?.length || 0)

    // Get user's realistic photo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('realistic_photo_url, display_name')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile?.realistic_photo_url) {
      return NextResponse.json(
        { error: 'Please upload a photo in your profile first to generate styled outfits' },
        { status: 400 }
      )
    }

    // Get wardrobe items if selected
    let wardrobeDetails = ''
    if (selectedItems && selectedItems.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe')
        .select('name, category, color, brand, material')
        .in('id', selectedItems)

      if (!itemsError && items) {
        wardrobeDetails = items.map((item: WardrobeItem) => 
          `${item.name} (${item.category}${item.color ? ', ' + item.color : ''}${item.brand ? ', ' + item.brand : ''})`
        ).join(', ')
      }
    }

    // Build styling prompt
    let styleContext = ''
    if (environmentType) {
      const environmentDescriptions: Record<string, string> = {
        office: 'professional office environment with business casual or formal attire',
        school: 'casual school or campus setting with comfortable, stylish everyday wear',
        gym: 'athletic gym or fitness environment with activewear and sportswear',
        casual: 'relaxed casual setting with comfortable, laid-back clothing',
        formal: 'formal elegant setting with sophisticated, upscale attire'
      }
      styleContext = environmentDescriptions[environmentType] || environmentType
    }

    if (occasionType) {
      const occasionDescriptions: Record<string, string> = {
        party: 'vibrant party atmosphere with trendy, eye-catching outfit',
        date: 'romantic date setting with attractive, well-coordinated ensemble',
        wedding: 'elegant wedding event with formal, sophisticated attire',
        interview: 'professional job interview with polished, business formal outfit',
        meeting: 'business meeting with smart, professional appearance',
        workout: 'fitness or workout session with athletic performance wear',
        everyday: 'everyday casual setting with comfortable, practical clothing'
      }
      styleContext = styleContext 
        ? `${styleContext} for a ${occasionDescriptions[occasionType] || occasionType}`
        : occasionDescriptions[occasionType] || occasionType
    }

    // Check if wardrobe items are sufficient
    if (!wardrobeDetails) {
      console.log('No suitable wardrobe items found. Generating outfit without user wardrobe.')
      wardrobeDetails = 'AI-generated outfit based on the environment and occasion.'
    }

    // Build the complete prompt
    const basePrompt = `Professional fashion photography of clothing items for a ${styleContext}. 
${wardrobeDetails ? `Clothing: ${wardrobeDetails}.` : ''}
${customPrompt || ''}

Style: High-quality fashion photography, trendy and stylish, magazine quality, shows complete outfit appropriate for the occasion, well-coordinated colors and accessories. 
Constraints: The clothing should be widely available, practical, and not overly unique or avant-garde. Focus on styles that are accessible and commonly found in stores.`

    console.log('DALL-E prompt:', basePrompt)

    // Step 1: Analyze the user's photo with GPT-4 Vision
    console.log('Step 1: Analyzing user photo with GPT-4 Vision...')
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this person's appearance (body type, skin tone, hair, facial features) to help generate a styled outfit image for them. Describe their key physical characteristics that would be important for creating a realistic styled photo.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: profile.realistic_photo_url,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const userDescription = visionResponse.choices[0].message.content
    console.log('User description:', userDescription?.substring(0, 100) + '...')

    // Step 2: Generate styled outfit image with DALL-E 3
    console.log('Step 2: Generating styled outfit image with DALL-E 3...')
    const enhancedPrompt = `${basePrompt}

Person characteristics: ${userDescription}

Create a photorealistic full-body fashion photograph showing this person wearing an appropriate outfit for the described occasion. Ensure the outfit matches the style requirements and looks natural on the person.`

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

    console.log('Styled outfit generated successfully')

    // Download and save to Supabase storage
    const imageResponse2 = await fetch(generatedImageUrl)
    const blob = await imageResponse2.blob()
    
    const fileName = `${user.id}-styled-${Date.now()}.png`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tryons')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Still return the temporary URL if upload fails
      return NextResponse.json({
        success: true,
        styledImageUrl: generatedImageUrl,
        promptUsed: enhancedPrompt,
        temporary: true
      })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tryons')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      styledImageUrl: publicUrl,
      promptUsed: enhancedPrompt,
      userDescription
    })
  } catch (error: any) {
    console.error('Error generating styled outfit:', error)
    
    // Detailed error handling
    if (error.code === 'content_policy_violation') {
      return NextResponse.json(
        { error: 'The request was flagged by content policy. Please try different styling options.' },
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
      { error: error.message || 'Failed to generate styled outfit' },
      { status: 500 }
    )
  }
}
