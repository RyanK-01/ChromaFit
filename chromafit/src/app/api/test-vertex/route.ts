import { NextResponse } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'

export async function GET() {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim()
    const location = process.env.GOOGLE_CLOUD_LOCATION?.trim() || 'us-central1'
    
    console.log('=== Vertex AI Test ===')
    console.log('Project ID:', projectId)
    console.log('Location:', location)
    console.log('Has GOOGLE_APPLICATION_CREDENTIALS:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS)
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_CLOUD_PROJECT_ID not set',
        configured: false
      })
    }

    // Try to initialize Vertex AI
    const vertexAI = new VertexAI({ project: projectId, location })
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    console.log('Vertex AI initialized, testing model...')

    // Simple test prompt
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello from Vertex AI!" and nothing else.' }] }],
    })

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text

    return NextResponse.json({
      success: true,
      configured: true,
      response: responseText,
      projectId,
      location
    })

  } catch (error) {
    console.error('Vertex AI test failed:', error)
    
    return NextResponse.json({
      success: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hint: 'You may need to authenticate with: gcloud auth application-default login'
    }, { status: 500 })
  }
}
