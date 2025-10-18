import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { garmentIds } = await request.json()

    if (!garmentIds || !Array.isArray(garmentIds) || garmentIds.length === 0) {
      return NextResponse.json(
        { error: 'garmentIds array is required and must not be empty' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch garment embeddings
    const { data: garments, error } = await supabase
      .from('garments')
      .select('clip_embedding')
      .in('id', garmentIds)
      .not('clip_embedding', 'is', null)

    if (error) throw error

    if (!garments || garments.length === 0) {
      return NextResponse.json(
        { error: 'No garments found with embeddings' },
        { status: 404 }
      )
    }

    // Average the embeddings
    const embeddings = garments.map(g => g.clip_embedding)
    const outfitEmbedding = embeddings[0].map((_, i) =>
      embeddings.reduce((sum, emb) => sum + emb[i], 0) / embeddings.length
    )

    // Normalize the vector
    const magnitude = Math.sqrt(outfitEmbedding.reduce((sum, val) => sum + val * val, 0))
    const normalizedEmbedding = outfitEmbedding.map(val => val / magnitude)

    const response = {
      outfitEmbedding: normalizedEmbedding
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in embedding-outfit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
