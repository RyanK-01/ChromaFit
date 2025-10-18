'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-[#E6DCD3] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-light text-neutral-800 mb-3 tracking-tight">Create your avatar</h1>
          <p className="text-lg text-neutral-600 font-light">
            Let's get you set up with a personalized 3D avatar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-neutral-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-normal text-neutral-800 tracking-tight">Upload a photo</CardTitle>
              <CardDescription className="text-neutral-600">
                We'll create your 3D avatar with accurate measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <motion.div
                className="rounded-2xl p-6 space-y-4 bg-neutral-50/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <h3 className="text-lg text-neutral-700 font-normal">For best results:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-neutral-600">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800 text-white text-sm">1</span>
                    <span>Take a full-body photo while standing straight</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800 text-white text-sm">2</span>
                    <span>Ensure good lighting and a plain background</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800 text-white text-sm">3</span>
                    <span>Wear form-fitting clothes for accurate measurements</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Button 
                  className="w-full h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-lg font-light" 
                  onClick={() => alert('Avatar upload feature coming soon! For now, skip to dashboard to explore.')}
                >
                  Choose photo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-full border-neutral-300 hover:bg-neutral-100 text-neutral-600 transition-colors" 
                  onClick={handleSkipToDashboard}
                >
                  Skip for now
                </Button>
              </motion.div>

              <motion.p 
                className="text-sm text-center text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                Your photo will be processed securely and only used to create your avatar
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
