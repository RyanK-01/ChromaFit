import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, garmentId } = await request.json()

    if (!userId || !garmentId) {
      return NextResponse.json(
        { error: 'userId and garmentId are required' },
        { status: 400 }
      )
    }

    // Generate mock try-on result
    const seed = `${userId}-${garmentId}`
    const hash = seed.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    
    // Generate deterministic fit score (65-95 range)
    const fitScore = 0.65 + ((hash % 300) / 300) * 0.3

    // Generate mock result image URL (placeholder)
    const resultImageUrl = `https://via.placeholder.com/400x600/cccccc/666666?text=Try-On+Result+${garmentId.slice(-6)}`

    // Generate mock explanations
    const explanations = [
      {
        fit: "The garment fits well around your body type with appropriate sizing and good proportions.",
        style: "This piece complements your style preferences and creates a flattering silhouette.",
        comfort: "The fabric and cut provide good comfort and freedom of movement for daily wear."
      },
      {
        fit: "Good overall fit with minor adjustments needed in the waist area for optimal comfort.",
        style: "The silhouette works well with your body shape and personal style aesthetic.",
        comfort: "Comfortable fit with breathable fabric and appropriate looseness for flexibility."
      },
      {
        fit: "Excellent fit that follows your natural body contours perfectly with ideal proportions.",
        style: "This piece enhances your style and creates a very flattering, modern silhouette.",
        comfort: "Very comfortable with excellent range of motion, soft fabric, and perfect fit."
      }
    ]

    // Select explanation based on fit score
    let explanationIndex = 0
    if (fitScore >= 0.85) explanationIndex = 2
    else if (fitScore >= 0.75) explanationIndex = 1

    const response = {
      resultImageUrl,
      fitScore: Math.round(fitScore * 100) / 100,
      explanation: explanations[explanationIndex]
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in tryon-generate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
