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
      console.log('🚀 Calling try-on API with:', { userId, garmentId })
      
      const response = await fetch('/api/tryon-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, garmentId })
      })

      console.log('📡 API Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`Server error: ${response.statusText}`)
        }
        
        throw new Error(errorData.error || errorData.details || 'Failed to generate try-on')
      }

      const data = await response.json()
      console.log('✅ API Success:', data)
      return data as TryOnGenerateResponse
    },
    onSuccess: async (data, variables) => {
      console.log('💾 Attempting to save try-on result to database...')
      
      // Save try-on record to database (optional - don't fail if this errors)
      try {
        const { error } = await supabase
          .from('tryons')
          .insert({
            user_id: variables.userId,
            garment_id: variables.garmentId,
            result_image_url: data.resultImageUrl,
            fit_score: data.fitScore,
            fit_explanation: data.explanation
          })

        if (error) {
          console.warn('⚠️ Failed to save try-on to database (non-critical):', error)
          console.warn('This might be due to missing tryons table or foreign key constraints')
        } else {
          console.log('✅ Try-on result saved to database')
          // Invalidate related queries only if save was successful
          queryClient.invalidateQueries({ queryKey: ['tryons', variables.userId] })
          queryClient.invalidateQueries({ queryKey: ['recent-tryons', variables.userId] })
        }
      } catch (dbError) {
        console.warn('⚠️ Database save error (non-critical):', dbError)
      }
    },
    onError: (error) => {
      console.error('❌ Try-on mutation error:', error)
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
