'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Loader2, Trash2, Edit2, Upload, Shirt } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { WardrobeItem } from '@/types'
import { AddGarmentDialog } from '@/components/AddGarmentDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function WardrobePage() {
  const [user, setUser] = useState<any>(null)
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'top', label: 'Tops' },
    { value: 'bottom', label: 'Bottoms' },
    { value: 'dress', label: 'Dresses' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'other', label: 'Other' },
  ]

  useEffect(() => {
    loadUserAndWardrobe()
  }, [])

  const loadUserAndWardrobe = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Load wardrobe items
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (itemsError) {
        throw itemsError
      }

      setWardrobeItems(items || [])
    } catch (err: any) {
      console.error('Error loading wardrobe:', err)
      setError(err.message || 'Failed to load wardrobe')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('wardrobe')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setWardrobeItems(items => items.filter(item => item.id !== itemId))
    } catch (err: any) {
      console.error('Error deleting item:', err)
      setError(err.message || 'Failed to delete item')
    }
  }

  const handleEditItem = (item: WardrobeItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const filteredItems = selectedCategory === 'all'
    ? wardrobeItems
    : wardrobeItems.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading wardrobe...</p>
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="border-l h-8"></div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shirt className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Wardrobe</h1>
                  <p className="text-gray-600 mt-1">Manage your clothing collection</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} size="lg" className="bg-black hover:bg-gray-800">
              <Plus className="h-5 w-5 mr-2" />
              Add Garment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map(category => (
            <motion.div
              key={category.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-full transition-all ${
                  selectedCategory === category.value 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'hover:bg-purple-50 hover:border-purple-300'
                }`}
              >
                {category.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Wardrobe Grid */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center py-12">
              <CardContent>
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedCategory === 'all' ? 'No items in wardrobe' : `No ${selectedCategory} items`}
                </h3>
                <p className="text-gray-600 mb-4">
                  Start building your digital wardrobe by adding your first garment
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Garment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  layout
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all border-2 hover:border-purple-200">
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={item.ai_generated_url || item.original_photo_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {item.ai_generated_url && (
                        <motion.div 
                          className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          AI Enhanced
                        </motion.div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="capitalize">{item.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        {item.brand && <p><span className="font-medium">Brand:</span> {item.brand}</p>}
                        {item.size && <p><span className="font-medium">Size:</span> {item.size}</p>}
                        {item.color && <p><span className="font-medium">Color:</span> {item.color}</p>}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Add/Edit Garment Dialog */}
      <AddGarmentDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={loadUserAndWardrobe}
        editingItem={editingItem}
      />
    </div>
  )
}
