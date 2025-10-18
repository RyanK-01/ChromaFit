'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, Download, Save, Star, Trash2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { EnvironmentType, OccasionType, WardrobeItem, StyledOutfit } from '@/types'

export default function AIStylingPage() {
  const [environmentType, setEnvironmentType] = useState<EnvironmentType | ''>('')
  const [occasionType, setOccasionType] = useState<OccasionType | ''>('')
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [promptUsed, setPromptUsed] = useState<string | null>(null)
  const [outfitRecommendation, setOutfitRecommendation] = useState<string | null>(null)
  const [userDescription, setUserDescription] = useState<string | null>(null)
  const [source, setSource] = useState<string>('')
  const [savedOutfits, setSavedOutfits] = useState<StyledOutfit[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasRealisticPhoto, setHasRealisticPhoto] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user has realistic photo
      const { data: profile } = await supabase
        .from('profiles')
        .select('realistic_photo_url')
        .eq('user_id', user.id)
        .single()

      setHasRealisticPhoto(!!profile?.realistic_photo_url)

      // Load wardrobe items
      const { data: items } = await supabase
        .from('wardrobe')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (items) setWardrobeItems(items)

      // Load saved styled outfits
      const { data: outfits } = await supabase
        .from('styled_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (outfits) setSavedOutfits(outfits)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!environmentType && !occasionType) {
      setError('Please select either an environment or occasion')
      return
    }

    if (!hasRealisticPhoto) {
      setError('Please upload a photo in your profile first to generate styled outfits')
      return
    }

    setGenerating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/generate-styled-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environmentType: environmentType || undefined,
          occasionType: occasionType || undefined,
          selectedItems: selectedItems.length > 0 ? selectedItems : undefined,
          customPrompt: customPrompt || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate styled outfit')
      }

      const data = await response.json()
      setGeneratedImage(data.styledImageUrl)
      setPromptUsed(data.promptUsed)
      setOutfitRecommendation(data.outfitRecommendation)
      setUserDescription(data.userDescription)
      setSource(data.source || 'unknown')
      
      if (data.source === 'vertex-ai-gemini') {
        setSuccess('✨ AI-powered personalized styling generated!')
      } else {
        setSuccess('✅ Expert styling recommendations ready!')
      }
    } catch (err: any) {
      console.error('Error generating styled outfit:', err)
      setError(err.message || 'Failed to generate styled outfit')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedImage) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const outfitName = `${environmentType || occasionType || 'Custom'} Outfit - ${new Date().toLocaleDateString()}`

      const { error: insertError } = await supabase
        .from('styled_outfits')
        .insert({
          user_id: user.id,
          name: outfitName,
          environment_type: environmentType || null,
          occasion_type: occasionType || null,
          styled_image_url: generatedImage,
          wardrobe_items: selectedItems.length > 0 ? selectedItems : null,
          prompt_used: promptUsed || null
        })

      if (insertError) throw insertError

      setSuccess('Styled outfit saved successfully!')
      loadData() // Reload saved outfits
    } catch (err: any) {
      console.error('Error saving outfit:', err)
      setError(err.message || 'Failed to save outfit')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('styled_outfits')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSavedOutfits(savedOutfits.filter(outfit => outfit.id !== id))
      setSuccess('Outfit deleted successfully')
    } catch (err: any) {
      console.error('Error deleting outfit:', err)
      setError(err.message || 'Failed to delete outfit')
    }
  }

  const handleDownload = async (imageUrl: string, name: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading image:', err)
      setError('Failed to download image')
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading AI Styling...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Match Wardrobe Style */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="border-l h-8"></div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Styling Assistant</h1>
                  <p className="text-gray-600 mt-1">Get personalized outfit recommendations powered by Vertex AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!hasRealisticPhoto && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              ⚠️ Please upload a photo in your <a href="/profile" className="underline font-medium">profile</a> first to generate styled outfits.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Environment Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Environment</CardTitle>
                <CardDescription>Choose where you'll be wearing this outfit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {(['office', 'school', 'gym', 'casual', 'formal'] as EnvironmentType[]).map((env) => (
                    <Button
                      key={env}
                      variant={environmentType === env ? 'default' : 'outline'}
                      onClick={() => setEnvironmentType(env)}
                      className="capitalize"
                    >
                      {env}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Occasion Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Occasion</CardTitle>
                <CardDescription>Choose the specific event or activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {(['party', 'date', 'wedding', 'interview', 'meeting', 'workout', 'everyday'] as OccasionType[]).map((occ) => (
                    <Button
                      key={occ}
                      variant={occasionType === occ ? 'default' : 'outline'}
                      onClick={() => setOccasionType(occ)}
                      className="capitalize"
                    >
                      {occ}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wardrobe Items Selection */}
            {wardrobeItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Items (Optional)</CardTitle>
                  <CardDescription>Choose specific items from your wardrobe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {wardrobeItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`cursor-pointer border rounded-lg p-3 transition-all ${
                          selectedItems.includes(item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {item.ai_generated_url || item.original_photo_url ? (
                          <div className="relative w-full h-24 mb-2">
                            <Image
                              src={item.ai_generated_url || item.original_photo_url}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : null}
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Style Notes (Optional)</CardTitle>
                <CardDescription>Add any specific styling preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., 'Include a blazer', 'Bright colors', 'Minimalist style'..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
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
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || (!environmentType && !occasionType) || !hasRealisticPhoto}
              className="w-full h-12 text-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating AI Image...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Styled Outfit Image
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Generation takes 20-30 seconds • Click multiple times for different style variations
            </p>
            <p className="text-xs text-blue-600 text-center font-medium">
              💡 Each generation creates a unique styling variation!
            </p>
          </div>

          {/* Right Column - AI Generated Styled Image */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  AI Generated Styled Outfit
                  {source === 'vertex-ai-imagen' && (
                    <span className="text-sm font-normal text-green-600">• AI-Powered</span>
                  )}
                </CardTitle>
                <CardDescription>
                  {source === 'vertex-ai-imagen' 
                    ? 'AI-generated image of you in a styled outfit'
                    : 'Your styled outfit visualization'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  {generatedImage ? (
                    <Image
                      src={generatedImage}
                      alt="AI Generated Styled Outfit"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8">
                        <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          Your styled outfit image will appear here
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Select environment/occasion and click generate
                        </p>
                      </div>
                    </div>
                  )}
                  {generating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
                      <Loader2 className="h-16 w-16 animate-spin text-white mb-4" />
                      <p className="text-white font-semibold text-lg">Generating your styled outfit...</p>
                      <p className="text-white/80 text-sm mt-2">Creating AI-powered fashion image</p>
                      <p className="text-white/60 text-xs mt-1">This may take 20-30 seconds</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {generatedImage && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                      variant="default"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Outfit
                    </Button>
                    <Button
                      onClick={() => handleDownload(generatedImage, 'styled-outfit')}
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}

                {/* Styling Details (collapsible) */}
                {outfitRecommendation && generatedImage && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 p-3 bg-gray-50 rounded-lg">
                      📋 View Styling Details
                    </summary>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {outfitRecommendation}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Outfits */}
        {savedOutfits.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Styled Outfits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedOutfits.map((outfit) => (
                <Card key={outfit.id} className="overflow-hidden">
                  <div className="relative w-full h-64">
                    <Image
                      src={outfit.styled_image_url}
                      alt={outfit.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{outfit.name}</CardTitle>
                    <CardDescription>
                      {outfit.environment_type && <span className="capitalize">{outfit.environment_type}</span>}
                      {outfit.environment_type && outfit.occasion_type && ' • '}
                      {outfit.occasion_type && <span className="capitalize">{outfit.occasion_type}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleDownload(outfit.styled_image_url, outfit.name)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleDelete(outfit.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
