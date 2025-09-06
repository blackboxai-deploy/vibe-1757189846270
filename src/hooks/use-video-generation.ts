'use client'

import { useState, useEffect, useCallback } from 'react'
import { videoAPI, saveGenerationToHistory, getGenerationHistory } from '@/lib/video-api'

interface GenerationConfig {
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  style: string
  quality: 'standard' | 'high'
}

interface Generation {
  id: string
  prompt: string
  config: GenerationConfig
  status: 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  videoUrl?: string
  error?: string
  progress: number
  taskId?: string
}

export interface UseVideoGenerationReturn {
  // State
  activeGenerations: Generation[]
  generationHistory: Generation[]
  isGenerating: boolean
  
  // Actions
  generateVideo: (prompt: string, config: GenerationConfig) => Promise<boolean>
  cancelGeneration: (id: string) => void
  retryGeneration: (generation: Generation) => Promise<boolean>
  clearHistory: () => void
  
  // Helpers
  getGenerationById: (id: string) => Generation | undefined
  getActiveCount: () => number
  getCompletedCount: () => number
  getFailedCount: () => number
}

export function useVideoGeneration(): UseVideoGenerationReturn {
  const [activeGenerations, setActiveGenerations] = useState<Generation[]>([])
  const [generationHistory, setGenerationHistory] = useState<Generation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Load history on mount
  useEffect(() => {
    const history = getGenerationHistory()
    setGenerationHistory(history)
  }, [])

  // Progress simulation for active generations
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGenerations(prev => 
        prev.map(gen => {
          if (gen.status === 'processing' && gen.progress < 90) {
            const increment = Math.random() * 8 + 2 // 2-10% increment
            const newProgress = Math.min(gen.progress + increment, 90)
            return { ...gen, progress: newProgress }
          }
          return gen
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const generateUniqueId = (): string => {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const generateVideo = useCallback(async (
    prompt: string, 
    config: GenerationConfig
  ): Promise<boolean> => {
    const generation: Generation = {
      id: generateUniqueId(),
      prompt: prompt.trim(),
      config,
      status: 'processing',
      createdAt: new Date().toISOString(),
      progress: 0
    }

    // Add to active generations
    setActiveGenerations(prev => [...prev, generation])
    setIsGenerating(true)

    try {
      const response = await videoAPI.generateVideo({
        prompt: prompt.trim(),
        duration: config.duration,
        aspectRatio: config.aspectRatio,
        style: config.style,
        quality: config.quality
      })

      if (response.success) {
        if (response.status === 'completed' && response.videoUrl) {
          // Generation completed immediately
          const completedGeneration: Generation = {
            ...generation,
            status: 'completed',
            videoUrl: response.videoUrl,
            completedAt: new Date().toISOString(),
            progress: 100
          }

          // Move from active to history
          setActiveGenerations(prev => prev.filter(g => g.id !== generation.id))
          setGenerationHistory(prev => [completedGeneration, ...prev])
          saveGenerationToHistory(completedGeneration)
          
          return true
        } else if (response.status === 'processing') {
          // Update with task ID for polling
          setActiveGenerations(prev => 
            prev.map(g => 
              g.id === generation.id 
                ? { ...g, taskId: response.taskId, progress: 5 }
                : g
            )
          )
          
          // Start polling for completion
          pollForCompletion(generation.id, response.taskId)
          return true
        }
      }

      throw new Error(response.error || 'Generation failed')
    } catch (error) {
      const failedGeneration: Generation = {
        ...generation,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
        progress: 0
      }

      setActiveGenerations(prev => prev.filter(g => g.id !== generation.id))
      setGenerationHistory(prev => [failedGeneration, ...prev])
      saveGenerationToHistory(failedGeneration)
      
      return false
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const pollForCompletion = useCallback(async (generationId: string, _taskId?: string) => {
    // Simulate completion after 5-10 seconds for demo
    const delay = Math.random() * 5000 + 5000 // 5-10 seconds
    
    setTimeout(() => {
      setActiveGenerations(prev => {
        const generation = prev.find(g => g.id === generationId)
        if (!generation) return prev

        const completedGeneration: Generation = {
          ...generation,
          status: 'completed',
          videoUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/eb71a242-4475-492a-b448-b8cb1f9c56af.png',
          completedAt: new Date().toISOString(),
          progress: 100
        }

        setGenerationHistory(prevHistory => [completedGeneration, ...prevHistory])
        saveGenerationToHistory(completedGeneration)

        return prev.filter(g => g.id !== generationId)
      })
    }, delay)
  }, [])

  const cancelGeneration = useCallback((id: string) => {
    setActiveGenerations(prev => {
      const generation = prev.find(g => g.id === id)
      if (!generation) return prev

      const cancelledGeneration: Generation = {
        ...generation,
        status: 'failed',
        error: 'Cancelled by user',
        completedAt: new Date().toISOString()
      }

      setGenerationHistory(prevHistory => [cancelledGeneration, ...prevHistory])
      saveGenerationToHistory(cancelledGeneration)

      return prev.filter(g => g.id !== id)
    })
  }, [])

  const retryGeneration = useCallback(async (generation: Generation): Promise<boolean> => {
    return await generateVideo(generation.prompt, generation.config)
  }, [generateVideo])

  const clearHistory = useCallback(() => {
    setGenerationHistory([])
    // Clear from localStorage is handled by the utility function
    try {
      localStorage.removeItem('video-generation-history')
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }, [])

  const getGenerationById = useCallback((id: string): Generation | undefined => {
    return [...activeGenerations, ...generationHistory].find(g => g.id === id)
  }, [activeGenerations, generationHistory])

  const getActiveCount = useCallback((): number => {
    return activeGenerations.length
  }, [activeGenerations])

  const getCompletedCount = useCallback((): number => {
    return generationHistory.filter(g => g.status === 'completed').length
  }, [generationHistory])

  const getFailedCount = useCallback((): number => {
    return generationHistory.filter(g => g.status === 'failed').length
  }, [generationHistory])

  return {
    // State
    activeGenerations,
    generationHistory,
    isGenerating,
    
    // Actions
    generateVideo,
    cancelGeneration,
    retryGeneration,
    clearHistory,
    
    // Helpers
    getGenerationById,
    getActiveCount,
    getCompletedCount,
    getFailedCount
  }
}