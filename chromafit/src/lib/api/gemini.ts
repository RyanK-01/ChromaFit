/**
 * OpenAI API Integration
 * Generates 2D avatar images from user photos for styling purposes using DALL-E
 */

interface OpenAIResponse {
  created: number
  data: Array<{
    url?: string
    b64_json?: string
    revised_prompt?: string
  }>
}

interface Generate2DImageOptions {
  photoUrl: string
  userId: string
  style?: 'realistic' | 'illustration' | 'cartoon'
}

/**
 * Generate a 2D avatar image from a photo using OpenAI DALL-E
 * @param options - Configuration for image generation
 * @returns URL of the generated 2D image or null if failed
 */
export async function generate2DImage(
  options: Generate2DImageOptions
): Promise<string | null> {
  const { photoUrl, userId, style = 'realistic' } = options

  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('Missing OpenAI API configuration')
      throw new Error('OpenAI API is not configured. Please check your environment variables.')
    }

    // Generate a descriptive prompt based on style
    const stylePrompts = {
      realistic: 'Create a photorealistic 2D portrait suitable for virtual fashion try-on. The image should show a clear front-facing view with neutral expression and plain background.',
      illustration: 'Create a stylized illustrated portrait suitable for virtual fashion try-on. Use clean lines and modern illustration style with neutral expression and plain background.',
      cartoon: 'Create a friendly cartoon-style portrait suitable for virtual fashion try-on. Use bold colors and simple shapes with neutral expression and plain background.'
    }

    const prompt = `Based on the provided photo, ${stylePrompts[style]} Maintain accurate facial features and proportions for clothing visualization.`

    console.log('Calling OpenAI API to generate 2D image...')
    
    // Note: OpenAI's DALL-E doesn't directly accept image URLs for editing
    // We'll use the image generation with a descriptive prompt
    // For actual image-to-image, we'd need to use GPT-4 Vision + DALL-E pipeline
    
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
        quality: 'standard',
        response_format: 'url'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API failed with status ${response.status}`)
    }

    const data: OpenAIResponse = await response.json()
    console.log('OpenAI API response:', data)

    // Extract the generated image URL from response
    if (data.data && data.data.length > 0) {
      const imageData = data.data[0]
      
      if (imageData.url) {
        return imageData.url
      }
      
      if (imageData.b64_json) {
        return `data:image/png;base64,${imageData.b64_json}`
      }
    }

    throw new Error('No generated image in response')
  } catch (error: any) {
    console.error('Error generating 2D image with OpenAI:', error)
    return null
  }
}

/**
 * Generate 2D avatar using GPT-4 Vision to analyze the photo first
 * This provides better results by understanding the photo context
 */
export async function generate2DImageWithVision(
  photoUrl: string,
  userId: string,
  style: 'realistic' | 'illustration' | 'cartoon' = 'realistic'
): Promise<string | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OpenAI API is not configured')
    }

    console.log('Step 1: Analyzing photo with GPT-4 Vision...')

    // Step 1: Use GPT-4 Vision to analyze the photo
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
      console.error('GPT-4 Vision failed, falling back to basic generation')
      return generate2DImage({ photoUrl, userId, style })
    }

    const visionData = await visionResponse.json()
    const description = visionData.choices[0]?.message?.content || ''

    console.log('Step 2: Generating 2D avatar based on analysis...')

    // Step 2: Generate image with DALL-E using the description
    const styleInstructions = {
      realistic: 'photorealistic style',
      illustration: 'modern illustration style',
      cartoon: 'friendly cartoon style'
    }

    const enhancedPrompt = `Create a ${styleInstructions[style]} 2D portrait for virtual fashion try-on: ${description}. Front-facing view, neutral expression, plain white background, waist-up shot, suitable for clothing overlay.`

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      }),
    })

    if (!imageResponse.ok) {
      throw new Error('DALL-E generation failed')
    }

    const imageData: OpenAIResponse = await imageResponse.json()

    if (imageData.data && imageData.data.length > 0) {
      const url = imageData.data[0].url
      if (url) {
        console.log('2D avatar generated successfully with Vision + DALL-E')
        return url
      }
    }

    throw new Error('No generated image in response')
  } catch (error: any) {
    console.error('Error generating 2D image with Vision:', error)
    // Fallback to basic generation
    return generate2DImage({ photoUrl, userId, style })
  }
}

/**
 * Download and convert base64 image to blob
 * @param base64Data - Base64 encoded image data
 * @returns Blob of the image
 */
export function base64ToBlob(base64Data: string): Blob {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '')
  
  // Convert base64 to binary
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return new Blob([bytes], { type: 'image/png' })
}

/**
 * Check if OpenAI API is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Legacy function name for backward compatibility
 */
export function isGeminiConfigured(): boolean {
  return isOpenAIConfigured()
}
