'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { calculateStyleSimilarity, sortBySimilarity } from '@/lib/similarity'
import { StyleSimilarity } from '@/types'

export function useStyleSimilarity() {
  const { user } = useAuth()
  const supabase = createClient()

  // Get all public outfits with style similarity
  const useSimilarOutfits = () => {
    return useQuery({
      queryKey: ['similar-outfits', user?.id],
      queryFn: async () => {
        if (!user?.id) return []

        // First, get user's outfits to calculate their average style
        const { data: userOutfits, error: userError } = await supabase
          .from('outfits')
          .select(`
            *,
            profiles!inner (user_id, display_name, avatar_photo_url)
          `)
          .eq('user_id', user.id)

        if (userError) throw userError

        // Calculate user's average outfit embedding
        let userAverageEmbedding: number[] = []
        if (userOutfits && userOutfits.length > 0) {
          const validEmbeddings = userOutfits
            .filter(outfit => outfit.outfit_embedding)
            .map(outfit => outfit.outfit_embedding!)
          
          if (validEmbeddings.length > 0) {
            // Average the embeddings
            userAverageEmbedding = validEmbeddings[0].map((_, i) =>
              validEmbeddings.reduce((sum, emb) => sum + emb[i], 0) / validEmbeddings.length
            )
          }
        }

        // If user has no outfits, use a default embedding
        if (userAverageEmbedding.length === 0) {
          userAverageEmbedding = Array.from({ length: 768 }, () => Math.random() * 2 - 1)
        }

        // Get all public outfits from other users
        const { data: allOutfits, error: outfitsError } = await supabase
          .from('outfits')
          .select(`
            *,
            profiles!inner (user_id, display_name, avatar_photo_url)
          `)
          .neq('user_id', user.id)
          .not('outfit_embedding', 'is', null)
          .order('created_at', { ascending: false })
          .limit(50)

        if (outfitsError) throw outfitsError

        if (!allOutfits) return []

        // Calculate similarities and get garment details
        const outfitsWithSimilarity: StyleSimilarity[] = []

        for (const outfit of allOutfits) {
          if (!outfit.outfit_embedding) continue

          const similarityScore = calculateStyleSimilarity(
            userAverageEmbedding,
            outfit.outfit_embedding
          )

          // Get garments for this outfit
          const { data: garments, error: garmentsError } = await supabase
            .from('garments')
            .select('*')
            .in('id', outfit.garment_ids)

          if (garmentsError) continue

          outfitsWithSimilarity.push({
            outfit_id: outfit.id,
            user_id: outfit.user_id,
            similarity_score: similarityScore,
            outfit: outfit,
            garments: garments || [],
            user_profile: outfit.profiles
          })
        }

        // Sort by similarity and return top results
        return outfitsWithSimilarity
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 20)

      },
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  // Get user's own outfits
  const useUserOutfits = () => {
    return useQuery({
      queryKey: ['user-outfits', user?.id],
      queryFn: async () => {
        if (!user?.id) return []

        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            profiles!inner (user_id, display_name, avatar_photo_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      },
      enabled: !!user?.id
    })
  }

  // Get specific outfit details
  const useOutfitDetails = (outfitId: string) => {
    return useQuery({
      queryKey: ['outfit', outfitId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            profiles!inner (user_id, display_name, avatar_photo_url)
          `)
          .eq('id', outfitId)
          .single()

        if (error) throw error

        // Get garments
        const { data: garments, error: garmentsError } = await supabase
          .from('garments')
          .select('*')
          .in('id', data.garment_ids)

        if (garmentsError) throw garmentsError

        return {
          outfit: data,
          garments: garments || [],
          user_profile: data.profiles
        }
      },
      enabled: !!outfitId
    })
  }

  return {
    useSimilarOutfits,
    useUserOutfits,
    useOutfitDetails
  }
}
