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
  const [aiRecommendation, setAiRecommendation] = useState<string>('')
  const [selectedMood, setSelectedMood] = useState<string>('')

  const getMoodRecommendation = (mood: string) => {
    switch (mood) {
      case '😎':
        return 'dress stylish'
      case '🥰':
        return 'dress confident'
      case '😴':
        return 'dress comfortably'
      default:
        return ''
    }
  }
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

        // Set AI recommendation based on weather (simulated for now)
        const recommendations = [
          'pastel tones for this week\'s weather',
          'layered outfits for the changing temperatures',
          'earth tones to match the season',
          'bright colors to lift your mood'
        ]
        const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)]
        setAiRecommendation(randomRec)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    let timeGreeting = '👋'
    if (hour >= 5 && hour < 12) {
      timeGreeting = '🌞'
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = '☀️'
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = '🌅'
    } else {
      timeGreeting = '🌙'
    }

    const name = profile?.display_name || user?.user_metadata?.full_name || 'there'
    const firstName = name.split(' ')[0]

    let greeting = 'Welcome'
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning'
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon'
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening'
    } else {
      greeting = 'Good evening'
    }

    return `${greeting}, ${firstName} ${timeGreeting}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6DCD3]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-neutral-300 border-t-neutral-800"></div>
          <p className="mt-4 text-neutral-600 font-light">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-fabric-bg overflow-hidden">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-normal tracking-tight text-neutral-800 font-display">ChromaFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Picture or Initial - Clickable */}
              <button 
                onClick={() => router.push('/profile')}
                className="relative group"
                title="View Profile"
              >
                {profile?.avatar_photo_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-200 group-hover:border-neutral-400 transition-colors cursor-pointer">
                    <Image
                      src={profile.avatar_photo_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-neutral-700 text-white flex items-center justify-center font-light text-lg transition-colors cursor-pointer">
                    {getInitial()}
                  </div>
                )}
                {/* Hover tooltip */}
                <div className="absolute -bottom-8 right-0 bg-neutral-800 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  View Profile
                </div>
              </button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="rounded-full border-neutral-300 hover:bg-neutral-100 text-neutral-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-display text-neutral-800 mb-3 tracking-tight">
            {getGreeting()}
          </h2>
          <p className="text-lg text-neutral-600 font-light mb-8">
            Ready to style something new?
          </p>
          <motion.div
            className="w-full max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-neutral-200">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-xl font-display text-neutral-800 mb-2">How do you feel today?</CardTitle>
                  <CardDescription className="text-neutral-600">Select your mood for personalized style recommendations</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-8">
                  {['😎', '🥰', '😴'].map((mood) => (
                    <motion.button
                      key={mood}
                      onClick={() => {
                        setSelectedMood(mood)
                        setAiRecommendation(getMoodRecommendation(mood))
                      }}
                      className={`p-4 text-4xl rounded-2xl transition-all duration-200 ${
                        selectedMood === mood 
                          ? 'bg-white shadow-lg scale-110 hover:bg-neutral-50' 
                          : 'hover:bg-white/80 hover:scale-105'
                      }`}
                      whileHover={{ 
                        scale: selectedMood === mood ? 1.1 : 1.05,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {mood}
                    </motion.button>
                  ))}
                </div>
                {aiRecommendation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-neutral-800 text-white rounded-2xl shadow-sm"
                  >
                    <p className="text-lg font-light">
                      Let's <span className="font-medium">{aiRecommendation}</span> today!
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Dashboard Grid - 2x2 layout for 4 cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Wardrobe Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { type: "spring", stiffness: 400 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-neutral-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-neutral-100 p-3 rounded-xl"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Shirt className="h-6 w-6 text-neutral-800" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4 text-xl font-display text-neutral-800">My Wardrobe</CardTitle>
                <CardDescription className="text-neutral-600">
                  Manage your virtual wardrobe and add new garments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-white font-light" 
                  onClick={() => router.push('/dashboard/wardrobe')}
                >
                  Open wardrobe
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Virtual Try-On Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { type: "spring", stiffness: 400 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-neutral-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-neutral-100 p-3 rounded-xl"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Sparkles className="h-6 w-6 text-neutral-800" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4 text-xl font-display text-neutral-800">Virtual Try-On</CardTitle>
                <CardDescription className="text-neutral-600">
                  Try on garments with AI-powered fit analysis
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-white font-light" 
                onClick={() => router.push('/dashboard/tryon')}
              >
                Start try-on
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          {/* AI Styling Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { type: "spring", stiffness: 400 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-neutral-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-neutral-100 p-3 rounded-xl"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Sparkles className="h-6 w-6 text-neutral-800" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4 text-xl font-display text-neutral-800">AI Styling</CardTitle>
                <CardDescription className="text-neutral-600">
                  Generate styled outfit images for any occasion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-white font-light" 
                  onClick={() => router.push('/dashboard/ai-styling')}
                >
                  Try AI styling
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Explore Trending Styles Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { type: "spring", stiffness: 400 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-neutral-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="bg-neutral-100 p-3 rounded-xl"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Flame className="h-6 w-6 text-neutral-800" />
                  </motion.div>
                </div>
                <CardTitle className="mt-4 text-xl font-display text-neutral-800">Explore Trends</CardTitle>
                <CardDescription className="text-neutral-600">
                  Discover what's trending in fashion right now
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-white font-light" 
                onClick={() => router.push('/dashboard/explore')}
              >
                Browse trends
              </Button>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
