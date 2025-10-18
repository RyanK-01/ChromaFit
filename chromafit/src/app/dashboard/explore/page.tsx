'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowUp, Search, Flame, ArrowLeft, Heart, Share2 } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// Mock trend data with image placeholders
const TRENDS = [
  { 
    id: 1,
    keyword: 'Y2K Fashion', 
    volume: 125000, 
    growth: 45.2, 
    category: 'style', 
    tags: ['low rise jeans', 'butterfly clips', 'crop tops'],
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    description: 'Early 2000s nostalgia with a modern twist'
  },
  { 
    id: 2,
    keyword: 'Cottagecore', 
    volume: 98000, 
    growth: 32.8, 
    category: 'aesthetic', 
    tags: ['prairie dress', 'floral patterns', 'vintage'],
    imageUrl: 'https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400&h=500&fit=crop',
    description: 'Romantic rural-inspired fashion'
  },
  { 
    id: 3,
    keyword: 'Dark Academia', 
    volume: 87000, 
    growth: 28.5, 
    category: 'aesthetic', 
    tags: ['blazers', 'plaid skirts', 'oxford shoes'],
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop',
    description: 'Classic, scholarly elegance'
  },
  { 
    id: 4,
    keyword: 'Oversized Blazers', 
    volume: 156000, 
    growth: 67.3, 
    category: 'garment', 
    tags: ['power dressing', 'structured', 'tailored'],
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
    description: 'Bold statement pieces'
  },
  { 
    id: 5,
    keyword: 'Wide Leg Pants', 
    volume: 203000, 
    growth: 89.4, 
    category: 'garment', 
    tags: ['palazzo pants', 'comfort', 'flowy'],
    imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop',
    description: 'Comfortable and chic'
  },
  { 
    id: 6,
    keyword: 'Monochrome Outfits', 
    volume: 112000, 
    growth: 41.7, 
    category: 'style', 
    tags: ['minimal', 'sophisticated', 'all black'],
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
    description: 'Sleek and sophisticated'
  },
  { 
    id: 7,
    keyword: 'Sustainable Fashion', 
    volume: 189000, 
    growth: 78.9, 
    category: 'movement', 
    tags: ['eco-friendly', 'thrifting', 'vintage'],
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop',
    description: 'Ethical and eco-conscious'
  },
  { 
    id: 8,
    keyword: 'Athleisure', 
    volume: 234000, 
    growth: 52.1, 
    category: 'style', 
    tags: ['sporty', 'comfortable', 'activewear'],
    imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=500&fit=crop',
    description: 'Sport meets street style'
  },
  { 
    id: 9,
    keyword: 'Vintage Denim', 
    volume: 145000, 
    growth: 55.3, 
    category: 'garment', 
    tags: ['90s', 'relaxed fit', 'distressed'],
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    description: 'Timeless denim pieces'
  },
  { 
    id: 10,
    keyword: 'Minimalist Wardrobe', 
    volume: 167000, 
    growth: 63.8, 
    category: 'movement', 
    tags: ['capsule', 'neutral', 'quality'],
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea1c8347?w=400&h=500&fit=crop',
    description: 'Less is more approach'
  },
  { 
    id: 11,
    keyword: 'Streetwear', 
    volume: 278000, 
    growth: 72.4, 
    category: 'style', 
    tags: ['urban', 'sneakers', 'hoodies'],
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    description: 'Urban casual fashion'
  },
  { 
    id: 12,
    keyword: 'Boho Chic', 
    volume: 134000, 
    growth: 38.9, 
    category: 'aesthetic', 
    tags: ['flowy', 'patterns', 'earthy'],
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
    description: 'Free-spirited and artistic'
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [likedTrends, setLikedTrends] = useState<number[]>([])
  
  const filtered = category === 'all' ? TRENDS : TRENDS.filter(t => t.category === category)

  const toggleLike = (trendId: number) => {
    setLikedTrends(prev => 
      prev.includes(trendId) 
        ? prev.filter(id => id !== trendId)
        : [...prev, trendId]
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b">
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
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Explore Trending Styles</h1>
                  <p className="text-gray-600 mt-1">Discover what's trending in fashion right now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Category Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {['all', 'style', 'garment', 'aesthetic', 'movement'].map(cat => (
                <Button 
                  key={cat} 
                  variant={category === cat ? 'default' : 'outline'} 
                  size="lg"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full ${
                    category === cat 
                      ? 'bg-black hover:bg-gray-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
                <div className="text-sm text-gray-600">Trending Now</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <ArrowUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(filtered.reduce((sum, t) => sum + t.growth, 0) / filtered.length)}%
                </div>
                <div className="text-sm text-gray-600">Avg Growth</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(filtered.reduce((sum, t) => sum + t.volume, 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">Total Searches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.map((trend, index) => (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-orange-200"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <Image
                      src={trend.imageUrl}
                      alt={trend.keyword}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Overlay Actions */}
                    <motion.div 
                      className="absolute top-3 right-3 flex gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(trend.id)
                        }}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${
                            likedTrends.includes(trend.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-700'
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Share2 className="h-5 w-5 text-gray-700" />
                      </motion.button>
                    </motion.div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0">
                        {trend.category}
                      </Badge>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg mb-1">{trend.keyword}</h3>
                      <p className="text-sm text-white/90 mb-3">{trend.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Search className="h-4 w-4" />
                            <span>{(trend.volume/1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-400">
                            <ArrowUp className="h-4 w-4" />
                            <span>{trend.growth.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {trend.tags.map((tag, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
