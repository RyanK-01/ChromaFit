import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VertexAI } from '@google-cloud/vertexai'

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim()
const location = process.env.GOOGLE_CLOUD_LOCATION?.trim() || 'us-central1'

// Initialize Vertex AI with null checking
let vertexAI: VertexAI | null = null
try {
  if (projectId) {
    vertexAI = new VertexAI({ project: projectId, location })
    console.log('✅ Vertex AI initialized for AI Styling with Imagen')
  } else {
    console.warn('⚠️ GOOGLE_CLOUD_PROJECT_ID not set - AI Styling will use fallback mode')
  }
} catch (error) {
  console.error('Failed to initialize Vertex AI for styling:', error)
}

// Helper to convert base64 to data URL
function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${base64}`
}

// Helper function to convert image URL to base64
async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = response.headers.get('content-type') || 'image/jpeg'
  return { data: base64, mimeType }
}

// Generate fallback placeholder image when AI is not available
function generateFallbackImage(): string {
  // Return a placeholder image URL from Unsplash
  return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=512&h=768&fit=crop'
}

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

    console.log('=== Starting AI Styled Outfit Image Generation ===')
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
        wardrobeDetails = items.map(item => 
          `${item.name} (${item.category}${item.color ? ', ' + item.color : ''}${item.brand ? ', ' + item.brand : ''})`
        ).join(', ')
      }
    }

    // Build comprehensive styling context with detailed outfit descriptions
    let styleContext = ''
    let outfitDetails = ''
    
    if (environmentType && occasionType) {
      // Comprehensive outfit descriptions for ALL combinations
      const outfitGuide: Record<string, Record<string, string>> = {
        office: {
          party: 'professional yet festive: Tailored blazer over a stylish blouse or shirt, dress pants or pencil skirt, statement heels or dress shoes, elegant jewelry',
          date: 'sophisticated romantic: Silk blouse or fitted shirt, pencil skirt or tailored pants, elegant heels or loafers, refined accessories',
          wedding: 'business formal elegance: Cocktail dress or formal suit in rich colors, elegant jewelry, dressy heels or polished shoes, clutch',
          interview: 'classic professional: Navy or charcoal suit, crisp white or light blue shirt, minimal jewelry, polished closed-toe shoes, leather briefcase',
          meeting: 'business excellence: Tailored blazer, dress shirt or blouse, pressed trousers or skirt, professional shoes, minimal accessories',
          workout: 'athletic professional: Premium athleisure, sleek joggers, fitted performance top, quality athletic shoes',
          everyday: 'polished casual: Business casual blazer, smart trousers or chinos, button-up or blouse, comfortable dress shoes'
        },
        school: {
          party: 'campus party chic: Trendy jeans or skirt, stylish crop top or fitted shirt, sneakers or ankle boots, fun accessories, crossbody bag',
          date: 'young casual cute: Well-fitted jeans, pretty blouse or sweater, ankle boots or clean sneakers, simple jewelry, small handbag',
          wedding: 'young formal: A-line dress or suit separates, dressy flats or heels, elegant accessories, clutch',
          interview: 'student professional: Blazer, dress shirt or neat top, chinos or skirt, clean sneakers or loafers, organized backpack',
          meeting: 'prepared student: Clean jeans or khakis, button-up or polo shirt, sweater layer, neat sneakers, functional backpack',
          workout: 'campus athletic: Comfortable athleisure, trendy joggers, university hoodie or performance tee, stylish sneakers',
          everyday: 'comfortable campus: Relaxed jeans, casual tee or hoodie, cardigan or jacket, comfortable sneakers, practical backpack'
        },
        gym: {
          party: 'athleisure elevated: Premium athletic pieces, fitted joggers, stylish sports jacket, high-end sneakers, sporty accessories',
          date: 'athletic casual: Clean athleisure outfit, fitted leggings or joggers, stylish athletic top, pristine sneakers',
          wedding: 'not appropriate - formal change required: Please select a different environment for wedding occasions',
          interview: 'not appropriate - professional attire required: Please select office or formal environment for interviews',
          meeting: 'activewear professional: Premium joggers, fitted performance top, athletic blazer, clean athletic shoes',
          workout: 'performance ready: Moisture-wicking tank or tee, supportive leggings or shorts, quality athletic shoes, gym bag, fitness tracker',
          everyday: 'athleisure lifestyle: Comfortable joggers or leggings, fitted tee or sweatshirt, stylish sneakers, gym backpack'
        },
        casual: {
          party: 'relaxed party style: Trendy jeans or casual pants, statement top or shirt, comfortable stylish shoes, fun accessories',
          date: 'effortless charm: Well-fitted jeans, attractive top or shirt, casual blazer or cardigan, clean sneakers or boots, simple jewelry',
          wedding: 'smart casual wedding: Cocktail dress or dress pants with blazer, dressy flats or low heels, elegant accessories',
          interview: 'business casual: Blazer, dress pants or skirt, button-up shirt, professional shoes, minimal jewelry',
          meeting: 'casual professional: Clean jeans or chinos, nice shirt or blouse, optional blazer, neat dress shoes',
          workout: 'casual athletic: Standard athletic wear, comfortable shorts or joggers, basic performance tee, supportive shoes',
          everyday: 'comfortable daily: Jeans or joggers, casual t-shirt or hoodie, sneakers, practical crossbody bag or backpack'
        },
        formal: {
          party: 'elegant evening: Cocktail dress or suit with tie, statement jewelry, dressy heels or oxfords, clutch or elegant bag',
          date: 'sophisticated romantic: Formal dress or suit in rich colors, elegant jewelry, polished shoes, refined accessories',
          wedding: 'wedding formal: Floor-length gown or formal suit with tie, elegant jewelry, dressy heels or polished shoes, clutch',
          interview: 'executive formal: Dark formal suit, crisp dress shirt, professional tie or silk scarf, polished leather shoes, leather portfolio',
          meeting: 'business formal: Tailored suit, professional shirt or blouse, minimal elegant jewelry, classic leather shoes',
          workout: 'not appropriate - athletic wear required: Please select gym or casual for workout activities',
          everyday: 'upscale daily: Tailored separates in quality fabrics, refined accessories, polished appearance, professional shoes'
        }
      }
      
      outfitDetails = outfitGuide[environmentType]?.[occasionType] || 
                     'stylish, well-coordinated outfit appropriate for the occasion'
      styleContext = `${environmentType} environment for ${occasionType} event`
    } else if (environmentType) {
      const envDefaults: Record<string, string> = {
        office: 'professional business attire: Suit or blazer with dress pants/skirt, button-up shirt, dress shoes',
        school: 'casual campus wear: Jeans, comfortable top, sneakers, backpack',
        gym: 'athletic wear: Performance leggings/shorts, moisture-wicking top, athletic shoes',
        casual: 'comfortable casual: Jeans, t-shirt or casual top, sneakers',
        formal: 'formal attire: Suit or elegant dress, dress shoes, refined accessories'
      }
      outfitDetails = envDefaults[environmentType] || 'appropriate outfit'
      styleContext = `${environmentType} environment`
    } else if (occasionType) {
      const occDefaults: Record<string, string> = {
        party: 'party outfit: Trendy, eye-catching clothing with stylish accessories',
        date: 'date outfit: Attractive, well-coordinated look with attention to detail',
        wedding: 'wedding attire: Formal dress or suit with elegant accessories',
        interview: 'interview attire: Professional suit with conservative styling',
        meeting: 'meeting attire: Business professional with polished appearance',
        workout: 'workout gear: Athletic wear with performance features',
        everyday: 'everyday outfit: Comfortable, practical, casually stylish'
      }
      outfitDetails = occDefaults[occasionType] || 'appropriate outfit'
      styleContext = `${occasionType} occasion`
    }

    console.log('Style context:', styleContext)
    console.log('Outfit details:', outfitDetails)

    // Check if Vertex AI is available
    if (!vertexAI || !projectId) {
      console.log('⚠️ Vertex AI not configured - using fallback placeholder image')
      
      return NextResponse.json({
        success: true,
        styledImageUrl: generateFallbackImage(),
        outfitRecommendation: `**Fallback Mode**\n\nContext: ${styleContext}\n${wardrobeDetails ? `\nYour items: ${wardrobeDetails}` : ''}\n\nTo generate AI-styled images, configure Vertex AI credentials.`,
        source: 'fallback-placeholder',
        note: 'Using placeholder image. Configure Vertex AI for AI-generated styled outfit images.'
      })
    }

    try {
      console.log('Step 1: Analyzing user photo with Gemini Vision...')
      
      // Get user photo as base64
      const { data: base64Image, mimeType } = await urlToBase64(profile.realistic_photo_url)
      
      // Analyze the user's appearance with Gemini Vision
      const visionModel = vertexAI.getGenerativeModel({
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
              text: `Analyze this person's key physical characteristics (gender, age, body type, skin tone, hair color/style, facial features) to create a detailed description for generating a styled fashion image. Be specific but respectful. Format: "A [age] [gender] with [features]..."`
            }
          ]
        }]
      }

      const visionResult = await visionModel.generateContent(visionRequest)
      const personDescription = visionResult.response.candidates?.[0]?.content?.parts?.[0]?.text || 'a person'
      console.log('✅ Person analyzed:', personDescription.substring(0, 100) + '...')

      console.log('Step 2: Generating multiple styled outfit variations with Vertex AI Imagen...')
      
      // Build comprehensive image generation prompts (3 variations)
      const basePrompt = `Professional full-body fashion photography of ${personDescription}, wearing ${outfitDetails}.

Context: ${styleContext}
${wardrobeDetails ? `Incorporating these items: ${wardrobeDetails}\n` : ''}
${customPrompt ? `Additional styling notes: ${customPrompt}\n` : ''}

Requirements:
- Complete outfit from head to toe (top, bottom, footwear, accessories)
- Perfectly styled and coordinated colors
- Appropriate for the specific occasion and environment
- Fashion-forward, modern, and trendy
- Well-fitted and flattering on the person
- Natural, confident pose

Photography: High-end fashion editorial, full body shot, professional studio lighting, clean background, photorealistic, sharp focus, high resolution.`

      // Create 3 variations with different styling approaches
      const variations = [
        {
          name: 'Classic Style',
          prompt: basePrompt + '\n\nStyle approach: Classic and timeless design with traditional colors and cuts.'
        },
        {
          name: 'Modern Trendy',
          prompt: basePrompt + '\n\nStyle approach: Contemporary and trendy with current fashion trends and bold choices.'
        },
        {
          name: 'Elegant Sophisticated',
          prompt: basePrompt + '\n\nStyle approach: Elegant and sophisticated with refined details and premium aesthetics.'
        }
      ]

      console.log('Generating 3 outfit variations...')

      // Generate image using Imagen 2 (we'll generate the first variation, or all 3 if needed)
      const imagenModel = vertexAI.getGenerativeModel({
        model: 'imagegeneration@006', // Imagen 2
      })

      // For now, let's generate one variation (you can loop for multiple)
      const selectedVariation = variations[Math.floor(Math.random() * variations.length)]
      console.log('Selected variation:', selectedVariation.name)

      const imagenRequest = {
        contents: [{
          role: 'user',
          parts: [{
            text: selectedVariation.prompt
          }]
        }],
        generationConfig: {
          temperature: 0.6,  // Increased for more variety
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      }

      const imagenResult = await imagenModel.generateContent(imagenRequest)
      
      // Extract the generated image
      const generatedImageData = imagenResult.response.candidates?.[0]?.content?.parts?.[0]
      
      if (!generatedImageData || !('inlineData' in generatedImageData) || !generatedImageData.inlineData?.data) {
        throw new Error('No image data returned from Imagen')
      }

      const base64GeneratedImage = generatedImageData.inlineData.data
      const generatedImageUrl = base64ToDataUrl(base64GeneratedImage, 'image/png')

      console.log('✅ Styled outfit image generated successfully!')

      // Optional: Save to Supabase Storage for persistence
      let savedImageUrl = generatedImageUrl
      try {
        const imageBuffer = Buffer.from(base64GeneratedImage, 'base64')
        const fileName = `styled-outfits/${user.id}/${Date.now()}.png`
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('garments')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            upsert: false
          })

        if (!uploadError) {
          const { data: urlData } = supabase
            .storage
            .from('garments')
            .getPublicUrl(fileName)
          
          savedImageUrl = urlData.publicUrl
          console.log('✅ Image saved to storage:', savedImageUrl)
        }
      } catch (storageError) {
        console.warn('Failed to save image to storage, using base64:', storageError)
      }

      return NextResponse.json({
        success: true,
        styledImageUrl: savedImageUrl,
        outfitRecommendation: `**AI-Generated Styled Outfit** - ${selectedVariation.name}\n\nContext: ${styleContext}\n\nOutfit: ${outfitDetails}\n\n${wardrobeDetails ? `Your Items: ${wardrobeDetails}\n\n` : ''}This image shows a personalized outfit styled specifically for your occasion.`,
        userDescription: personDescription,
        promptUsed: selectedVariation.prompt,
        variationStyle: selectedVariation.name,
        source: 'vertex-ai-imagen',
        note: 'Styled outfit image generated by Vertex AI Imagen based on your photo and preferences.'
      })

    } catch (aiError: any) {
      console.error('❌ Vertex AI image generation failed:', aiError)
      console.log('Falling back to placeholder image...')
      
      return NextResponse.json({
        success: true,
        styledImageUrl: generateFallbackImage(),
        outfitRecommendation: `**AI Generation Failed**\n\nContext: ${styleContext}\n${wardrobeDetails ? `\nYour items: ${wardrobeDetails}` : ''}\n\nError: ${aiError.message}`,
        source: 'fallback-after-error',
        error: aiError.message,
        note: 'Using placeholder due to AI service error.'
      })
    }

  } catch (error: any) {
    console.error('=== Error in styled outfit generation ===')
    console.error('Error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate styled outfit' },
      { status: 500 }
    )
  }
}
