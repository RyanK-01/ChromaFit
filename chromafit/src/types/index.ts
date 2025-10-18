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

// AI Styling Types
export type EnvironmentType = 
  | 'office'
  | 'school'
  | 'gym'
  | 'casual'
  | 'formal'

export type OccasionType = 
  | 'party'
  | 'date'
  | 'wedding'
  | 'interview'
  | 'meeting'
  | 'workout'
  | 'everyday'

export interface StyledOutfit {
  id: string
  user_id: string
  name: string
  environment_type?: EnvironmentType | null
  occasion_type?: OccasionType | null
  styled_image_url: string
  wardrobe_items?: string[] | null
  prompt_used?: string | null
  rating?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateStyledOutfit {
  name: string
  environment_type?: EnvironmentType
  occasion_type?: OccasionType
  styled_image_url: string
  wardrobe_items?: string[]
  prompt_used?: string
  notes?: string
}

export interface StyleRequest {
  environmentType?: EnvironmentType
  occasionType?: OccasionType
  selectedItems?: string[]
  customPrompt?: string
}

// Garment Types
export type GarmentCategory = 
  | 't-shirt'
  | 'jeans'
  | 'dress'
  | 'shirt'
  | 'pants'
  | 'shorts'
  | 'jacket'
  | 'sweater'
  | 'skirt'
  | 'shoes'
  | 'accessories'

export interface Garment {
  id: string
  user_id: string
  name: string
  category: GarmentCategory
  image_url: string
  measurements: GarmentMeasurements | null
  clip_embedding: number[] | null
  source_type: 'upload' | 'url'
  source_url: string | null
  created_at: string
}

export interface GarmentMeasurements {
  chest?: number
  waist?: number
  hips?: number
  length?: number
  sleeve_length?: number
  inseam?: number
  unit: 'cm' | 'inches'
}

// Try-On Types
export interface TryOn {
  id: string
  user_id: string
  garment_id: string
  result_image_url: string | null
  fit_score: number
  fit_explanation: FitExplanation | null
  created_at: string
  garments?: Garment
}

export interface FitExplanation {
  fit: string
  style: string
  comfort: string
}

export interface TryOnGenerateRequest {
  userId: string
  garmentId: string
}

export interface TryOnGenerateResponse {
  resultImageUrl: string
  fitScore: number
  explanation: FitExplanation
}
