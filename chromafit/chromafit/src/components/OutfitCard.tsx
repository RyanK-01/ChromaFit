'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StyleSimilarity } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Heart, MessageCircle } from 'lucide-react'

interface OutfitCardProps {
  outfit: StyleSimilarity
  showSimilarity?: boolean
}

export function OutfitCard({ outfit, showSimilarity = true }: OutfitCardProps) {
  const similarityPercentage = Math.round(outfit.similarity_score * 100)

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <Link href={`/dashboard/explore/outfit/${outfit.outfit.id}`}>
        <CardContent className="p-0">
          {/* Outfit Images */}
          <div className="grid grid-cols-2 gap-1 aspect-square">
            {outfit.garments.slice(0, 4).map((garment, index) => (
              <div key={garment.id} className="relative overflow-hidden">
                {garment.image_url ? (
                  <Image
                    src={garment.image_url}
                    alt={garment.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                {/* Overlay for additional items */}
                {index === 3 && outfit.garments.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      +{outfit.garments.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header with user info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={outfit.user_profile.avatar_photo_url || ''} />
                  <AvatarFallback className="text-xs">
                    {outfit.user_profile.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {outfit.user_profile.display_name || 'Anonymous'}
                </span>
              </div>
              
              {showSimilarity && (
                <Badge className={`text-xs ${getSimilarityColor(similarityPercentage)} border-0`}>
                  {similarityPercentage}% match
                </Badge>
              )}
            </div>

            {/* Outfit name */}
            <div>
              <h3 className="font-medium text-gray-900 truncate">
                {outfit.outfit.name}
              </h3>
              <p className="text-sm text-gray-600">
                {outfit.garments.length} item{outfit.garments.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Garment categories */}
            <div className="flex flex-wrap gap-1">
              {outfit.garments.slice(0, 3).map((garment) => (
                <Badge 
                  key={garment.id} 
                  variant="secondary" 
                  className="text-xs px-2 py-0"
                >
                  {garment.category}
                </Badge>
              ))}
              {outfit.garments.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{outfit.garments.length - 3} more
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>24</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>3</span>
                </div>
              </div>
              <span className="text-xs">
                {new Date(outfit.outfit.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
