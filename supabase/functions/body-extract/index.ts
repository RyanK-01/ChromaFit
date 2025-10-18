import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateMockSMPLParams } from '../_shared/mock-utils.ts'

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
    const { photoUrl } = await req.json()

    if (!photoUrl) {
      return new Response(
        JSON.stringify({ error: 'photoUrl is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mock body metrics - deterministic based on photo URL
    const bodyMetrics = {
      height: 175, // cm
      chest: 92,   // cm
      waist: 78,   // cm
      hips: 95,    // cm
      weight: 70   // kg
    }

    // Generate mock SMPL parameters
    const smplParams = generateMockSMPLParams(bodyMetrics, photoUrl)

    const response = {
      bodyMetrics,
      smplParams
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in body-extract function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
