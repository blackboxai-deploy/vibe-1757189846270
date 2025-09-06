'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface Generation {
  id: string
  prompt: string
  config: {
    duration: number
    aspectRatio: string
    style: string
    quality: string
  }
  status: 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  completedAt?: string
  videoUrl?: string
  error?: string
}

interface GenerationQueueProps {
  generations: Generation[]
  onGenerationComplete: (generation: Generation) => void
  onGenerationError: (generation: Generation) => void
}

export function GenerationQueue({ 
  generations, 
  onGenerationComplete: _, 
  onGenerationError 
}: GenerationQueueProps) {
  const [localGenerations, setLocalGenerations] = useState<Generation[]>(generations)

  useEffect(() => {
    setLocalGenerations(generations)
  }, [generations])

  useEffect(() => {
    // Simulate progress updates for processing generations
    const interval = setInterval(() => {
      setLocalGenerations(prev => 
        prev.map(gen => {
          if (gen.status === 'processing' && gen.progress < 90) {
            const increment = Math.random() * 10 + 5 // 5-15% increment
            const newProgress = Math.min(gen.progress + increment, 90)
            return { ...gen, progress: newProgress }
          }
          return gen
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleCancelGeneration = (generationId: string) => {
    const generation = localGenerations.find(g => g.id === generationId)
    if (generation) {
      const cancelledGeneration = {
        ...generation,
        status: 'failed' as const,
        error: 'Cancelled by user',
        completedAt: new Date().toISOString()
      }
      onGenerationError(cancelledGeneration)
      toast.info('Generation cancelled')
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return '⏳'
      case 'completed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '⚪'
    }
  }

  if (localGenerations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-lg font-medium mb-2">No Active Generations</h3>
        <p className="text-muted-foreground">
          Your video generations will appear here when you start creating them.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {localGenerations.map((generation, index) => (
        <Card key={generation.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(generation.status)}</span>
                <span>Generation #{localGenerations.length - index}</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(generation.status)}>
                  {generation.status === 'processing' ? 'Processing' : 
                   generation.status === 'completed' ? 'Completed' : 
                   'Failed'}
                </Badge>
                
                {generation.status === 'processing' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelGeneration(generation.id)}
                    className="h-7 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Prompt */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Prompt</div>
              <p className="text-sm bg-muted/30 p-3 rounded-md border-l-2 border-primary/20">
                {generation.prompt}
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Duration</div>
                <Badge variant="outline">{generation.config.duration}s</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Format</div>
                <Badge variant="outline">{generation.config.aspectRatio}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Style</div>
                <Badge variant="outline" className="capitalize">{generation.config.style}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Quality</div>
                <Badge variant="outline" className="capitalize">{generation.config.quality}</Badge>
              </div>
            </div>

            <Separator />

            {/* Progress */}
            {generation.status === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(generation.progress)}%</span>
                </div>
                <Progress value={generation.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Estimated time remaining: {Math.ceil((100 - generation.progress) / 10)} minutes
                </div>
              </div>
            )}

            {/* Error */}
            {generation.status === 'failed' && generation.error && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-destructive">Error</div>
                <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20">
                  {generation.error}
                </p>
              </div>
            )}

            {/* Completed */}
            {generation.status === 'completed' && generation.videoUrl && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-600">Video Generated Successfully!</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generation.videoUrl, '_blank')}
                  className="w-full"
                >
                  <span className="mr-2">🎥</span>
                  View Video
                </Button>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Started {formatTimeAgo(generation.createdAt)}</span>
              {generation.completedAt && (
                <span>
                  {generation.status === 'completed' ? 'Completed' : 'Failed'} {formatTimeAgo(generation.completedAt)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Queue Statistics */}
      {localGenerations.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {localGenerations.filter(g => g.status === 'processing').length}
                </div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {localGenerations.filter(g => g.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {localGenerations.filter(g => g.status === 'failed').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}