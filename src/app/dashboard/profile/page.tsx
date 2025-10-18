'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAvatarModel } from '@/hooks/useAvatarModel'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Avatar3D } from '@/components/Avatar3D'
import { AvatarUpload } from '@/components/AvatarUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BodyMetrics } from '@/types'
import { User, Camera, RefreshCw, Save, Edit3 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const { user } = useAuth()
  const { profile, avatarReady, isLoading: avatarLoading } = useAvatarModel(user?.id)
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Initialize display name from profile
  useState(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name)
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { display_name?: string }) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Profile updated successfully')
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error('Failed to update profile')
      console.error('Update error:', error)
    }
  })

  // Get user stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const [garmentsResult, tryonsResult, outfitsResult] = await Promise.all([
        supabase.from('garments').select('id').eq('user_id', user.id),
        supabase.from('tryons').select('id').eq('user_id', user.id),
        supabase.from('outfits').select('id').eq('user_id', user.id)
      ])

      return {
        garmentCount: garmentsResult.data?.length || 0,
        tryonCount: tryonsResult.data?.length || 0,
        outfitCount: outfitsResult.data?.length || 0
      }
    },
    enabled: !!user?.id
  })

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
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
      toast.success('Avatar updated successfully!')

      return urlData.publicUrl

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const handleComplete = (imageUrl: string) => {
    // Avatar upload completed
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ display_name: displayName })
  }

  if (avatarLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your profile and avatar settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Your Avatar
              </CardTitle>
              <CardDescription>
                Your 3D avatar representation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {avatarReady ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Avatar3D smplParams={profile?.smpl_params} className="w-full h-full" />
                  </div>
                  
                  <AvatarUpload
                    onUpload={handleUpload}
                    onComplete={handleComplete}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={error}
                  >
                    <Button variant="outline" className="w-full" disabled={isUploading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update Avatar
                    </Button>
                  </AvatarUpload>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">No Avatar Yet</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Create your 3D avatar to get started
                  </p>
                  <AvatarUpload
                    onUpload={handleUpload}
                    onComplete={handleComplete}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={error}
                  >
                    <Button>
                      <Camera className="h-4 w-4 mr-2" />
                      Create Avatar
                    </Button>
                  </AvatarUpload>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                {isEditing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.display_name || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Body Metrics */}
          {profile?.body_metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>
                  Your body metrics used for fit analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.body_metrics.height}cm
                    </div>
                    <div className="text-sm text-gray-600">Height</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.body_metrics.chest}cm
                    </div>
                    <div className="text-sm text-gray-600">Chest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.body_metrics.waist}cm
                    </div>
                    <div className="text-sm text-gray-600">Waist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.body_metrics.hips}cm
                    </div>
                    <div className="text-sm text-gray-600">Hips</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>
                  Overview of your ChromaFit usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.garmentCount}
                    </div>
                    <div className="text-sm text-gray-600">Garments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.tryonCount}
                    </div>
                    <div className="text-sm text-gray-600">Try-Ons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.outfitCount}
                    </div>
                    <div className="text-sm text-gray-600">Outfits</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
