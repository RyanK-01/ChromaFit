'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Upload, Camera, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating2D, setGenerating2D] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')

      // Load profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
        setFullName(profileData.display_name || fullName)
        setPhotoPreview(profileData.avatar_photo_url)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type - only accept common image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (10MB max for better quality 3D models)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB')
      return
    }

    setPhotoFile(file)
    
    // Create preview and validate image dimensions
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new window.Image()
      img.onload = () => {
        // Recommend minimum dimensions for 2D avatar quality
        if (img.width < 512 || img.height < 512) {
          setError('For best 2D avatar results, please use an image at least 512x512 pixels')
          setPhotoFile(null)
          setPhotoPreview(null)
          return
        }
        setPhotoPreview(reader.result as string)
        setError('')
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const generate2DAvatar = async (originalPhotoUrl: string): Promise<string | null> => {
    if (!user) return null

    setGenerating2D(true)
    try {
      console.log('Generating 2D avatar with OpenAI...')
      
      // Call our API route to generate 2D image using OpenAI
      const response = await fetch('/api/generate-2d-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: originalPhotoUrl,
          userId: user.id,
          style: 'realistic',
          useVision: true // Enable GPT-4 Vision for better results
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate 2D avatar')
      }

      const data = await response.json()
      console.log('2D avatar generated successfully with OpenAI')
      
      if (data.generatedImageUrl) {
        // OpenAI returns temporary URLs, so we need to download and upload to Supabase
        if (data.generatedImageUrl.startsWith('http')) {
          return await downloadAndUpload2DImage(data.generatedImageUrl)
        }
        // If it's a base64 image
        if (data.generatedImageUrl.startsWith('data:image')) {
          return await upload2DImageToStorage(data.generatedImageUrl)
        }
        return data.generatedImageUrl
      }

      throw new Error('No generated image URL received')
    } catch (err: any) {
      console.error('Error generating 2D avatar:', err)
      setError(`2D generation: ${err.message}. Using original photo instead.`)
      return originalPhotoUrl // Fallback to original photo
    } finally {
      setGenerating2D(false)
    }
  }

  const downloadAndUpload2DImage = async (imageUrl: string): Promise<string> => {
    // Download the image from OpenAI's temporary URL
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    const fileName = `${user.id}-2d-${Date.now()}.png`

    // Upload to Supabase
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const upload2DImageToStorage = async (base64Image: string): Promise<string> => {
    // Convert base64 to blob
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    const blob = new Blob([bytes], { type: 'image/png' })
    const fileName = `${user.id}-2d-${Date.now()}.png`

    // Upload to Supabase
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const uploadPhoto = async () => {
    if (!photoFile || !user) return null

    setUploading(true)
    try {
      // Delete old avatar if exists
      if (profile?.avatar_photo_url) {
        try {
          const oldPath = profile.avatar_photo_url.split('/avatars/')[1]
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath])
          }
        } catch (err) {
          console.log('Could not delete old avatar:', err)
          // Continue anyway - not critical
        }
      }

      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = fileName // Direct path in bucket root

      // Upload to Supabase Storage with metadata
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: photoFile.type
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      console.error('Error uploading photo:', err)
      setError(err.message || 'Failed to upload photo. Please check your permissions.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Upload photo if changed
      let photoUrl = profile?.avatar_photo_url || null
      let generated2DUrl = null
      
      if (photoFile) {
        const uploadedUrl = await uploadPhoto()
        if (uploadedUrl) {
          photoUrl = uploadedUrl
          
          // Generate 2D avatar from uploaded photo
          setSuccess('Photo uploaded! Generating 2D avatar...')
          generated2DUrl = await generate2DAvatar(uploadedUrl)
          
          if (generated2DUrl) {
            photoUrl = generated2DUrl // Use 2D avatar as the main avatar
            setPhotoPreview(generated2DUrl) // Update preview
            setSuccess('2D avatar generated successfully!')
          }
        } else {
          setSaving(false)
          return // Stop if photo upload failed
        }
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: fullName,
          avatar_photo_url: photoUrl,
          realistic_photo_url: generated2DUrl || photoUrl, // Store realistic version
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (updateError) {
        throw updateError
      }

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        if (emailError) {
          throw emailError
        }
      }

      // Update metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (metadataError) {
        throw metadataError
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match')
          setSaving(false)
          return
        }

        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters')
          setSaving(false)
          return
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })

        if (passwordError) {
          throw passwordError
        }
      }

      setSuccess('Profile updated successfully!')
      setPhotoFile(null)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Reload profile
      await loadUserProfile()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Photo Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Upload a photo to generate your 2D avatar for virtual styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Photo Preview */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {(uploading || generating2D) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
                        <p className="text-xs text-white mt-1">
                          {uploading ? 'Uploading...' : 'Generating 2D...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">
                          {photoFile ? 'Change Photo' : 'Upload Photo'}
                        </span>
                      </div>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    {photoFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {photoFile.name}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    For best 2D avatar results: Use a clear, well-lit photo with your full face visible. Minimum 512x512 pixels recommended. Max size: 10MB. Your photo will be processed to create a 2D avatar for virtual try-on.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Changing your email will require verification
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Leave blank if you don't want to change your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading || generating2D}
            >
              {saving || uploading || generating2D ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {generating2D ? 'Generating 2D Avatar...' : 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
