'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { WardrobeItem } from '@/types'

export function useWardrobe(userId?: string) {
  const supabase = createClient()

  // Fetch all wardrobe items for a user
  const useUserWardrobe = () => {
    return useQuery({
      queryKey: ['wardrobe', userId],
      queryFn: async () => {
        if (!userId) return []

        const { data, error } = await supabase
          .from('wardrobe')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data as WardrobeItem[]
      },
      enabled: !!userId
    })
  }

  // Fetch wardrobe items by category
  const useWardrobeByCategory = (category: string) => {
    return useQuery({
      queryKey: ['wardrobe', userId, category],
      queryFn: async () => {
        if (!userId) return []

        const { data, error } = await supabase
          .from('wardrobe')
          .select('*')
          .eq('user_id', userId)
          .eq('category', category)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data as WardrobeItem[]
      },
      enabled: !!userId
    })
  }

  return {
    useUserWardrobe,
    useWardrobeByCategory
  }
}
