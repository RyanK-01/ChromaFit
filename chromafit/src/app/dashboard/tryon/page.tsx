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
  
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null)
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null)
  const [selectedShoes, setSelectedShoes] = useState<WardrobeItem | null>(null)
  const [selectedAccessories, setSelectedAccessories] = useState<WardrobeItem[]>([])
  const [selectedDress, setSelectedDress] = useState<WardrobeItem | null>(null)
  const [tryOnResults, setTryOnResults] = useState<any[]>([])
  const [currentTab, setCurrentTab] = useState('tops')

  const tops = wardrobeItems.filter(item => ['top', 'shirt', 'jacket', 'sweater', 'outerwear'].includes(item.category.toLowerCase()))
  const bottoms = wardrobeItems.filter(item => ['bottom', 'pants', 'jeans', 'shorts'].includes(item.category.toLowerCase()))
  const shoes = wardrobeItems.filter(item => item.category.toLowerCase() === 'shoes')
  const accessories = wardrobeItems.filter(item => item.category.toLowerCase() === 'accessories')
  const dresses = wardrobeItems.filter(item => item.category.toLowerCase() === 'dress')

  const handleItemSelect = (item: WardrobeItem, category: string) => {
    if (category === 'tops') {
      setSelectedTop(selectedTop?.id === item.id ? null : item)
      if (selectedDress) setSelectedDress(null)
    } else if (category === 'bottoms') {
      setSelectedBottom(selectedBottom?.id === item.id ? null : item)
      if (selectedDress) setSelectedDress(null)
    } else if (category === 'shoes') {
      setSelectedShoes(selectedShoes?.id === item.id ? null : item)
    } else if (category === 'accessories') {
      const isSelected = selectedAccessories.some(acc => acc.id === item.id)
      if (isSelected) {
        setSelectedAccessories(selectedAccessories.filter(acc => acc.id !== item.id))
      } else {
        setSelectedAccessories([...selectedAccessories, item])
      }
    } else if (category === 'dresses') {
      setSelectedDress(selectedDress?.id === item.id ? null : item)
      if (!selectedDress || selectedDress.id !== item.id) {
        setSelectedTop(null)
        setSelectedBottom(null)
      }
    }
  }

  const handleTryOn = async () => {
    if (!user) {
      toast.error('Please log in to use virtual try-on')
      return
    }

    const itemsToTryOn: WardrobeItem[] = []
    
    if (selectedDress) {
      itemsToTryOn.push(selectedDress)
    } else {
      if (selectedTop) itemsToTryOn.push(selectedTop)
      if (selectedBottom) itemsToTryOn.push(selectedBottom)
    }
    
    if (selectedShoes) itemsToTryOn.push(selectedShoes)
    itemsToTryOn.push(...selectedAccessories)

    if (itemsToTryOn.length === 0) {
      toast.error('Please select at least one item to try on')
      return
    }

    try {
      setTryOnResults([])
      const results = []

      for (const item of itemsToTryOn) {
        toast.loading(`Analyzing ${item.name}...`, { id: item.id })
        
        try {
          const result = await generateTryOn.mutateAsync({
            userId: user.id,
            garmentId: item.id
          })
          
          results.push({ item, result })
          toast.success(`${item.name} analyzed!`, { id: item.id })
        } catch (itemError) {
          console.error(`Error analyzing ${item.name}:`, itemError)
          toast.error(`Failed to analyze ${item.name}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`, { id: item.id })
          throw itemError // Re-throw to stop the loop
        }
      }
      
      setTryOnResults(results)
      toast.success('Complete outfit analysis done!')
    } catch (error) {
      console.error('Try-on error details:', {
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      })
      
      let errorMessage = 'Failed to generate try-on'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
      }
      
      toast.error(errorMessage)
    }
  }

  const handleClearAll = () => {
    setSelectedTop(null)
    setSelectedBottom(null)
    setSelectedShoes(null)
    setSelectedAccessories([])
    setSelectedDress(null)
    setTryOnResults([])
  }

  const hasSelection = selectedTop || selectedBottom || selectedShoes || selectedAccessories.length > 0 || selectedDress

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

  const renderItem = (item: WardrobeItem, idx: number, category: string) => {
    let isSelected = false
    if (category === 'tops') isSelected = selectedTop?.id === item.id
    else if (category === 'bottoms') isSelected = selectedBottom?.id === item.id
    else if (category === 'shoes') isSelected = selectedShoes?.id === item.id
    else if (category === 'accessories') isSelected = selectedAccessories.some(acc => acc.id === item.id)
    else if (category === 'dresses') isSelected = selectedDress?.id === item.id

    return (
      <motion.div key={item.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-4 ring-blue-500' : ''}`} 
          onClick={() => handleItemSelect(item, category)}
        >
          <CardContent className="p-4 space-y-2">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
              {item.original_photo_url || item.ai_generated_url ? (
                <Image src={item.ai_generated_url || item.original_photo_url} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Shirt className="h-12 w-12 text-gray-400" /></div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-center truncate">{item.name}</p>
            {item.brand && <p className="text-xs text-gray-500 text-center truncate">{item.brand}</p>}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const EmptyState = ({ category }: { category: string }) => (
    <div className="text-center py-12">
      <Shirt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-2">No {category} in your wardrobe yet</p>
      <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/wardrobe')}>Add Items to Wardrobe</Button>
    </div>
  )

  const avgFitScore = tryOnResults.length > 0 
    ? tryOnResults.reduce((sum, r) => sum + r.result.fitScore, 0) / tryOnResults.length 
    : 0

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
                  <p className="text-gray-600 mt-1">Build your outfit: Top + Bottom + Shoes (+ Accessories)</p>
                </div>
              </div>
            </div>
            {hasSelection && <Button onClick={handleClearAll} variant="outline"><X className="h-4 w-4 mr-2" />Clear All</Button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="tops"><Shirt className="h-4 w-4 mr-1" />Tops</TabsTrigger>
                    <TabsTrigger value="bottoms"><PantsIcon className="h-4 w-4 mr-1" />Bottoms</TabsTrigger>
                    <TabsTrigger value="dresses"><Shirt className="h-4 w-4 mr-1" />Dresses</TabsTrigger>
                    <TabsTrigger value="shoes"><Footprints className="h-4 w-4 mr-1" />Shoes</TabsTrigger>
                    <TabsTrigger value="accessories"><Watch className="h-4 w-4 mr-1" />Accessories</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tops" className="mt-6">{tops.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{tops.map((item, idx) => renderItem(item, idx, 'tops'))}</div> : <EmptyState category="tops" />}</TabsContent>
                  <TabsContent value="bottoms" className="mt-6">{bottoms.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{bottoms.map((item, idx) => renderItem(item, idx, 'bottoms'))}</div> : <EmptyState category="bottoms" />}</TabsContent>
                  <TabsContent value="dresses" className="mt-6">{dresses.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{dresses.map((item, idx) => renderItem(item, idx, 'dresses'))}</div> : <EmptyState category="dresses" />}</TabsContent>
                  <TabsContent value="shoes" className="mt-6">{shoes.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{shoes.map((item, idx) => renderItem(item, idx, 'shoes'))}</div> : <EmptyState category="shoes" />}</TabsContent>
                  <TabsContent value="accessories" className="mt-6">{accessories.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{accessories.map((item, idx) => renderItem(item, idx, 'accessories'))}</div> : <EmptyState category="accessories" />}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Your Outfit</h2>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <div className="space-y-3">
                  {selectedDress ? (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs font-medium text-purple-900 mb-1">Dress</p>
                      <p className="text-sm font-semibold text-purple-800">{selectedDress.name}</p>
                    </div>
                  ) : (
                    <>
                      <div className={`p-3 rounded-lg border-2 border-dashed ${selectedTop ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                        <p className="text-xs font-medium text-gray-700 mb-1">Top {!selectedTop && '(Default: White T-Shirt)'}</p>
                        {selectedTop && <p className="text-sm font-semibold text-blue-900">{selectedTop.name}</p>}
                      </div>
                      <div className={`p-3 rounded-lg border-2 border-dashed ${selectedBottom ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                        <p className="text-xs font-medium text-gray-700 mb-1">Bottom {!selectedBottom && '(Default: White Pants)'}</p>
                        {selectedBottom && <p className="text-sm font-semibold text-blue-900">{selectedBottom.name}</p>}
                      </div>
                    </>
                  )}
                  <div className={`p-3 rounded-lg border-2 border-dashed ${selectedShoes ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs font-medium text-gray-700 mb-1">Shoes {!selectedShoes && '(Default: White Sneakers)'}</p>
                    {selectedShoes && <p className="text-sm font-semibold text-blue-900">{selectedShoes.name}</p>}
                  </div>
                  {selectedAccessories.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-medium text-green-900 mb-1">Accessories ({selectedAccessories.length})</p>
                      {selectedAccessories.map(acc => (
                        <p key={acc.id} className="text-sm text-green-800"> {acc.name}</p>
                      ))}
                    </div>
                  )}
                </div>

                {tryOnResults.length > 0 && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-blue-900">Outfit Analysis</h3>
                      <div className="text-2xl font-bold text-blue-600">{(avgFitScore * 100).toFixed(0)}%</div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {tryOnResults.map(({ item, result }) => (
                        <div key={item.id} className="bg-white p-3 rounded border border-blue-100">
                          <p className="font-medium text-sm text-blue-900 mb-1">{item.name}</p>
                          <p className="text-xs text-blue-700"><strong>Fit:</strong> {result.explanation.fit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={handleTryOn} disabled={!hasSelection || generateTryOn.isPending}>
                  {generateTryOn.isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing Outfit...</>) : (<><Sparkles className="h-4 w-4 mr-2" />Generate AI Try-On</>)}
                </Button>

                <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
                  <p className="flex items-center gap-2">
                    <span className={selectedTop || selectedDress ? 'text-green-600' : 'text-gray-400'}>{selectedTop || selectedDress ? '' : ''}</span>
                    {selectedDress ? `Dress: ${selectedDress.name}` : `Top: ${selectedTop?.name || 'Default white t-shirt'}`}
                  </p>
                  {!selectedDress && (
                    <p className="flex items-center gap-2">
                      <span className={selectedBottom ? 'text-green-600' : 'text-gray-400'}>{selectedBottom ? '' : ''}</span>
                      Bottom: {selectedBottom?.name || 'Default white pants'}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span className={selectedShoes ? 'text-green-600' : 'text-gray-400'}>{selectedShoes ? '' : ''}</span>
                    Shoes: {selectedShoes?.name || 'Default white sneakers'}
                  </p>
                  {selectedAccessories.length > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="text-green-600"></span>
                      Accessories: {selectedAccessories.length} item(s)
                    </p>
                  )}
                  <p className="text-gray-500 mt-2"> Upload your photo in "My Profile" for personalized analysis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
