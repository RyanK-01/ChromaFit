'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, X, Camera } from 'lucide-react'
import Image from 'next/image'
import type { WardrobeCategory } from '@/types'

interface AddGarmentDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddGarmentDialog({ open, onClose, onSuccess }: AddGarmentDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<WardrobeCategory>('top')
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [material, setMaterial] = useState('')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  if (!open) return null

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB')
      return
    }

    setPhotoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new window.Image()
      img.onload = () => {
        // Hard minimum: 256x256
        if (img.width < 256 || img.height < 256) {
          setError('Image must be at least 256x256 pixels. Please use a larger image.')
          setPhotoFile(null)
          setPhotoPreview(null)
          return
        }
        
        // Show warning for images smaller than 512x512 but still accept them
        if (img.width < 512 || img.height < 512) {
          setError('⚠️ Image is smaller than recommended (512x512). Quality may be affected, but upload is allowed.')
        } else {
          // Clear any previous errors for good quality images
          setError('')
        }
        
        // Always set preview if image is >= 256x256
        setPhotoPreview(reader.result as string)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const uploadGarmentPhoto = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-garment-${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('garments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('garments')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err: any) {
      console.error('Error uploading garment photo:', err)
      throw err
    }
  }

  const generateAIGarment = async (originalPhotoUrl: string): Promise<string | null> => {
    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      console.log('Generating AI-enhanced garment image...')
      
      const response = await fetch('/api/generate-garment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: originalPhotoUrl,
          userId: user.id,
          category: category
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate AI garment')
      }

      const data = await response.json()
      console.log('AI garment generated successfully')
      
      if (data.generatedImageUrl) {
        // Download and upload to Supabase
        if (data.generatedImageUrl.startsWith('http')) {
          const imageResponse = await fetch(data.generatedImageUrl)
          const blob = await imageResponse.blob()
          
          const fileName = `${user.id}-garment-ai-${Date.now()}.png`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('garments')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'image/png'
            })

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('garments')
            .getPublicUrl(fileName)

          return publicUrl
        }
        return data.generatedImageUrl
      }

      throw new Error('No generated image URL received')
    } catch (err: any) {
      console.error('Error generating AI garment:', err)
      setError(`AI generation: ${err.message}. Using original photo.`)
      return null
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      if (!photoFile) {
        setError('Please select a photo')
        setUploading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setUploading(false)
        return
      }

      // Upload original photo
      setSuccess('Uploading photo...')
      const originalPhotoUrl = await uploadGarmentPhoto(photoFile)
      
      if (!originalPhotoUrl) {
        throw new Error('Failed to upload photo')
      }

      // Generate AI-enhanced version
      setSuccess('Generating AI-enhanced version...')
      const aiGeneratedUrl = await generateAIGarment(originalPhotoUrl)

      // Save to database
      console.log('💾 Attempting to save to wardrobe:', {
        user_id: user.id,
        name: name,
        category: category
      })
      
      const { data: insertData, error: insertError } = await supabase
        .from('wardrobe')
        .insert({
          user_id: user.id,
          name: name,
          category: category,
          original_photo_url: originalPhotoUrl,
          ai_generated_url: aiGeneratedUrl,
          brand: brand || null,
          size: size || null,
          color: color || null,
          material: material || null,
          notes: notes || null
        })

      if (insertError) {
        console.error('❌ Database insert error:', insertError)
        console.error('❌ Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        throw insertError
      }

      console.log('✅ Successfully saved to wardrobe:', insertData)

      setSuccess('Garment added successfully!')
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1000)
    } catch (err: any) {
      console.error('Error adding garment:', err)
      setError(err.message || 'Failed to add garment')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setCategory('top')
    setBrand('')
    setSize('')
    setColor('')
    setMaterial('')
    setNotes('')
    setPhotoFile(null)
    setPhotoPreview(null)
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add Garment to Wardrobe</CardTitle>
              <CardDescription>Upload a photo and add details about your clothing item</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garment Photo *
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Garment preview"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <Camera className="h-16 w-16 text-gray-400" />
                  )}
                  {(uploading || generating) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                      <Loader2 className="h-12 w-12 animate-spin text-white" />
                      <p className="text-white mt-2 text-sm">
                        {generating ? 'Generating AI version...' : 'Uploading...'}
                      </p>
                    </div>
                  )}
                </div>
                <label htmlFor="garment-photo" className="cursor-pointer">
                  <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">
                      {photoFile ? 'Change Photo' : 'Upload Photo'}
                    </span>
                  </div>
                  <input
                    id="garment-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 text-center">
                  Clear photo on plain background recommended. Min 512x512px, max 10MB.
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Blue Denim Jacket"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="dress">Dress</option>
                <option value="outerwear">Outerwear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Optional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <Input
                  id="brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Levi's"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <Input
                  id="size"
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., M, 32"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <Input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Blue"
                />
              </div>

              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <Input
                  id="material"
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g., Cotton"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this item..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={uploading || generating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={uploading || generating || !photoFile || !name}
              >
                {uploading || generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {generating ? 'Generating...' : 'Adding...'}
                  </>
                ) : (
                  'Add to Wardrobe'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
