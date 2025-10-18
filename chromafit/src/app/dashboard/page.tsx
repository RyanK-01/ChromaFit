'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, LogOut, Shirt, Users, Sparkles } from 'lucide-react'

export default function DashboardPage() {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👕</div>
              <h1 className="text-2xl font-bold text-gray-900">ChromaFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Your virtual wardrobe and try-on dashboard
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="mt-4">My Profile</CardTitle>
              <CardDescription>
                View and edit your 3D avatar and body measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push('/profile')}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Wardrobe Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Shirt className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <CardTitle className="mt-4">My Wardrobe</CardTitle>
              <CardDescription>
                Manage your virtual wardrobe and add new garments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Wardrobe
              </Button>
            </CardContent>
          </Card>

          {/* Try-On Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="mt-4">Virtual Try-On</CardTitle>
              <CardDescription>
                Try on garments with AI-powered fit analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start Try-On
              </Button>
            </CardContent>
          </Card>

          {/* Explore Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <CardTitle className="mt-4">Explore Styles</CardTitle>
              <CardDescription>
                Discover similar outfits from other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Explore
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Complete these steps to get the most out of ChromaFit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create Account</p>
                    <p className="text-sm text-gray-500">Welcome to ChromaFit!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Upload Your Photo</p>
                    <p className="text-sm text-gray-500">Create your 3D avatar</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Add Garments</p>
                    <p className="text-sm text-gray-500">Build your virtual wardrobe</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Try On Clothes</p>
                    <p className="text-sm text-gray-500">Experience virtual try-on</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
