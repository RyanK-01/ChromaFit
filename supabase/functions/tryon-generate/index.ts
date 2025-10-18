import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateMockFitScore } from '../_shared/mock-utils.ts'

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
    const { userId, garmentId } = await req.json()

    if (!userId || !garmentId) {
      return new Response(
        JSON.stringify({ error: 'userId and garmentId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a mock result image URL (placeholder)
    const resultImageUrl = `https://via.placeholder.com/400x600/cccccc/666666?text=Try-On+Result+${garmentId.slice(-6)}`

    // Generate mock fit score and explanation
    const seed = `${userId}-${garmentId}`
    const { fitScore, explanation } = generateMockFitScore(seed)

    const response = {
      resultImageUrl,
      fitScore,
      explanation
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in tryon-generate function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
