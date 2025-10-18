'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { GarmentCard } from '@/components/GarmentCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Garment } from '@/types'
import { Plus, X, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function OutfitsPage() {
  const [selectedGarments, setSelectedGarments] = useState<string[]>([])
  const [outfitName, setOutfitName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch user's garments
  const { data: garments = [], isLoading } = useQuery({
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

  // Create outfit mutation
  const createOutfitMutation = useMutation({
    mutationFn: async (data: { name: string; garmentIds: string[] }) => {
      if (!user) throw new Error('User not authenticated')

      // Generate outfit embedding
      const response = await fetch('/api/embedding-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          garmentIds: data.garmentIds
        })
      })

      if (!response.ok) throw new Error('Failed to generate outfit embedding')

      const { outfitEmbedding } = await response.json()

      // Save outfit to database
      const { data: outfit, error } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: data.name,
          garment_ids: data.garmentIds,
          outfit_embedding: outfitEmbedding
        })
        .select()
        .single()

      if (error) throw error
      return outfit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-outfits', user?.id] })
      toast.success('Outfit created successfully!')
      setSelectedGarments([])
      setOutfitName('')
      setIsCreating(false)
    },
    onError: (error) => {
      toast.error('Failed to create outfit')
      console.error('Create outfit error:', error)
    }
  })

  const toggleGarment = (garmentId: string) => {
    setSelectedGarments(prev => 
      prev.includes(garmentId) 
        ? prev.filter(id => id !== garmentId)
        : [...prev, garmentId]
    )
  }

  const handleCreateOutfit = async () => {
    if (!outfitName.trim() || selectedGarments.length === 0) {
      toast.error('Please provide an outfit name and select at least one garment')
      return
    }

    await createOutfitMutation.mutateAsync({
      name: outfitName,
      garmentIds: selectedGarments
    })
  }

  const selectedGarmentsData = garments.filter(g => selectedGarments.includes(g.id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Outfit</h1>
          <p className="text-gray-600">Combine garments to create your perfect outfit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Garment Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Garments</CardTitle>
              <CardDescription>
                Choose garments from your wardrobe to create an outfit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {garments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No garments yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add some garments to your wardrobe first
                  </p>
                  <Button asChild>
                    <a href="/dashboard/wardrobe">
                      Go to Wardrobe
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {garments.map(garment => (
                    <div key={garment.id} className="relative">
                      <GarmentCard 
                        garment={garment} 
                        showActions={false}
                      />
                      <Button
                        size="sm"
                        variant={selectedGarments.includes(garment.id) ? "default" : "outline"}
                        className="absolute top-2 right-2"
                        onClick={() => toggleGarment(garment.id)}
                      >
                        {selectedGarments.includes(garment.id) ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Outfit Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outfit Preview</CardTitle>
              <CardDescription>
                {selectedGarments.length} garment{selectedGarments.length !== 1 ? 's' : ''} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedGarmentsData.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {selectedGarmentsData.map(garment => (
                      <div key={garment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden">
                            {garment.image_url && (
                              <img 
                                src={garment.image_url} 
                                alt={garment.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{garment.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {garment.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleGarment(garment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Outfit Name
                    </label>
                    <Input
                      value={outfitName}
                      onChange={(e) => setOutfitName(e.target.value)}
                      placeholder="My Awesome Outfit"
                    />
                  </div>

                  <Button 
                    onClick={handleCreateOutfit}
                    className="w-full"
                    disabled={createOutfitMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createOutfitMutation.isPending ? 'Creating...' : 'Create Outfit'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Select garments from your wardrobe to create an outfit
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
