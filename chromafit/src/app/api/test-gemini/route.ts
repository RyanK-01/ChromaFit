import { NextRequest, NextResponse } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'

export async function GET(request: NextRequest) {
  try {
    // Check if Vertex AI is configured
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

    if (!projectId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Vertex AI is not configured',
          message: 'Please add GOOGLE_CLOUD_PROJECT_ID to your .env.local file'
        },
        { status: 500 }
      )
    }

    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
    })

    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    // Test with a simple prompt
    console.log('Testing Vertex AI Gemini...')
    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: 'Say "Hello from Vertex AI Gemini!" and confirm you are working.' }]
      }]
    }

    const result = await generativeModel.generateContent(request)
    const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({
      success: true,
      message: 'Vertex AI Gemini is working correctly! ✅',
      geminiResponse: response,
      projectConfigured: true,
      model: 'gemini-1.5-flash',
      location: location,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Vertex AI test error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to test Vertex AI',
        details: error.toString(),
        projectConfigured: !!process.env.GOOGLE_CLOUD_PROJECT_ID
      },
      { status: 500 }
    )
  }
}
