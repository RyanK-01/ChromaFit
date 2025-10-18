// Database types
export interface Profile {
  user_id: string
  display_name: string | null
  avatar_photo_url: string | null
  body_metrics: BodyMetrics | null
  smpl_params: SMPLParams | null
  created_at: string
}

export interface BodyMetrics {
  height: number // cm
  chest: number // cm
  waist: number // cm
  hips: number // cm
  weight?: number // kg
}

export interface SMPLParams {
  shape: number[] // 10-dimensional shape parameters
  pose: number[] // 72-dimensional pose parameters
}

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

export interface GarmentMeasurements {
  chest?: number
  waist?: number
  hips?: number
  length?: number
  sleeve_length?: number
  inseam?: number
  unit: 'cm' | 'inches'
}

export interface TryOn {
  id: string
  user_id: string
  garment_id: string
  result_image_url: string | null
  fit_score: number
  fit_explanation: FitExplanation | null
  created_at: string
}

export interface FitScore {
  score: number // 0-1
  explanation: FitExplanation
}

export interface FitExplanation {
  fit: string
  style: string
  comfort: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  garment_ids: string[]
  outfit_embedding: number[] | null
  created_at: string
}

export interface StyleSimilarity {
  outfit_id: string
  user_id: string
  similarity_score: number
  outfit: Outfit
  garments: Garment[]
  user_profile: Profile
}

// API request/response types
export interface BodyExtractRequest {
  photoUrl: string
}

export interface BodyExtractResponse {
  bodyMetrics: BodyMetrics
  smplParams: SMPLParams
}

export interface GarmentExtractRequest {
  imageUrl: string
  sourceType: 'upload' | 'url'
  sourceUrl?: string
}

export interface GarmentExtractResponse {
  category: GarmentCategory
  measurements: GarmentMeasurements
  clipEmbedding: number[]
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

export interface EmbeddingOutfitRequest {
  garmentIds: string[]
}

export interface EmbeddingOutfitResponse {
  outfitEmbedding: number[]
}

// UI state types
export interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export interface TryOnState {
  isGenerating: boolean
  result: TryOnGenerateResponse | null
  error: string | null
}
