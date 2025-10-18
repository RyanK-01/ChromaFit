'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Profile, SMPLParams } from '@/types'

export function useAvatarModel(userId?: string) {
  const supabase = createClient()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
  })

  const avatarReady = profile?.smpl_params !== null && profile?.avatar_photo_url !== null

  return {
    profile,
    smplParams: profile?.smpl_params as SMPLParams | null,
    avatarPhotoUrl: profile?.avatar_photo_url,
    bodyMetrics: profile?.body_metrics,
    isLoading,
    error,
    avatarReady
  }
}
