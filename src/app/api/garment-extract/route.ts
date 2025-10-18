import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, sourceType, sourceUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      )
    }

    // Mock garment extraction - deterministic based on image URL
    const categories = ['t-shirt', 'jeans', 'dress', 'shirt', 'pants', 'shorts', 'jacket', 'sweater', 'skirt', 'shoes', 'accessories']
    const hash = imageUrl.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const categoryIndex = hash % categories.length
    const category = categories[categoryIndex]

    // Generate mock measurements based on category
    const measurements = generateMockMeasurements(category, imageUrl)

    // Generate mock CLIP embedding (768 dimensions)
    const clipEmbedding = generateMockEmbedding(imageUrl, 768)

    const response = {
      category,
      measurements,
      clipEmbedding
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in garment-extract API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock utility functions (simplified versions)
function generateMockMeasurements(category: string, seed: string): any {
  const hash = seed.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  const random = (hash * 9301 + 49297) % 233280 / 233280

  const baseMeasurements = {
    't-shirt': {
      chest: Math.round(85 + random * 20),
      length: Math.round(60 + random * 15),
      sleeve_length: Math.round(20 + random * 5)
    },
    'jeans': {
      waist: Math.round(70 + random * 15),
      hips: Math.round(90 + random * 20),
      inseam: Math.round(75 + random * 10)
    },
    'dress': {
      chest: Math.round(80 + random * 20),
      waist: Math.round(65 + random * 15),
      hips: Math.round(85 + random * 20),
      length: Math.round(90 + random * 30)
    },
    'shirt': {
      chest: Math.round(90 + random * 20),
      length: Math.round(70 + random * 10),
      sleeve_length: Math.round(55 + random * 10)
    },
    'pants': {
      waist: Math.round(70 + random * 20),
      hips: Math.round(90 + random * 25),
      inseam: Math.round(75 + random * 10)
    },
    'shorts': {
      waist: Math.round(70 + random * 15),
      hips: Math.round(90 + random * 20),
      length: Math.round(40 + random * 10)
    },
    'jacket': {
      chest: Math.round(95 + random * 20),
      length: Math.round(65 + random * 10),
      sleeve_length: Math.round(55 + random * 10)
    },
    'sweater': {
      chest: Math.round(90 + random * 20),
      length: Math.round(60 + random * 15),
      sleeve_length: Math.round(55 + random * 10)
    },
    'skirt': {
      waist: Math.round(65 + random * 15),
      hips: Math.round(85 + random * 20),
      length: Math.round(40 + random * 40)
    },
    'shoes': {
      length: Math.round(25 + random * 5)
    },
    'accessories': {}
  }

  const measurements = baseMeasurements[category as keyof typeof baseMeasurements] || {}
  return {
    ...measurements,
    unit: 'cm'
  }
}

function generateMockEmbedding(seed: string, dimensions: number = 768): number[] {
  const hash = seed.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  
  const embedding: number[] = []
  for (let i = 0; i < dimensions; i++) {
    const random = (hash * (i + 1) * 9301 + 49297) % 233280 / 233280
    embedding.push(random * 2 - 1) // Scale to [-1, 1]
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}
