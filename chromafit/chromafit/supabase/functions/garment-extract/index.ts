import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateMockEmbedding, generateMockMeasurements, generateMockCategory } from '../_shared/mock-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, sourceType, sourceUrl } = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate mock category based on image URL
    const category = generateMockCategory(imageUrl)

    // Generate mock measurements based on category
    const measurements = generateMockMeasurements(category, imageUrl)

    // Generate mock CLIP embedding (768 dimensions)
    const clipEmbedding = generateMockEmbedding(imageUrl, 768)

    const response = {
      category,
      measurements,
      clipEmbedding
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in garment-extract function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
