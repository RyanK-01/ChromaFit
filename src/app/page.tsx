'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ChromaFit
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create your 3D avatar, try on virtual garments, and discover your perfect fit with AI-powered style analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>3D Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload a photo to create your personalized 3D avatar with accurate body measurements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Virtual Try-On</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Try on garments from your wardrobe or online stores with realistic 3D visualization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get AI-powered fit scores and style recommendations based on your body type and preferences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
