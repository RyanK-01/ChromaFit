'use client'

import { useState } from 'react'
import { useStyleSimilarity } from '@/hooks/useStyleSimilarity'
import { OutfitCard } from '@/components/OutfitCard'
import { OutfitCardSkeleton } from '@/components/OutfitCardSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, TrendingUp, Users, Sparkles } from 'lucide-react'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'similar'>('similar')
  const { useSimilarOutfits } = useStyleSimilarity()
  
  const { data: outfits = [], isLoading, error } = useSimilarOutfits()

  // Filter outfits based on search
  const filteredOutfits = outfits.filter(outfit => {
    const matchesSearch = 
      outfit.outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outfit.garments.some(garment => 
        garment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        garment.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesSearch
  })

  // Sort outfits
  const sortedOutfits = [...filteredOutfits].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.outfit.created_at).getTime() - new Date(a.outfit.created_at).getTime()
    } else {
      return b.similarity_score - a.similarity_score
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div>
                    <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <OutfitCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load outfits</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Styles</h1>
          <p className="text-gray-600">
            Discover outfits from the community and find your style inspiration
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search outfits, garments, or styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'similar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('similar')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Most Similar
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Most Recent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{outfits.length}</div>
                <div className="text-sm text-gray-600">Outfits Discovered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-lg font-semibold">
                  {outfits.length > 0 ? Math.round(outfits.reduce((sum, outfit) => sum + outfit.similarity_score, 0) / outfits.length * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg. Similarity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-semibold">
                  {new Set(outfits.map(o => o.user_id)).size}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {outfits.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No outfits to explore yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to create an outfit and share it with the community!
              </p>
              <Button>
                Create Your First Outfit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {outfits.length > 0 && filteredOutfits.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No outfits found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outfits Grid */}
      {sortedOutfits.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {sortBy === 'similar' ? 'Similar to Your Style' : 'Latest Outfits'}
            </h2>
            <Badge variant="secondary">
              {sortedOutfits.length} outfit{sortedOutfits.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOutfits.map((outfit) => (
              <OutfitCard
                key={outfit.outfit_id}
                outfit={outfit}
                showSimilarity={sortBy === 'similar'}
              />
            ))}
          </div>
        </>
      )}

      {/* Load More */}
      {sortedOutfits.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Outfits
          </Button>
        </div>
      )}
    </div>
  )
}
