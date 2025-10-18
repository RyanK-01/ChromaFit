'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FitScore, FitExplanation } from '@/types'
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface FitScoreDisplayProps {
  fitScore: FitScore
  className?: string
}

export function FitScoreDisplay({ fitScore, className = '' }: FitScoreDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const score = Math.round(fitScore.score * 100)
  const explanation = fitScore.explanation

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Fit'
    if (score >= 60) return 'Good Fit'
    return 'Poor Fit'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Fit Analysis</CardTitle>
            <CardDescription>
              AI-powered fit assessment for this garment
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getScoreIcon(score)}
            <Badge className={`${getScoreBgColor(score)} ${getScoreColor(score)} border-0`}>
              {getScoreLabel(score)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}%
          </div>
          <Progress value={score} className="w-full h-2" />
          <p className="text-sm text-gray-600 mt-2">
            Overall fit compatibility
          </p>
        </div>

        {/* Expandable Details */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium">View Detailed Analysis</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {/* Fit Analysis */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fit
                </h4>
                <p className="text-blue-800 text-sm">{explanation.fit}</p>
              </div>

              {/* Style Analysis */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Style
                </h4>
                <p className="text-purple-800 text-sm">{explanation.style}</p>
              </div>

              {/* Comfort Analysis */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Comfort
                </h4>
                <p className="text-green-800 text-sm">{explanation.comfort}</p>
              </div>
            </div>
          )}
        </div>

        {/* Fit Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">Fit</div>
            <div className="text-sm text-gray-600">Body shape compatibility</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">Style</div>
            <div className="text-sm text-gray-600">Fashion coordination</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">Comfort</div>
            <div className="text-sm text-gray-600">Wearability factors</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
