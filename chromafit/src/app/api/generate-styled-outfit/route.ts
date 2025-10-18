import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { WardrobeItem } from '@/types';
import Bottleneck from 'bottleneck';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Create a rate limiter instance
const limiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 1, // Allow 1 request
  reservoirRefreshAmount: 1,
  reservoirRefreshInterval: 60 * 1000, // Refresh every 60 seconds
});

// Wrap OpenAI API calls with the rate limiter
const limitedGenerateImage = limiter.wrap(async (prompt: string) => {
  return await openai.images.generate({
    model: 'dall-e-2',
    prompt,
    n: 1,
    size: '1024x1024',
  });
});

export async function POST(request: NextRequest) {
  try {
    const { environmentType, occasionType, selectedItems, customPrompt, gender } = await request.json()

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

    console.log('Generating outfit without user profile photo...')

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

    // Analyze profile photo for personalization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('realistic_photo_url, display_name')
      .eq('user_id', user.id)
      .single()

    let styleAnalysis = '';
    if (!profileError && profile?.realistic_photo_url) {
      console.log('Analyzing profile photo for style guidance...');
      try {
        const visionResponse = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this person's appearance focusing ONLY on styling-relevant details:
                  1. Color palette that would complement their skin tone and features
                  2. Suggested clothing cuts and styles that would suit their body type
                  3. Any notable style preferences visible in their current outfit
                  Be specific about colors, patterns, and cuts.`,
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
        });

        styleAnalysis = visionResponse.choices[0].message.content || '';
        console.log('Style analysis completed successfully');
      } catch (error) {
        console.error('Style analysis failed:', error);
        styleAnalysis = '';
      }
    } else {
      console.log('No profile photo available for analysis.');
      styleAnalysis = '';
    }

    // Build the complete prompt
    const prompt = `Clean, minimalist fashion flat lay of a ${gender || 'unisex'} outfit for ${styleContext}. Professional product photography on pure white background, no text or graphic elements. Weather-appropriate separates arranged in a symmetrical star pattern.${
      wardrobeDetails ? ` Include: ${wardrobeDetails}.` : ''
    }${
      styleAnalysis ? ` Style guide: ${styleAnalysis}` : ''
    }${
      customPrompt ? ` Consider weather conditions: ${customPrompt}. ` : ''
    }Show 3-4 coordinated clothing pieces plus 2-3 relevant accessories, perfectly spaced. Elegant product photography focusing only on the garments and accessories.`

    console.log('DALL-E prompt:', prompt)

    // Generate the outfit image
    console.log('Generating flat-lay outfit image with DALL-E 2...')

    const imageResponse = await limitedGenerateImage(prompt);

    const generatedImageUrl = imageResponse.data?.[0]?.url

    if (!generatedImageUrl) {
      throw new Error('No image URL received from DALL-E')
    }

    console.log('Styled outfit generated successfully')

    // Download and save to Supabase storage with retries
    let blob;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        console.log(`Attempt ${attempt} to download image...`);
        const imageResponse2 = await fetch(generatedImageUrl, {
          signal: controller.signal
        });
        
        if (!imageResponse2.ok) {
          throw new Error(`HTTP error! status: ${imageResponse2.status}`);
        }
        
        blob = await imageResponse2.blob();
        clearTimeout(timeoutId);
        console.log('Image downloaded successfully');
        break;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          throw new Error(`Failed to download image after ${maxRetries} attempts: ${error.message}`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    if (!blob) {
      throw new Error('Failed to download image');
    }
    
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
        promptUsed: prompt,
        temporary: true
      })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tryons')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      styledImageUrl: publicUrl,
      promptUsed: prompt,
      styleAnalysis
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
