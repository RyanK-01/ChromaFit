'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shirt, Footprints, Watch, Sparkles, X, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'
import type { WardrobeItem } from '@/types'

// Custom Pants Icon Component
const PantsIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4h12v7l-2 9h-2l-2-7-2 7H8l-2-9V4z" />
    <line x1="12" y1="4" x2="12" y2="11" />
  </svg>
)

interface TryOnResult {
  resultImageUrl: string
  fitScore: number
  explanation: {
    fit: string
    style: string
    comfort: string
  }
  tryonId?: string
}

export default function VirtualTryOnPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // User and wardrobe state
  const [user, setUser] = useState<any>(null)
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string | null>(null)
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Selection state
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null)
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null)
  const [selectedDress, setSelectedDress] = useState<WardrobeItem | null>(null)
  const [selectedShoes, setSelectedShoes] = useState<WardrobeItem | null>(null)
  const [selectedAccessories, setSelectedAccessories] = useState<WardrobeItem[]>([])
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Load user data and wardrobe
  useEffect(() => {
    loadUserAndWardrobe()
  }, [])

  const loadUserAndWardrobe = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Auth error:', userError)
        setError('Authentication error: ' + userError.message)
        router.push('/auth/login')
        return
      }

      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/auth/login')
        return
      }

      console.log('✅ User authenticated:', user.id)
      setUser(user)

      // Get user profile with avatar photo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_photo_url, realistic_photo_url')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ Profile error (non-fatal):', profileError.message)
        // Don't fail if profile doesn't exist yet
      } else if (profile) {
        const photoUrl = profile?.realistic_photo_url || profile?.avatar_photo_url || null
        console.log('📸 Avatar photo:', photoUrl ? 'Found' : 'Not found')
        setAvatarPhotoUrl(photoUrl)
      }

      // Load wardrobe items
      console.log('🔍 Loading wardrobe for user:', user.id)
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (itemsError) {
        console.error('❌ Wardrobe error:', itemsError)
        throw new Error(`Database error: ${itemsError.message || 'Unknown error'}`)
      }

      console.log('✅ Loaded', items?.length || 0, 'wardrobe items')
      setWardrobeItems(items || [])
      
      if (!items || items.length === 0) {
        setError('Your wardrobe is empty. Add some items to get started!')
      }

    } catch (err: any) {
      console.error('❌ Error loading wardrobe:', err)
      const errorMessage = err?.message || err?.error_description || JSON.stringify(err) || 'Failed to load wardrobe'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Categorize wardrobe items
  const tops = wardrobeItems.filter(item => item.category === 'top' || item.category === 'outerwear')
  const bottoms = wardrobeItems.filter(item => item.category === 'bottom')
  const dresses = wardrobeItems.filter(item => item.category === 'dress')
  const shoes = wardrobeItems.filter(item => item.category === 'shoes')
  const accessories = wardrobeItems.filter(item => item.category === 'accessories')

  const handleAccessoryToggle = (accessory: WardrobeItem) => {
    setSelectedAccessories(prev => {
      const exists = prev.find(a => a.id === accessory.id)
      if (exists) {
        return prev.filter(a => a.id !== accessory.id)
      }
      return [...prev, accessory]
    })
  }

  const clearAll = () => {
    setSelectedTop(null)
    setSelectedBottom(null)
    setSelectedDress(null)
    setSelectedShoes(null)
    setSelectedAccessories([])
    setTryOnResult(null)
    setShowResult(false)
  }

  const hasSelection = selectedTop || selectedBottom || selectedDress || selectedShoes || selectedAccessories.length > 0

  const handleGenerateTryOn = async () => {
    if (!user) {
      setError('Please log in to generate try-on')
      return
    }

    if (!avatarPhotoUrl) {
      setError('Please complete your avatar setup first! Go to Profile to upload your photo.')
      return
    }

    if (!hasSelection) {
      setError('Please select at least one garment to try on')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Collect all selected garments
      const selectedGarments = [
        selectedTop,
        selectedBottom,
        selectedDress,
        selectedShoes,
        ...selectedAccessories
      ].filter(Boolean) as WardrobeItem[]

      const garmentIds = selectedGarments.map(g => g.id)
      const garmentImageUrls = selectedGarments.map(g => g.ai_generated_url || g.original_photo_url)

      console.log('🎨 Generating try-on with:', {
        userId: user.id,
        avatarUrl: avatarPhotoUrl,
        garments: selectedGarments.length
      })

      // Call the try-on generation API
      const response = await fetch('/api/tryon-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          avatarImageUrl: avatarPhotoUrl,
          garmentImageUrls,
          garmentIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate try-on')
      }

      const result = await response.json()
      
      console.log('✅ Try-on generated successfully!', result)
      
      setTryOnResult(result)
      setShowResult(true)

    } catch (err: any) {
      console.error('❌ Error generating try-on:', err)
      setError(err.message || 'Failed to generate try-on. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading virtual try-on studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="border-l h-8"></div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
                  <p className="text-gray-600 mt-1">Mix and match items from your wardrobe</p>
                </div>
              </div>
            </div>
            {hasSelection && (
              <Button onClick={clearAll} variant="outline" size="lg">
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {!avatarPhotoUrl && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to complete your avatar setup to use virtual try-on.{' '}
              <a href="/onboarding" className="underline font-medium">
                Upload your photo now
              </a>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content - Continued in next part due to length... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Item Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="tops" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="tops" className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Tops ({tops.length})
                    </TabsTrigger>
                    <TabsTrigger value="bottoms" className="flex items-center gap-2">
                      <PantsIcon className="h-4 w-4" />
                      Bottoms ({bottoms.length})
                    </TabsTrigger>
                    <TabsTrigger value="dresses" className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Dresses ({dresses.length})
                    </TabsTrigger>
                    <TabsTrigger value="shoes" className="flex items-center gap-2">
                      <Footprints className="h-4 w-4" />
                      Shoes ({shoes.length})
                    </TabsTrigger>
                    <TabsTrigger value="accessories" className="flex items-center gap-2">
                      <Watch className="h-4 w-4" />
                      Accessories ({accessories.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Tops Tab */}
                  <TabsContent value="tops" className="mt-6">
                    {tops.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No tops in your wardrobe yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tops.map(item => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTop(selectedTop?.id === item.id ? null : item)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              selectedTop?.id === item.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square relative bg-gray-100">
                              <Image
                                src={item.ai_generated_url || item.original_photo_url}
                                alt={item.name || 'Wardrobe top'}
                                fill
                                className="object-cover"
                              />
                              {selectedTop?.id === item.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Bottoms Tab */}
                  <TabsContent value="bottoms" className="mt-6">
                    {bottoms.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No bottoms in your wardrobe yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {bottoms.map(item => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedBottom(selectedBottom?.id === item.id ? null : item)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              selectedBottom?.id === item.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square relative bg-gray-100">
                              <Image
                                src={item.ai_generated_url || item.original_photo_url}
                                alt={item.name || 'Wardrobe bottom'}
                                fill
                                className="object-cover"
                              />
                              {selectedBottom?.id === item.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Dresses Tab */}
                  <TabsContent value="dresses" className="mt-6">
                    {dresses.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No dresses in your wardrobe yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {dresses.map(item => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDress(selectedDress?.id === item.id ? null : item)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              selectedDress?.id === item.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square relative bg-gray-100">
                              <Image
                                src={item.ai_generated_url || item.original_photo_url}
                                alt={item.name || 'Wardrobe dress'}
                                fill
                                className="object-cover"
                              />
                              {selectedDress?.id === item.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Shoes Tab */}
                  <TabsContent value="shoes" className="mt-6">
                    {shoes.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No shoes in your wardrobe yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {shoes.map(item => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedShoes(selectedShoes?.id === item.id ? null : item)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              selectedShoes?.id === item.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square relative bg-gray-100">
                              <Image
                                src={item.ai_generated_url || item.original_photo_url}
                                alt={item.name || 'Wardrobe shoes'}
                                fill
                                className="object-cover"
                              />
                              {selectedShoes?.id === item.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Accessories Tab */}
                  <TabsContent value="accessories" className="mt-6">
                    {accessories.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No accessories in your wardrobe yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {accessories.map(item => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAccessoryToggle(item)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              selectedAccessories.find(a => a.id === item.id)
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square relative bg-gray-100">
                              <Image
                                src={item.ai_generated_url || item.original_photo_url}
                                alt={item.name || 'Wardrobe accessory'}
                                fill
                                className="object-cover"
                              />
                              {selectedAccessories.find(a => a.id === item.id) && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Preview and Generate */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Selected Items</h3>
                  <div className="space-y-3">
                    {selectedTop && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={selectedTop.ai_generated_url || selectedTop.original_photo_url}
                            alt={selectedTop.name || 'Selected top'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedTop.name}</p>
                          <p className="text-xs text-gray-500">Top</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTop(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {selectedBottom && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={selectedBottom.ai_generated_url || selectedBottom.original_photo_url}
                            alt={selectedBottom.name || 'Selected bottom'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedBottom.name}</p>
                          <p className="text-xs text-gray-500">Bottom</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBottom(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {selectedDress && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={selectedDress.ai_generated_url || selectedDress.original_photo_url}
                            alt={selectedDress.name || 'Selected dress'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedDress.name}</p>
                          <p className="text-xs text-gray-500">Dress</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDress(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {selectedShoes && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={selectedShoes.ai_generated_url || selectedShoes.original_photo_url}
                            alt={selectedShoes.name || 'Selected shoes'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedShoes.name}</p>
                          <p className="text-xs text-gray-500">Shoes</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedShoes(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {selectedAccessories.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={item.ai_generated_url || item.original_photo_url}
                            alt={item.name || 'Selected accessory'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Accessory</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAccessoryToggle(item)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {!hasSelection && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No items selected yet
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateTryOn}
                  disabled={!hasSelection || isGenerating || !avatarPhotoUrl}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Try-On
                    </>
                  )}
                </Button>

                {/* Try-On Result */}
                <AnimatePresence>
                  {showResult && tryOnResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4 pt-4 border-t"
                    >
                      <h3 className="text-lg font-semibold">Try-On Result</h3>
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={tryOnResult.resultImageUrl}
                          alt="Virtual try-on result"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Fit Score</span>
                          <span className="text-lg font-bold text-blue-600">
                            {tryOnResult.fitScore}%
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Fit:</span> {tryOnResult.explanation.fit}</p>
                          <p><span className="font-medium">Style:</span> {tryOnResult.explanation.style}</p>
                          <p><span className="font-medium">Comfort:</span> {tryOnResult.explanation.comfort}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
