interface VideoGenerationRequest {
  prompt: string
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  style: string
  quality: 'standard' | 'high'
}

interface VideoGenerationResponse {
  success: boolean
  videoUrl?: string
  error?: string
  taskId?: string
  status?: 'processing' | 'completed' | 'failed'
  estimatedTime?: number
}

export class VideoGenerationAPI {
  private static instance: VideoGenerationAPI
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  static getInstance(): VideoGenerationAPI {
    if (!VideoGenerationAPI.instance) {
      VideoGenerationAPI.instance = new VideoGenerationAPI()
    }
    return VideoGenerationAPI.instance
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: VideoGenerationResponse = await response.json()
      return result
    } catch (error) {
      console.error('Video generation API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'failed'
      }
    }
  }

  async checkStatus(taskId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-video/status?taskId=${taskId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: VideoGenerationResponse = await response.json()
      return result
    } catch (error) {
      console.error('Status check API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'failed'
      }
    }
  }

  async getHealthStatus(): Promise<{
    status: string
    service: string
    timestamp: string
    models: string[]
    supportedFormats: string[]
    maxDuration: number
    maxPromptLength: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-video`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Health check API error:', error)
      throw error
    }
  }
}

export const videoAPI = VideoGenerationAPI.getInstance()

// Helper functions for video generation
export const validateVideoRequest = (request: VideoGenerationRequest): string | null => {
  if (!request.prompt || request.prompt.trim().length === 0) {
    return 'Prompt is required'
  }

  if (request.prompt.length > 1000) {
    return 'Prompt must be less than 1000 characters'
  }

  const validDurations = [5, 10, 15, 30]
  if (!validDurations.includes(request.duration)) {
    return 'Duration must be 5, 10, 15, or 30 seconds'
  }

  const validAspectRatios = ['16:9', '9:16', '1:1']
  if (!validAspectRatios.includes(request.aspectRatio)) {
    return 'Invalid aspect ratio'
  }

  return null
}

export const estimateProcessingTime = (duration: number, quality: string): number => {
  let baseTime = duration * 10 // 10 seconds of processing per second of video
  
  if (quality === 'high') {
    baseTime *= 1.5 // High quality takes 50% longer
  }
  
  return Math.max(baseTime, 30) // Minimum 30 seconds
}

export const createEnhancedPrompt = (request: VideoGenerationRequest): string => {
  const { prompt, duration, aspectRatio, style, quality } = request
  
  let enhancedPrompt = `Generate a ${duration}-second video`
  
  // Add aspect ratio specification
  if (aspectRatio === '16:9') {
    enhancedPrompt += ' in widescreen format (16:9)'
  } else if (aspectRatio === '9:16') {
    enhancedPrompt += ' in portrait format (9:16)'
  } else {
    enhancedPrompt += ' in square format (1:1)'
  }
  
  // Add quality specification
  if (quality === 'high') {
    enhancedPrompt += ', high quality, 4K resolution'
  }
  
  // Add style specifications
  if (style && style !== 'default') {
    enhancedPrompt += `, ${style.toLowerCase()} style`
  }
  
  // Add the main prompt
  enhancedPrompt += `: ${prompt}`
  
  // Add technical requirements
  enhancedPrompt += '. Ensure smooth motion, clear visuals, and professional quality.'
  
  return enhancedPrompt
}

// Storage helpers for managing generation history
export const saveGenerationToHistory = (generation: any): void => {
  try {
    const history = getGenerationHistory()
    const updatedHistory = [generation, ...history.slice(0, 49)] // Keep last 50 generations
    localStorage.setItem('video-generation-history', JSON.stringify(updatedHistory))
  } catch (error) {
    console.error('Failed to save generation to history:', error)
  }
}

export const getGenerationHistory = (): any[] => {
  try {
    const history = localStorage.getItem('video-generation-history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Failed to load generation history:', error)
    return []
  }
}

export const clearGenerationHistory = (): void => {
  try {
    localStorage.removeItem('video-generation-history')
  } catch (error) {
    console.error('Failed to clear generation history:', error)
  }
}

export const exportGenerationHistory = (): string => {
  const history = getGenerationHistory()
  return JSON.stringify(history, null, 2)
}

export const importGenerationHistory = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) {
      localStorage.setItem('video-generation-history', data)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to import generation history:', error)
    return false
  }
}