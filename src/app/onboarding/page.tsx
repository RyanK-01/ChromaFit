'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AvatarUpload } from '@/components/AvatarUpload'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload')
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      // Upload to Supabase Storage
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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setUploadProgress(75)

      // Call body extraction API
      const response = await fetch('/api/body-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: urlData.publicUrl
        })
      })

      if (!response.ok) throw new Error('Failed to extract body data')

      const { bodyMetrics, smplParams } = await response.json()

      setUploadProgress(90)

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_photo_url: urlData.publicUrl,
          body_metrics: bodyMetrics,
          smpl_params: smplParams
        })
        .eq('user_id', user.id)

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
    setStep('complete')
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Avatar Created!</CardTitle>
            <CardDescription>
              Your 3D avatar has been successfully created. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ChromaFit!
          </h1>
          <p className="text-gray-600">
            Let's create your personalized 3D avatar to get started
          </p>
        </div>

        <AvatarUpload
          onUpload={handleUpload}
          onComplete={handleComplete}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={error}
        />

        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            disabled={isUploading}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}
