'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Garment } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { Shirt, ExternalLink } from 'lucide-react'

interface GarmentCardProps {
  garment: Garment
  onDelete?: (garmentId: string) => void
  showActions?: boolean
}

export function GarmentCard({ garment, onDelete, showActions = true }: GarmentCardProps) {
  const categoryColors: Record<string, string> = {
    't-shirt': 'bg-blue-100 text-blue-800',
    'jeans': 'bg-indigo-100 text-indigo-800',
    'dress': 'bg-pink-100 text-pink-800',
    'shirt': 'bg-gray-100 text-gray-800',
    'pants': 'bg-green-100 text-green-800',
    'shorts': 'bg-yellow-100 text-yellow-800',
    'jacket': 'bg-purple-100 text-purple-800',
    'sweater': 'bg-orange-100 text-orange-800',
    'skirt': 'bg-red-100 text-red-800',
    'shoes': 'bg-brown-100 text-brown-800',
    'accessories': 'bg-teal-100 text-teal-800',
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        {garment.image_url ? (
          <Image
            src={garment.image_url}
            alt={garment.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Shirt className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Source indicator */}
        {garment.source_type === 'url' && garment.source_url && (
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
              onClick={() => window.open(garment.source_url!, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <Badge 
            variant="secondary" 
            className={`${categoryColors[garment.category] || 'bg-gray-100 text-gray-800'} text-xs`}
          >
            {garment.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 truncate">{garment.name}</h3>
            <p className="text-sm text-gray-500">
              Added {new Date(garment.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Measurements display */}
          {garment.measurements && (
            <div className="text-xs text-gray-600 space-y-1">
              {Object.entries(garment.measurements)
                .filter(([key]) => key !== 'unit')
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span>{value} {garment.measurements?.unit}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Link href={`/dashboard/tryon/${garment.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  Try On
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(garment.id)}
                  className="px-3"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
