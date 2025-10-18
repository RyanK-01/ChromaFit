'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { GarmentCard } from '@/components/GarmentCard'
import { GarmentCardSkeleton } from '@/components/GarmentCardSkeleton'
import { AddGarmentDialog } from '@/components/AddGarmentDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Garment, GarmentCategory } from '@/types'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'
import { toast } from 'sonner'

export default function WardrobePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch user's garments
  const { data: garments = [], isLoading, error } = useQuery({
    queryKey: ['garments', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Garment[]
    },
    enabled: !!user?.id
  })

  // Delete garment mutation
  const deleteGarmentMutation = useMutation({
    mutationFn: async (garmentId: string) => {
      const { error } = await supabase
        .from('garments')
        .delete()
        .eq('id', garmentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garments', user?.id] })
      toast.success('Garment deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete garment')
      console.error('Delete error:', error)
    }
  })

  // Filter garments based on search and category
  const filteredGarments = garments.filter(garment => {
    const matchesSearch = garment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         garment.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || garment.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(garments.map(g => g.category))) as GarmentCategory[]

  const handleDeleteGarment = (garmentId: string) => {
    if (confirm('Are you sure you want to delete this garment?')) {
      deleteGarmentMutation.mutate(garmentId)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <GarmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load wardrobe</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wardrobe</h1>
          <p className="text-gray-600">
            {garments.length} item{garments.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <AddGarmentDialog>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Garment
          </Button>
        </AddGarmentDialog>
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
                  placeholder="Search garments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {garments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your wardrobe is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your virtual wardrobe by adding garments from your closet or online stores.
              </p>
              <AddGarmentDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Garment
                </Button>
              </AddGarmentDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {garments.length > 0 && filteredGarments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No garments found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Garments Grid/List */}
      {filteredGarments.length > 0 && (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredGarments.map(garment => (
            <GarmentCard
              key={garment.id}
              garment={garment}
              onDelete={handleDeleteGarment}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {garments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wardrobe Statistics</CardTitle>
            <CardDescription>
              Insights about your garment collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {garments.length}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {garments.filter(g => g.source_type === 'upload').length}
                </div>
                <div className="text-sm text-gray-600">Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {garments.filter(g => g.source_type === 'url').length}
                </div>
                <div className="text-sm text-gray-600">From URLs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
