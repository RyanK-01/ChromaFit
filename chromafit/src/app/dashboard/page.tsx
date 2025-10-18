'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, LogOut, Shirt, Users, Sparkles, Flame } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
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
        
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitial = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0).toUpperCase()
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👕</div>
              <h1 className="text-2xl font-bold text-gray-900">ChromaFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Picture or Initial - Clickable */}
              <button 
                onClick={() => router.push('/profile')}
                className="relative group"
                title="View Profile"
              >
                {profile?.avatar_photo_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors cursor-pointer">
                    <Image
                      src={profile.avatar_photo_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center font-semibold text-lg transition-colors cursor-pointer">
                    {getInitial()}
                  </div>
                )}
                {/* Hover tooltip */}
                <div className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  View Profile
                </div>
              </button>
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
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Your virtual wardrobe and try-on dashboard
          </p>
        </motion.div>

        {/* Dashboard Grid - 2x2 layout for 4 cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Wardrobe Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-purple-100 p-3 rounded-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Shirt className="h-6 w-6 text-purple-600" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4">My Wardrobe</CardTitle>
                <CardDescription>
                  Manage your virtual wardrobe and add new garments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  onClick={() => router.push('/dashboard/wardrobe')}
                >
                  View Wardrobe
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Virtual Try-On Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-green-100 p-3 rounded-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4">Virtual Try-On</CardTitle>
                <CardDescription>
                  Try on garments with AI-powered fit analysis
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => router.push('/dashboard/tryon')}
              >
                Start Try-On
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          {/* AI Styling Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-pink-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-pink-100 p-3 rounded-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Sparkles className="h-6 w-6 text-pink-600" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4">AI Styling</CardTitle>
                <CardDescription>
                  Generate styled outfit images for any occasion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-pink-600 hover:bg-pink-700" 
                  onClick={() => router.push('/dashboard/ai-styling')}
                >
                  Try AI Styling
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Explore Trending Styles Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-orange-100 p-3 rounded-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Flame className="h-6 w-6 text-orange-600" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4">Explore Trending Styles</CardTitle>
                <CardDescription>
                  Discover what's trending in fashion right now
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                onClick={() => router.push('/dashboard/explore')}
              >
                Explore Trends
              </Button>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
