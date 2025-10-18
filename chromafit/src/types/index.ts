// User and Profile Types
export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

export interface Profile {
  user_id: string
  display_name: string | null
  avatar_photo_url: string | null
  realistic_photo_url: string | null
  body_metrics: any | null
  smpl_params: any | null
  created_at: string
  updated_at: string
}

// Wardrobe Types
export type WardrobeCategory = 
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'other'

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: WardrobeCategory
  original_photo_url: string
  ai_generated_url: string | null
  brand?: string | null
  size?: string | null
  color?: string | null
  material?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateWardrobeItem {
  name: string
  category: WardrobeCategory
  original_photo_url: string
  brand?: string
  size?: string
  color?: string
  material?: string
  notes?: string
}

export interface UpdateWardrobeItem {
  name?: string
  category?: WardrobeCategory
  brand?: string
  size?: string
  color?: string
  material?: string
  notes?: string
  ai_generated_url?: string
}
