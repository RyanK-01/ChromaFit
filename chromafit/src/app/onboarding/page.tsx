'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { AvatarUpload } from '@/components/AvatarUpload'
import { User, Ruler, Weight } from 'lucide-react'

interface UserProfile {
  height: number
  weight: number
}

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'measurements' | 'avatar'>('measurements')
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile>({
    height: 170,
    weight: 70
  })

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

  const formatHeight = (cm: number) => {
    const meters = cm / 100
    return `${meters.toFixed(2)}m`
  }

  const handleSaveMeasurements = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          height: profile.height,
          weight: profile.weight,
        }, {
          onConflict: 'user_id'
        })
        .select()

      console.log('Upsert result:', { data, error: updateError })

      if (updateError) {
        console.error('Database error details:', updateError)
        throw new Error(updateError.message || 'Database error: ' + JSON.stringify(updateError))
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from upsert. Make sure height and weight columns exist in the profiles table.')
      }

      // Move to avatar upload step
      setStep('avatar')
    } catch (err: any) {
      console.error('Error saving measurements:', err)
      setError(err.message || 'Failed to save measurements')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`
      
      setUploadProgress(25)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      setUploadProgress(50)

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setUploadProgress(75)

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_photo_url: urlData.publicUrl,
          onboarding_completed: true
        }, {
          onConflict: 'user_id'
        })

      if (profileError) throw profileError

      setUploadProgress(100)
      return urlData.publicUrl

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const handleComplete = (imageUrl: string) => {
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  const handleSkipAvatar = async () => {
    if (!user) return
    
    try {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true
        }, {
          onConflict: 'user_id'
        })
      
      router.push('/dashboard')
    } catch (err) {
      console.error('Error completing onboarding:', err)
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EFE6] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8B7355] mx-auto"></div>
          <p className="mt-4 text-[#4A3728]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EFE6] to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#4A3728] mb-2">Welcome to ChromaFit!</h1>
          <p className="text-xl text-[#8B7355]">
            {step === 'measurements' ? 'Step 1: Your Measurements' : 'Step 2: Create Your Avatar'}
          </p>
        </div>

        {step === 'measurements' ? (
          <Card className="max-w-2xl mx-auto border-[#D4C4B0]">
            <CardContent className="pt-6 space-y-8">
              <div className="flex justify-center mb-4">
                <div className="bg-[#8B7355]/10 p-4 rounded-full">
                  <Ruler className="h-12 w-12 text-[#8B7355]" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#4A3728] flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height
                    </label>
                    <span className="text-lg font-semibold text-[#8B7355]">
                      {formatHeight(profile.height)}
                    </span>
                  </div>
                  <Slider
                    value={[profile.height]}
                    onValueChange={(value: number[]) => setProfile({ ...profile, height: value[0] })}
                    min={140}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#8B7355]">
                    <span>140cm</span>
                    <span>200cm</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#4A3728] flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Weight
                    </label>
                    <span className="text-lg font-semibold text-[#8B7355]">
                      {profile.weight}kg
                    </span>
                  </div>
                  <Slider
                    value={[profile.weight]}
                    onValueChange={(value: number[]) => setProfile({ ...profile, weight: value[0] })}
                    min={40}
                    max={120}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#8B7355]">
                    <span>40kg</span>
                    <span>120kg</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button 
                className="w-full bg-[#8B7355] hover:bg-[#6D5A43] text-white" 
                onClick={handleSaveMeasurements}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Continue to Avatar Upload'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto border-[#D4C4B0]">
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-center mb-4">
                <div className="bg-[#8B7355]/10 p-4 rounded-full">
                  <User className="h-12 w-12 text-[#8B7355]" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-[#4A3728]">Create Your 3D Avatar</h2>
                <p className="text-[#8B7355]">
                  Upload a photo to generate your personalized 3D avatar
                </p>
              </div>

              <div className="bg-[#F5EFE6] rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-[#4A3728]">What you'll need:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#8B7355] mr-2">✓</span>
                    <span className="text-[#4A3728]">A full-body photo (front-facing works best)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#8B7355] mr-2">✓</span>
                    <span className="text-[#4A3728]">Good lighting conditions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#8B7355] mr-2">✓</span>
                    <span className="text-[#4A3728]">Wear form-fitting clothes for accurate measurements</span>
                  </li>
                </ul>
              </div>

              <AvatarUpload
                onUpload={handleUpload}
                onComplete={handleComplete}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={error}
              />

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355]/10" 
                  onClick={() => setStep('measurements')}
                  disabled={isUploading}
                >
                  Back to Measurements
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-[#8B7355]" 
                  onClick={handleSkipAvatar}
                  disabled={isUploading}
                >
                  Skip for Now
                </Button>
              </div>

              <p className="text-xs text-center text-[#8B7355]">
                Your photo will be processed securely and used only to create your 3D avatar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
