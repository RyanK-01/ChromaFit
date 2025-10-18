'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowUp, Search, Flame, ArrowLeft, Heart, Share2, Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

interface Trend {
  id: number
  keyword: string
  volume: number
  growth: number
  category: string
  tags: string[]
  imageUrl: string
  description: string
}

export default function ExplorePage() {
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [likedTrends, setLikedTrends] = useState<number[]>([])
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<string>('')
  
  const fetchTrends = async () => {
    setLoading(true)
    try {
      console.log('Fetching trends from API...')
      const response = await fetch('/api/explore-trends-openai')
      
      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }

      const data = await response.json()
      console.log('Trends fetched:', data)
      
      setTrends(data.trends || [])
      setSource(data.source || 'unknown')
      
      if (data.source === 'openai-generated') {
        toast.success('🤖 Loaded AI-powered fashion trends!')
      } else if (data.source === 'google-pse-openai') {
        toast.success('🔍 Loaded AI-analyzed web trends!')
      } else if (data.source === 'vertex-ai') {
        toast.success('🤖 Loaded fresh AI-powered trends!')
      } else if (data.source === 'real-time-web') {
        toast.success('🌐 Loaded real-time fashion trends!')
      } else if (data.source?.includes('dynamic-realistic')) {
        toast.success('✨ Loaded current seasonal trends!')
      } else if (data.source?.includes('fallback')) {
        toast('📚 Using curated trend collection', { icon: '📚' })
      }
    } catch (error) {
      console.error('Error fetching trends:', error)
      toast.error('Failed to load trends')
      setTrends([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
  }, [])
  
  const filtered = category === 'all' ? trends : trends.filter(t => t.category === category)

  const toggleLike = (trendId: number) => {
    setLikedTrends(prev => 
      prev.includes(trendId) 
        ? prev.filter(id => id !== trendId)
        : [...prev, trendId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Discovering the latest trends...</p>
          <p className="text-sm text-gray-400 mt-2">Powered by AI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
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
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Explore Trending Styles</h1>
                  <p className="text-gray-600 mt-1">
                    Discover what's trending in fashion right now
                    {source === 'openai-generated' && <span className="text-green-600 ml-2 font-semibold">• AI-Powered Trends</span>}
                    {source === 'google-pse-openai' && <span className="text-purple-600 ml-2 font-semibold">• Powered by Google Search + AI</span>}
                    {source === 'vertex-ai' && <span className="text-green-600 ml-2 font-semibold">• AI-Powered Real-Time</span>}
                    {source === 'real-time-web' && <span className="text-blue-600 ml-2 font-semibold">• Live Fashion Data</span>}
                    {source?.includes('dynamic-realistic') && <span className="text-blue-600 ml-2 font-semibold">• Current Season Trends</span>}
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTrends}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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

