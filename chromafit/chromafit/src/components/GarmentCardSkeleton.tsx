import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function GarmentCardSkeleton() {
  return (
    <Card>
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
