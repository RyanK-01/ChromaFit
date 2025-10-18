'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Upload, Link as LinkIcon, X, Check } from 'lucide-react'
import { Garment } from '@/types'

interface AddGarmentDialogProps {
  children: React.ReactNode
}

export function AddGarmentDialog({ children }: AddGarmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addGarmentMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; sourceType: 'upload' | 'url'; sourceUrl?: string }) => {
      if (!user) throw new Error('User not authenticated')

      // Call garment extraction API
      const response = await fetch('/api/garment-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to extract garment data')

      const { category, measurements, clipEmbedding } = await response.json()

      // Save to database
      const { data: garment, error } = await supabase
        .from('garments')
        .insert({
          user_id: user.id,
          name: `New ${category}`,
          category,
          image_url: data.imageUrl,
          measurements,
          clip_embedding: clipEmbedding,
          source_type: data.sourceType,
          source_url: data.sourceUrl
        })
        .select()
        .single()

      if (error) throw error
      return garment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garments', user?.id] })
      setOpen(false)
      resetForm()
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  const handleFileUpload = async (file: File) => {
    if (!user) return

    setIsProcessing(true)
    setUploadProgress(0)
    setError('')

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/garments/${Date.now()}.${fileExt}`
      
      setUploadProgress(25)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('garments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      setUploadProgress(50)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('garments')
        .getPublicUrl(fileName)

      setUploadProgress(75)

      // Add garment with extracted data
      await addGarmentMutation.mutateAsync({
        imageUrl: urlData.publicUrl,
        sourceType: 'upload'
      })

      setUploadProgress(100)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    setIsProcessing(true)
    setError('')

    try {
      // For URL input, we'll use the URL directly as the image URL
      // In a real app, you might want to download and store the image
      await addGarmentMutation.mutateAsync({
        imageUrl: urlInput,
        sourceType: 'url',
        sourceUrl: urlInput
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add garment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
    }
  }

  const resetForm = () => {
    setUploadFile(null)
    setUrlInput('')
    setUploadProgress(0)
    setError('')
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Garment to Wardrobe</DialogTitle>
          <DialogDescription>
            Upload a photo or paste a product URL to add a garment to your virtual wardrobe.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Photo</TabsTrigger>
            <TabsTrigger value="url">Product URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {!uploadFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Click to upload a photo
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(uploadFile)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setUploadFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                ) : (
                  <Button
                    onClick={() => handleFileUpload(uploadFile)}
                    className="w-full"
                  >
                    Add to Wardrobe
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Product URL
              </label>
              <div className="flex space-x-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/product"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || isProcessing}
                  className="px-4"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Processing URL...</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
