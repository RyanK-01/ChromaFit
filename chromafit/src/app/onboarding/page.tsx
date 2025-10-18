'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const handleSkipToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to ChromaFit!</h1>
          <p className="text-xl text-gray-600">
            Let's create your 3D avatar
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Create Your 3D Avatar</CardTitle>
            <CardDescription className="text-center">
              Upload a photo to generate your personalized 3D avatar with accurate body measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">What you'll need:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>A full-body photo (front-facing works best)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Good lighting conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Wear form-fitting clothes for accurate measurements</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => alert('Avatar upload feature coming soon! For now, skip to dashboard to explore.')}
              >
                Upload Photo & Create Avatar
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSkipToDashboard}
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Your photo will be processed securely and used only to create your 3D avatar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
