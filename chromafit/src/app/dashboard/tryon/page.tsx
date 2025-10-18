'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shirt, Footprints, Watch, Sparkles, X, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

// Mock data for clothing items
const clothingItems = {
  tops: [
    { id: 1, name: 'White T-Shirt', image: '/placeholder-top-1.jpg', color: '#FFFFFF', border: '#E5E7EB' },
    { id: 2, name: 'Black Hoodie', image: '/placeholder-top-2.jpg', color: '#000000', border: '#000000' },
    { id: 3, name: 'Blue Denim Jacket', image: '/placeholder-top-3.jpg', color: '#4A90E2', border: '#4A90E2' },
    { id: 4, name: 'Gray Sweater', image: '/placeholder-top-4.jpg', color: '#808080', border: '#808080' },
    { id: 5, name: 'Red Polo', image: '/placeholder-top-5.jpg', color: '#DC2626', border: '#DC2626' },
    { id: 6, name: 'Green Jacket', image: '/placeholder-top-6.jpg', color: '#059669', border: '#059669' },
  ],
  bottoms: [
    { id: 1, name: 'Blue Jeans', image: '/placeholder-bottom-1.jpg', color: '#1E3A8A', border: '#1E3A8A' },
    { id: 2, name: 'Black Pants', image: '/placeholder-bottom-2.jpg', color: '#000000', border: '#000000' },
    { id: 3, name: 'Khaki Shorts', image: '/placeholder-bottom-3.jpg', color: '#C4A57B', border: '#C4A57B' },
    { id: 4, name: 'Gray Joggers', image: '/placeholder-bottom-4.jpg', color: '#6B7280', border: '#6B7280' },
    { id: 5, name: 'Navy Chinos', image: '/placeholder-bottom-5.jpg', color: '#1E40AF', border: '#1E40AF' },
    { id: 6, name: 'Cargo Pants', image: '/placeholder-bottom-6.jpg', color: '#78716C', border: '#78716C' },
  ],
  shoes: [
    { id: 1, name: 'White Sneakers', image: '/placeholder-shoes-1.jpg', color: '#FFFFFF', border: '#E5E7EB' },
    { id: 2, name: 'Black Boots', image: '/placeholder-shoes-2.jpg', color: '#000000', border: '#000000' },
    { id: 3, name: 'Brown Loafers', image: '/placeholder-shoes-3.jpg', color: '#8B4513', border: '#8B4513' },
    { id: 4, name: 'Red Sneakers', image: '/placeholder-shoes-4.jpg', color: '#DC2626', border: '#DC2626' },
    { id: 5, name: 'Blue Runners', image: '/placeholder-shoes-5.jpg', color: '#3B82F6', border: '#3B82F6' },
    { id: 6, name: 'Tan Boots', image: '/placeholder-shoes-6.jpg', color: '#D2691E', border: '#D2691E' },
  ],
  accessories: [
    { id: 1, name: 'Silver Watch', image: '/placeholder-acc-1.jpg', color: '#C0C0C0', border: '#C0C0C0' },
    { id: 2, name: 'Gold Necklace', image: '/placeholder-acc-2.jpg', color: '#FFD700', border: '#FFD700' },
    { id: 3, name: 'Black Sunglasses', image: '/placeholder-acc-3.jpg', color: '#000000', border: '#000000' },
    { id: 4, name: 'Leather Belt', image: '/placeholder-acc-4.jpg', color: '#8B4513', border: '#8B4513' },
    { id: 5, name: 'Blue Cap', image: '/placeholder-acc-5.jpg', color: '#1E3A8A', border: '#1E3A8A' },
    { id: 6, name: 'Red Scarf', image: '/placeholder-acc-6.jpg', color: '#DC2626', border: '#DC2626' },
  ],
}

type ClothingItem = typeof clothingItems.tops[0]

