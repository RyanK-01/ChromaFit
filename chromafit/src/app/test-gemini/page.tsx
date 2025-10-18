'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

export default function GeminiTestPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testGemini = async () => {
    setTesting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-gemini')
      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    // Auto-test on page load
    testGemini()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gemini API Status Check
          </h1>
          <p className="text-gray-600">
            Testing your Gemini API configuration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>API Connection Test</span>
              <Button 
                onClick={testGemini} 
                disabled={testing}
                size="sm"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Again
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              Verifying Gemini API key and connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Testing Gemini API...</span>
              </div>
            )}

            {result && !testing && (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold text-green-900">
                      {result.message}
                    </p>
                    <p className="text-sm text-green-700">
                      Model: {result.model}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Gemini Response:
                  </h3>
                  <p className="text-gray-700 italic">
                    "{result.geminiResponse}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">API Key Status</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {result.apiKeyConfigured ? '✅ Configured' : '❌ Missing'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">Connection</p>
                    <p className="text-lg font-semibold text-purple-900">
                      ✅ Active
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Tested at: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {error && !testing && (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">
                      Test Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {error}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Troubleshooting Steps:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                    <li>Check that GEMINI_API_KEY is set in .env.local</li>
                    <li>Verify your API key is valid at https://makersuite.google.com/app/apikey</li>
                    <li>Ensure you have quota remaining (free tier: 1,500 requests/day)</li>
                    <li>Restart the development server after adding the API key</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Updated API Endpoints</CardTitle>
            <CardDescription>
              All endpoints now use Gemini instead of OpenAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">/api/generate-styled-outfit</p>
                  <p className="text-sm text-gray-600">Outfit styling recommendations</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Updated
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">/api/generate-2d-avatar</p>
                  <p className="text-sm text-gray-600">Avatar descriptions</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Updated
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">/api/generate-garment</p>
                  <p className="text-sm text-gray-600">Product descriptions</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Updated
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Text-Based Responses:</strong> Gemini provides intelligent text descriptions 
                and recommendations instead of generated images. This is a cost-effective solution 
                with a generous free tier.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>✅ Free Tier:</strong> 15 requests per minute, 1,500 requests per day - 
                perfect for development and testing!
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>🚀 Future Enhancement:</strong> To add image generation, integrate Google 
                Imagen API or another image generation service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
