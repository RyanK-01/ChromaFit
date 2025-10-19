'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
interface UserProfile {
  height: number
  weight: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile>({
    height: 170,
    weight: 70
  })

  const handleNext = async () => {
      // Save profile data
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        // Try to refresh schema cache first
        await supabase.schema('public')
        
        const updatePayload = {
          height: profile.height,
          weight: profile.weight,
          onboarding_completed: true,
        }

        // Create or update the profile
        const res = await supabase
          .from('profiles')
          .upsert({ 
            ...updatePayload,
            user_id: user.id,
          })
          .select()

        if (res.error) {
          // Log the error object and the full response so we can see status/details/hint
          console.error(`Error saving profile: ${JSON.stringify(res.error)}`)
          console.error(`Full update response: ${JSON.stringify(res)}`)
          return
        }
      } catch (err) {
        console.error('Unexpected error saving profile:', err)
        return
      }

      router.push('/dashboard')
  }

  const formatHeight = (cm: number) => {
    const meters = cm / 100
    return meters.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5EFE6] to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-display text-center">
            Your measurements
          </h1>
          <p className="text-neutral-600 text-center mt-2">
            This helps us recommend the perfect fit
          </p>
        </div>

        <div className="space-y-8">
              {/* Height Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-700">Height</label>
                  <span className="text-lg font-medium text-[#4A3728]">{formatHeight(profile.height)}m</span>
                </div>
                <Slider
                  value={[profile.height]}
                  onValueChange={(value) => setProfile({ ...profile, height: value[0] })}
                  min={140}
                  max={200}
                  step={1}
                  className="py-4"
                />
              </div>

              {/* Weight Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-700">Weight</label>
                  <span className="text-lg font-medium text-[#4A3728]">{profile.weight}kg</span>
                </div>
                <Slider
                  value={[profile.weight]}
                  onValueChange={(value) => setProfile({ ...profile, weight: value[0] })}
                  min={40}
                  max={120}
                  step={1}
                  className="py-4"
                />
              </div>
            </div>

        <div className="mt-8">
          <Button
            onClick={handleNext}
            className="w-full h-12 bg-[#8B7355] hover:bg-[#4A3728] text-white rounded-full"
          >
            Complete Profile
          </Button>
        </div>
      </Card>
    </div>
  )
}