export default function VirtualTryOnPage() {
  const router = useRouter()
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null)
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null)
  const [selectedShoes, setSelectedShoes] = useState<ClothingItem | null>(null)
  const [selectedAccessories, setSelectedAccessories] = useState<ClothingItem[]>([])

  const handleAccessoryToggle = (accessory: ClothingItem) => {
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
    setSelectedShoes(null)
    setSelectedAccessories([])
  }

  const hasSelection = selectedTop || selectedBottom || selectedShoes || selectedAccessories.length > 0

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
                <div className="bg-green-100 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
                  <p className="text-gray-600 mt-1">Mix and match items to create your perfect outfit</p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Item Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="tops" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="tops" className="flex items-center gap-2">
                    <Shirt className="h-4 w-4" />
                    Tops
                  </TabsTrigger>
                  <TabsTrigger value="bottoms" className="flex items-center gap-2">
                    <PantsIcon className="h-4 w-4" />
                    Bottoms
                  </TabsTrigger>
                  <TabsTrigger value="shoes" className="flex items-center gap-2">
                    <Footprints className="h-4 w-4" />
                    Shoes
                  </TabsTrigger>
                  <TabsTrigger value="accessories" className="flex items-center gap-2">
                    <Watch className="h-4 w-4" />
                    Accessories
                  </TabsTrigger>
                </TabsList>

                {/* Tops */}
                <TabsContent value="tops" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clothingItems.tops.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-2xl ${
                            selectedTop?.id === item.id ? 'ring-4 ring-blue-500 shadow-xl' : ''
                          }`}
                          onClick={() => setSelectedTop(item)}
                        >
                          <CardContent className="p-4 space-y-2">
                            <motion.div
                              className="aspect-square rounded-lg flex items-center justify-center border-2"
                              style={{ 
                                backgroundColor: item.color,
                                borderColor: item.border
                              }}
                              animate={selectedTop?.id === item.id ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <Shirt className="h-12 w-12" style={{ color: item.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                            </motion.div>
                            <p className="text-sm font-medium text-center truncate">{item.name}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Bottoms */}
                <TabsContent value="bottoms" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clothingItems.bottoms.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-2xl ${
                            selectedBottom?.id === item.id ? 'ring-4 ring-blue-500 shadow-xl' : ''
                          }`}
                          onClick={() => setSelectedBottom(item)}
                        >
                          <CardContent className="p-4 space-y-2">
                            <motion.div
                              className="aspect-square rounded-lg flex items-center justify-center border-2"
                              style={{ 
                                backgroundColor: item.color,
                                borderColor: item.border
                              }}
                              animate={selectedBottom?.id === item.id ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <PantsIcon className="h-12 w-12" style={{ color: item.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                            </motion.div>
                            <p className="text-sm font-medium text-center truncate">{item.name}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Shoes */}
                <TabsContent value="shoes" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clothingItems.shoes.map(item => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                          selectedShoes?.id === item.id ? 'ring-2 ring-primary shadow-lg' : ''
                        }`}
                        onClick={() => setSelectedShoes(item)}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div
                            className="aspect-square rounded-lg flex items-center justify-center border-2"
                            style={{ 
                              backgroundColor: item.color,
                              borderColor: item.border
                            }}
                          >
                            <Footprints className="h-12 w-12" style={{ color: item.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                          </div>
                          <p className="text-sm font-medium text-center truncate">{item.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Accessories */}
                <TabsContent value="accessories" className="mt-6">
                  <p className="text-sm text-muted-foreground mb-4">Click to select multiple accessories</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clothingItems.accessories.map(item => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                          selectedAccessories.find(a => a.id === item.id) ? 'ring-2 ring-primary shadow-lg' : ''
                        }`}
                        onClick={() => handleAccessoryToggle(item)}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div
                            className="aspect-square rounded-lg flex items-center justify-center border-2"
                            style={{ 
                              backgroundColor: item.color,
                              borderColor: item.border
                            }}
                          >
                            <Watch className="h-12 w-12" style={{ color: item.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                          </div>
                          <p className="text-sm font-medium text-center truncate">{item.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Preview */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Look</h2>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              {/* Preview Area */}
              <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-lg p-6 flex flex-col justify-between border-2 border-dashed border-muted-foreground/20">
                {/* Top */}
                <div className="flex-1 flex items-start justify-center pt-4">
                  {selectedTop ? (
                    <div className="text-center space-y-2 relative group">
                      <button
                        onClick={() => setSelectedTop(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div
                        className="w-28 h-28 rounded-lg mx-auto flex items-center justify-center shadow-md border-2"
                        style={{ 
                          backgroundColor: selectedTop.color,
                          borderColor: selectedTop.border
                        }}
                      >
                        <Shirt className="h-14 w-14" style={{ color: selectedTop.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                      </div>
                      <p className="text-xs font-medium">{selectedTop.name}</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Shirt className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Select a top</p>
                    </div>
                  )}
                </div>

                {/* Bottom */}
                <div className="flex-1 flex items-center justify-center">
                  {selectedBottom ? (
                    <div className="text-center space-y-2 relative group">
                      <button
                        onClick={() => setSelectedBottom(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div
                        className="w-28 h-28 rounded-lg mx-auto flex items-center justify-center shadow-md border-2"
                        style={{ 
                          backgroundColor: selectedBottom.color,
                          borderColor: selectedBottom.border
                        }}
                      >
                        <PantsIcon className="h-14 w-14" style={{ color: selectedBottom.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                      </div>
                      <p className="text-xs font-medium">{selectedBottom.name}</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <PantsIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Select bottoms</p>
                    </div>
                  )}
                </div>

                {/* Shoes */}
                <div className="flex-1 flex items-end justify-center pb-4">
                  {selectedShoes ? (
                    <div className="text-center space-y-2 relative group">
                      <button
                        onClick={() => setSelectedShoes(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div
                        className="w-28 h-28 rounded-lg mx-auto flex items-center justify-center shadow-md border-2"
                        style={{ 
                          backgroundColor: selectedShoes.color,
                          borderColor: selectedShoes.border
                        }}
                      >
                        <Footprints className="h-14 w-14" style={{ color: selectedShoes.color === '#FFFFFF' ? '#6B7280' : '#FFFFFF' }} />
                      </div>
                      <p className="text-xs font-medium">{selectedShoes.name}</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Footprints className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Select shoes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Accessories */}
              {selectedAccessories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Accessories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAccessories.map(item => (
                      <div
                        key={item.id}
                        className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: item.color + '30',
                          border: `1px solid ${item.border}`
                        }}
                        onClick={() => handleAccessoryToggle(item)}
                      >
                        <Watch className="h-3 w-3" />
                        {item.name}
                        <X className="h-3 w-3" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button (disabled for now) */}
              <Button className="w-full" size="lg" disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Try-On (Coming Soon)
              </Button>

              {/* Selection Summary */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p className="flex items-center gap-2">
                  <span className={selectedTop ? 'text-green-600' : ''}>
                    {selectedTop ? '✓' : '○'}
                  </span>
                  Top: {selectedTop?.name || 'Not selected'}
                </p>
                <p className="flex items-center gap-2">
                  <span className={selectedBottom ? 'text-green-600' : ''}>
                    {selectedBottom ? '✓' : '○'}
                  </span>
                  Bottom: {selectedBottom?.name || 'Not selected'}
                </p>
                <p className="flex items-center gap-2">
                  <span className={selectedShoes ? 'text-green-600' : ''}>
                    {selectedShoes ? '✓' : '○'}
                  </span>
                  Shoes: {selectedShoes?.name || 'Not selected'}
                </p>
                <p className="flex items-center gap-2">
                  <span className={selectedAccessories.length > 0 ? 'text-green-600' : ''}>
                    {selectedAccessories.length > 0 ? '✓' : '○'}
                  </span>
                  Accessories: {selectedAccessories.length} selected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
