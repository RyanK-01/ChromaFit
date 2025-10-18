'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Check } from 'lucide-react'
import Image from 'next/image'

interface AvatarUploadProps {
  onUpload: (file: File) => Promise<string>
  onComplete: (imageUrl: string) => void
  isUploading?: boolean
  uploadProgress?: number
  error?: string
}

export function AvatarUpload({ 
  onUpload, 
  onComplete, 
  isUploading = false, 
  uploadProgress = 0, 
  error 
}: AvatarUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return
    }

    setUploadedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return

    try {
      const imageUrl = await onUpload(uploadedFile)
      onComplete(imageUrl)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Your Photo</CardTitle>
        <CardDescription>
          Upload a clear photo of yourself to create your 3D avatar. We'll analyze your body measurements to provide accurate fit recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!preview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your photo here
            </p>
            <p className="text-gray-500 mb-4">
              or click to browse files
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-sm text-gray-400 mt-4">
              Supports JPG, PNG, GIF up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!isUploading ? (
              <div className="flex gap-4 justify-center">
                <Button onClick={handleUpload} className="px-8">
                  Create Avatar
                </Button>
                <Button variant="outline" onClick={handleRemove}>
                  Choose Different Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-lg font-medium">Creating your avatar...</span>
                  </div>
                  <p className="text-gray-600">
                    Analyzing your photo and extracting body measurements
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
