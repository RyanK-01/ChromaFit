import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateMockEmbedding } from '../_shared/mock-utils.ts'

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
    const { garmentIds } = await req.json()

    if (!garmentIds || !Array.isArray(garmentIds) || garmentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'garmentIds array is required and must not be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate mock outfit embedding by averaging garment embeddings
    // In a real implementation, this would fetch actual garment embeddings and average them
    const outfitSeed = garmentIds.join('-')
    const outfitEmbedding = generateMockEmbedding(outfitSeed, 768)

    const response = {
      outfitEmbedding
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in embedding-outfit function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
