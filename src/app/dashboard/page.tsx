'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAvatarModel } from '@/hooks/useAvatarModel'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar3D } from '@/components/Avatar3D'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shirt, Camera, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  const { user } = useAuth()
  const { avatarReady, isLoading: avatarLoading } = useAvatarModel(user?.id)
  const supabase = createClient()

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const [garmentsResult, tryonsResult] = await Promise.all([
        supabase.from('garments').select('id').eq('user_id', user.id),
        supabase.from('tryons').select('id').eq('user_id', user.id)
      ])

      return {
        garmentCount: garmentsResult.data?.length || 0,
        tryonCount: tryonsResult.data?.length || 0
      }
    },
    enabled: !!user?.id
  })

  // Fetch recent try-ons
  const { data: recentTryons } = useQuery({
    queryKey: ['recent-tryons', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data } = await supabase
        .from('tryons')
        .select(`
          *,
          garments (
            id,
            name,
            category,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4)

      return data || []
    },
    enabled: !!user?.id
  })

  if (avatarLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to explore your virtual wardrobe and discover new styles?
            </p>
          </div>
          {avatarReady && (
            <div className="hidden md:block w-32 h-32 rounded-lg overflow-hidden">
              <Avatar3D className="w-full h-full" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/wardrobe">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wardrobe</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.garmentCount || 0}</div>
              <p className="text-xs text-muted-foreground">items in your wardrobe</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tryon">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Try-Ons</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.tryonCount || 0}</div>
              <p className="text-xs text-muted-foreground">virtual try-ons completed</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/explore">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Explore</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">discover new styles</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">average fit accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Avatar Setup Prompt */}
      {!avatarReady && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Complete Your Avatar Setup</CardTitle>
            <CardDescription className="text-blue-700">
              Upload a photo to create your 3D avatar and unlock personalized fit recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onboarding">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Avatar
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Try-Ons */}
      {recentTryons && recentTryons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Try-Ons</h2>
            <Link href="/dashboard/tryon">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTryons.map((tryon: any) => (
              <Card key={tryon.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  {tryon.result_image_url ? (
                    <Image
                      src={tryon.result_image_url}
                      alt="Try-on result"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tryon.garments?.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {tryon.garments?.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {Math.round(tryon.fit_score * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Here's how to make the most of ChromaFit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Add to Wardrobe</h3>
                <p className="text-sm text-gray-600">Upload photos or paste URLs to add garments to your virtual wardrobe.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Try It On</h3>
                <p className="text-sm text-gray-600">Use virtual try-on to see how garments look on your 3D avatar.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Explore & Compare</h3>
                <p className="text-sm text-gray-600">Discover new styles and compare your outfits with others.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
