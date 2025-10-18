import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { photoUrl } = await request.json()

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'photoUrl is required' },
        { status: 400 }
      )
    }

    // For now, we'll use mock data since we don't have the actual Edge Function deployed
    // In production, this would call the Supabase Edge Function
    const mockResponse = {
      bodyMetrics: {
        height: 175, // cm
        chest: 92,   // cm
        waist: 78,   // cm
        hips: 95,    // cm
        weight: 70   // kg
      },
      smplParams: {
        shape: Array.from({ length: 10 }, () => Math.random() * 2 - 1),
        pose: Array.from({ length: 72 }, () => Math.random() * 0.2 - 0.1)
      }
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Error in body-extract API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
