'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAvatarModel } from '@/hooks/useAvatarModel'
import { useTryOn } from '@/hooks/useTryOn'
import { Avatar3D } from '@/components/Avatar3D'
import { FitScoreDisplay } from '@/components/FitScoreDisplay'
import { GarmentCard } from '@/components/GarmentCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Garment } from '@/types'
import { ArrowLeft, Camera, RotateCcw, Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

export default function TryOnPage() {
  const params = useParams()
  const garmentId = params.garmentId as string
  const { user } = useAuth()
  const supabase = createClient()
  const { avatarReady, smplParams } = useAvatarModel(user?.id)
  const { generateTryOn } = useTryOn()

  // Fetch garment details
  const { data: garment, isLoading: garmentLoading } = useQuery({
    queryKey: ['garment', garmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('id', garmentId)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      return data as Garment
    },
    enabled: !!garmentId && !!user?.id
  })

  const handleTryOn = async () => {
    if (!user || !garment) return

    try {
      await generateTryOn.mutateAsync({
        userId: user.id,
        garmentId: garment.id
      })
      toast.success('Try-on completed successfully!')
    } catch (error) {
      toast.error('Failed to generate try-on')
      console.error('Try-on error:', error)
    }
  }

  if (garmentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!garment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Garment not found</p>
        <Link href="/dashboard/wardrobe">
          <Button variant="outline" className="mt-4">
            Back to Wardrobe
          </Button>
        </Link>
      </div>
    )
  }

  if (!avatarReady) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Avatar Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to create your 3D avatar before you can try on garments.
          </p>
          <Link href="/onboarding">
            <Button>
              Create Avatar
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/wardrobe">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wardrobe
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Virtual Try-On</h1>
            <p className="text-gray-600">Try on your garment with AI-powered fit analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - 3D Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              3D Avatar Preview
            </CardTitle>
            <CardDescription>
              Your personalized 3D avatar with the selected garment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Avatar3D 
                smplParams={smplParams} 
                className="w-full h-full"
                showTryOn={!!generateTryOn.data}
                tryOnTexture={generateTryOn.data?.resultImageUrl}
              />
            </div>
            
            {/* Avatar Controls */}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Garment Details & Try-On */}
        <div className="space-y-6">
          {/* Garment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Garment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {garment.image_url ? (
                    <Image
                      src={garment.image_url}
                      alt={garment.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{garment.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {garment.category}
                  </Badge>
                  {garment.measurements && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex gap-4">
                        {Object.entries(garment.measurements)
                          .filter(([key]) => key !== 'unit')
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="capitalize">{key.replace('_', ' ')}:</span>{' '}
                              <span className="font-medium">{value} {garment.measurements?.unit}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Try-On Action */}
          <Card>
            <CardHeader>
              <CardTitle>Try-On Analysis</CardTitle>
              <CardDescription>
                Generate a virtual try-on with AI-powered fit analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generateTryOn.isPending && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Generating try-on...</span>
                  </div>
                  <Progress value={generateTryOn.variables ? 50 : 0} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Analyzing garment fit and generating 3D visualization...
                  </p>
                </div>
              )}

              {!generateTryOn.data && !generateTryOn.isPending && (
                <Button 
                  onClick={handleTryOn}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Try On This Garment
                </Button>
              )}

              {generateTryOn.data && (
                <div className="space-y-4">
                  {/* Result Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={generateTryOn.data.resultImageUrl}
                      alt="Try-on result"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Try Again Button */}
                  <Button 
                    onClick={handleTryOn}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {generateTryOn.error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  Failed to generate try-on. Please try again.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fit Score Analysis */}
      {generateTryOn.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FitScoreDisplay 
            fitScore={{
              score: generateTryOn.data.fitScore,
              explanation: generateTryOn.data.explanation
            }}
          />
          
          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Try-On Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Garment:</span>
                  <div className="font-medium">{garment.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <div className="font-medium capitalize">{garment.category}</div>
                </div>
                <div>
                  <span className="text-gray-600">Fit Score:</span>
                  <div className="font-medium text-lg">
                    {Math.round(generateTryOn.data.fitScore * 100)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Generated:</span>
                  <div className="font-medium">
                    {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
