import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function OutfitCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        {/* Outfit Images Grid */}
        <div className="grid grid-cols-2 gap-1 aspect-square">
          <Skeleton className="w-full h-full" />
          <Skeleton className="w-full h-full" />
          <Skeleton className="w-full h-full" />
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Outfit name */}
          <div>
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Categories */}
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-14" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-6" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
