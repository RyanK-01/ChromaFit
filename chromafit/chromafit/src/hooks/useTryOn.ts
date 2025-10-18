'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { TryOn, TryOnGenerateResponse } from '@/types'

export function useTryOn() {
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Generate try-on mutation
  const generateTryOnMutation = useMutation({
    mutationFn: async ({ userId, garmentId }: { userId: string; garmentId: string }) => {
      const response = await fetch('/api/tryon-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, garmentId })
      })

      if (!response.ok) throw new Error('Failed to generate try-on')

      return response.json() as Promise<TryOnGenerateResponse>
    },
    onSuccess: async (data, variables) => {
      // Save try-on record to database
      const { error } = await supabase
        .from('tryons')
        .insert({
          user_id: variables.userId,
          garment_id: variables.garmentId,
          result_image_url: data.resultImageUrl,
          fit_score: data.fitScore,
          fit_explanation: data.explanation
        })

      if (error) throw error

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tryons', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['recent-tryons', variables.userId] })
    }
  })

  // Get user's try-ons
  const useUserTryOns = (userId?: string) => {
    return useQuery({
      queryKey: ['tryons', userId],
      queryFn: async () => {
        if (!userId) return []

        const { data, error } = await supabase
          .from('tryons')
          .select(`
            *,
            garments (
              id,
              name,
              category,
              image_url
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data as TryOn[]
      },
      enabled: !!userId
    })
  }

  // Get specific try-on
  const useTryOnById = (tryOnId: string) => {
    return useQuery({
      queryKey: ['tryon', tryOnId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tryons')
          .select(`
            *,
            garments (
              id,
              name,
              category,
              image_url
            )
          `)
          .eq('id', tryOnId)
          .single()

        if (error) throw error
        return data as TryOn
      },
      enabled: !!tryOnId
    })
  }

  return {
    generateTryOn: generateTryOnMutation,
    useUserTryOns,
    useTryOnById
  }
}
