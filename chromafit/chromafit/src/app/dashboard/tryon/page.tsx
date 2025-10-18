'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shirt, Footprints, Watch, Sparkles, X, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useWardrobe } from '@/hooks/useWardrobe'
import { useTryOn } from '@/hooks/useTryOn'
import { WardrobeItem } from '@/types'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'

const PantsIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4h12v7l-2 9h-2l-2-7-2 7H8l-2-9V4z" />
    <line x1="12" y1="4" x2="12" y2="11" />
  </svg>
)

export default function VirtualTryOnPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { useUserWardrobe } = useWardrobe(user?.id)
  const { data: wardrobeItems = [], isLoading } = useUserWardrobe()
  const { generateTryOn } = useTryOn()
  
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [tryOnResult, setTryOnResult] = useState<any>(null)

  const tops = wardrobeItems.filter(item => ['top', 'shirt', 'jacket', 'sweater', 'outerwear'].includes(item.category.toLowerCase()))
  const bottoms = wardrobeItems.filter(item => ['bottom', 'pants', 'jeans', 'shorts'].includes(item.category.toLowerCase()))
  const shoes = wardrobeItems.filter(item => item.category.toLowerCase() === 'shoes')
  const accessories = wardrobeItems.filter(item => item.category.toLowerCase() === 'accessories')
  const dresses = wardrobeItems.filter(item => item.category.toLowerCase() === 'dress')

  const handleTryOn = async () => {
    if (!user || !selectedItem) {
      toast.error('Please select an item to try on')
      return
    }

    try {
      const result = await generateTryOn.mutateAsync({
        userId: user.id,
        garmentId: selectedItem.id
      })
      
      setTryOnResult(result)
      toast.success('Try-on analysis complete!')
    } catch (error) {
      console.error('Try-on error:', error)
      toast.error('Failed to generate try-on. Please try again.')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your wardrobe...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please log in to access virtual try-on</p>
          <Button onClick={() => router.push('/auth/login')}>Log In</Button>
        </div>
      </div>
    )
  }

  const renderItem = (item: WardrobeItem, idx: number) => (
    <motion.div key={item.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
      <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedItem?.id === item.id ? 'ring-4 ring-blue-500' : ''}`} onClick={() => setSelectedItem(item)}>
        <CardContent className="p-4 space-y-2">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
            {item.original_photo_url || item.ai_generated_url ? (
              <Image src={item.ai_generated_url || item.original_photo_url} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Shirt className="h-12 w-12 text-gray-400" /></div>
            )}
          </div>
          <p className="text-sm font-medium text-center truncate">{item.name}</p>
          {item.brand && <p className="text-xs text-gray-500 text-center truncate">{item.brand}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )

  const EmptyState = ({ category }: { category: string }) => (
    <div className="text-center py-12">
      <Shirt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-2">No {category} in your wardrobe yet</p>
      <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/wardrobe')}>Add Items to Wardrobe</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-5 w-5 mr-2" />Back
              </Button>
              <div className="border-l h-8"></div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg"><Sparkles className="h-6 w-6 text-green-600" /></div>
                <div>
                  <h1 className="text-3xl font-bold">Virtual Try-On</h1>
                  <p className="text-gray-600 mt-1">Select an item from your wardrobe</p>
                </div>
              </div>
            </div>
            {selectedItem && <Button onClick={() => { setSelectedItem(null); setTryOnResult(null) }} variant="outline"><X className="h-4 w-4 mr-2" />Clear</Button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="tops">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="tops"><Shirt className="h-4 w-4 mr-1" />Tops ({tops.length})</TabsTrigger>
                    <TabsTrigger value="bottoms"><PantsIcon className="h-4 w-4 mr-1" />Bottoms ({bottoms.length})</TabsTrigger>
                    <TabsTrigger value="dresses"><Shirt className="h-4 w-4 mr-1" />Dresses ({dresses.length})</TabsTrigger>
                    <TabsTrigger value="shoes"><Footprints className="h-4 w-4 mr-1" />Shoes ({shoes.length})</TabsTrigger>
                    <TabsTrigger value="accessories"><Watch className="h-4 w-4 mr-1" />Accessories ({accessories.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tops" className="mt-6">{tops.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{tops.map((item, idx) => renderItem(item, idx))}</div> : <EmptyState category="tops" />}</TabsContent>
                  <TabsContent value="bottoms" className="mt-6">{bottoms.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{bottoms.map((item, idx) => renderItem(item, idx))}</div> : <EmptyState category="bottoms" />}</TabsContent>
                  <TabsContent value="dresses" className="mt-6">{dresses.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{dresses.map((item, idx) => renderItem(item, idx))}</div> : <EmptyState category="dresses" />}</TabsContent>
                  <TabsContent value="shoes" className="mt-6">{shoes.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{shoes.map((item, idx) => renderItem(item, idx))}</div> : <EmptyState category="shoes" />}</TabsContent>
                  <TabsContent value="accessories" className="mt-6">{accessories.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{accessories.map((item, idx) => renderItem(item, idx))}</div> : <EmptyState category="accessories" />}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Virtual Try-On</h2>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  {selectedItem ? (
                    <div className="text-center space-y-4 w-full">
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-white">
                        {selectedItem.original_photo_url || selectedItem.ai_generated_url ? (
                          <Image src={selectedItem.ai_generated_url || selectedItem.original_photo_url} alt={selectedItem.name} fill className="object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Shirt className="h-24 w-24 text-gray-400" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{selectedItem.name}</p>
                        {selectedItem.brand && <p className="text-sm text-gray-500">{selectedItem.brand}</p>}
                        <p className="text-xs text-gray-400 capitalize mt-1">{selectedItem.category}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Shirt className="h-24 w-24 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Select an item from your wardrobe to try on</p>
                    </div>
                  )}
                </div>

                {tryOnResult && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-blue-900">Fit Analysis</h3>
                      <div className="text-2xl font-bold text-blue-600">{(tryOnResult.fitScore * 100).toFixed(0)}%</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><p className="font-medium text-blue-900">Fit:</p><p className="text-blue-700">{tryOnResult.explanation.fit}</p></div>
                      <div><p className="font-medium text-blue-900">Style:</p><p className="text-blue-700">{tryOnResult.explanation.style}</p></div>
                      <div><p className="font-medium text-blue-900">Comfort:</p><p className="text-blue-700">{tryOnResult.explanation.comfort}</p></div>
                    </div>
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={handleTryOn} disabled={!selectedItem || generateTryOn.isPending}>
                  {generateTryOn.isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing Fit...</>) : (<><Sparkles className="h-4 w-4 mr-2" />Generate AI Try-On</>)}
                </Button>

                <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
                  <p className="flex items-center gap-2">
                    <span className={selectedItem ? 'text-green-600' : ''}>{selectedItem ? '✓' : '○'}</span>
                    Item: {selectedItem?.name || 'Not selected'}
                  </p>
                  <p className="text-gray-500 mt-2">💡 Upload your photo in "My Profile" to get personalized fit analysis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
