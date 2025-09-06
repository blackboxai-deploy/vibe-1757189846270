'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PromptInput } from './PromptInput'
import { GenerationSettings } from './GenerationSettings'

interface VideoGeneratorProps {
  onNewGeneration: (generation: any) => void
  onGenerationComplete: (generation: any) => void
  onGenerationError: (generation: any) => void
}

interface GenerationConfig {
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  style: string
  quality: 'standard' | 'high'
}

export function VideoGenerator({ 
  onNewGeneration, 
  onGenerationComplete, 
  onGenerationError 
}: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [config, setConfig] = useState<GenerationConfig>({
    duration: 10,
    aspectRatio: '16:9',
    style: 'cinematic',
    quality: 'standard'
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video description')
      return
    }

    if (prompt.length > 1000) {
      toast.error('Description must be less than 1000 characters')
      return
    }

    const generation = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: prompt.trim(),
      config,
      status: 'processing',
      createdAt: new Date().toISOString(),
      progress: 0
    }

    setIsGenerating(true)
    onNewGeneration(generation)
    
    toast.success('Video generation started!', {
      description: `Generating ${config.duration}s video in ${config.aspectRatio} format`
    })

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: config.duration,
          aspectRatio: config.aspectRatio,
          style: config.style,
          quality: config.quality
        })
      })

      const result = await response.json()

      if (result.success) {
        if (result.status === 'completed' && result.videoUrl) {
          // Generation completed immediately
          const completedGeneration = {
            ...generation,
            status: 'completed',
            videoUrl: result.videoUrl,
            completedAt: new Date().toISOString(),
            progress: 100
          }
          
          onGenerationComplete(completedGeneration)
          toast.success('Video generated successfully!', {
            description: 'Your video is ready for preview and download'
          })
        } else if (result.status === 'processing') {
          // Generation is still processing
          toast.info('Video is being processed', {
            description: `Estimated time: ${Math.ceil((result.estimatedTime || 60) / 60)} minutes`
          })
          
          // Start polling for completion (in a real app, you'd use websockets or polling)
          pollForCompletion(generation.id, result.taskId)
        }
      } else {
        throw new Error(result.error || 'Failed to generate video')
      }
    } catch (error) {
      console.error('Generation error:', error)
      const errorGeneration = {
        ...generation,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString()
      }
      
      onGenerationError(errorGeneration)
      toast.error('Failed to generate video', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const pollForCompletion = async (generationId: string, _taskId?: string) => {
    // In a real implementation, you would poll the API or use websockets
    // For demo purposes, we'll simulate completion after a delay
    setTimeout(() => {
      const completedGeneration = {
        id: generationId,
        prompt: prompt.trim(),
        config,
        status: 'completed',
        videoUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/89456a6b-66dd-4b55-8ed2-54af18d10554.png',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        progress: 100
      }
      
      onGenerationComplete(completedGeneration)
      toast.success('Video generated successfully!', {
        description: 'Your video is ready for preview and download'
      })
    }, 5000) // Simulate 5 second processing
  }

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  const promptSuggestions = [
    'A majestic eagle soaring through mountain peaks at golden hour',
    'Peaceful zen garden with flowing water and cherry blossoms',
    'Futuristic city skyline with flying cars and neon lights',
    'Ocean waves crashing against rocky cliffs during sunset',
    'Time-lapse of a flower blooming in spring meadow',
    'Abstract geometric shapes morphing with vibrant colors',
    'Cozy fireplace scene with books and warm lighting',
    'Space exploration with galaxies and shooting stars'
  ]

  return (
    <div className="space-y-6">
      {/* Prompt Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-base font-medium">
            Video Description
          </Label>
          <PromptInput 
            value={prompt}
            onChange={setPrompt}
            placeholder="Describe the video you want to create..."
            maxLength={1000}
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{prompt.length}/1000 characters</span>
            <span>Be descriptive for best results</span>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Suggestions</Label>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.slice(0, 4).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePromptSuggestion(suggestion)}
                disabled={isGenerating}
                className="text-xs h-8 px-3"
              >
                {suggestion.slice(0, 40)}...
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Generation Settings */}
      <GenerationSettings 
        config={config}
        onChange={setConfig}
        disabled={isGenerating}
      />

      {/* Generation Summary */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Generation Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <Badge variant="secondary" className="ml-2">{config.duration}s</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Format:</span>
              <Badge variant="secondary" className="ml-2">{config.aspectRatio}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Style:</span>
              <Badge variant="secondary" className="ml-2 capitalize">{config.style}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Quality:</span>
              <Badge variant="secondary" className="ml-2 capitalize">{config.quality}</Badge>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Estimated processing time: {Math.ceil(config.duration * (config.quality === 'high' ? 1.5 : 1))} seconds</p>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button 
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full h-12 text-base font-medium"
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Generating Video...
          </>
        ) : (
          <>
            <span className="mr-2">🎬</span>
            Generate Video
          </>
        )}
      </Button>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>✨ Powered by Veo-3 AI model for high-quality video generation</p>
        <p>🚀 Processing typically takes 30 seconds to 2 minutes</p>
      </div>
    </div>
  )
}