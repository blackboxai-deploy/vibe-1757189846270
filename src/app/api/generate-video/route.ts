import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 900 // 15 minutes for video generation

interface VideoGenerationRequest {
  prompt: string
  duration: number // 5, 10, 15, or 30 seconds
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

export async function POST(request: NextRequest): Promise<NextResponse<VideoGenerationResponse>> {
  try {
    const body: VideoGenerationRequest = await request.json()
    
    // Validate the request
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (body.prompt.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Prompt must be less than 1000 characters' },
        { status: 400 }
      )
    }

    // Validate duration
    const validDurations = [5, 10, 15, 30]
    if (!validDurations.includes(body.duration)) {
      return NextResponse.json(
        { success: false, error: 'Duration must be 5, 10, 15, or 30 seconds' },
        { status: 400 }
      )
    }

    // Validate aspect ratio
    const validAspectRatios = ['16:9', '9:16', '1:1']
    if (!validAspectRatios.includes(body.aspectRatio)) {
      return NextResponse.json(
        { success: false, error: 'Invalid aspect ratio' },
        { status: 400 }
      )
    }

    // Create enhanced prompt with technical specifications
    const enhancedPrompt = createEnhancedPrompt(body)

    // Call the video generation API using Replicate's Veo-3 model
    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_SNXXKIIxqHzWlo',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'replicate/google/veo-3',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Video generation API error:', errorText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to generate video: ${response.status} ${response.statusText}`,
          status: 'failed'
        },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    // Check if the response contains a video URL or if it's still processing
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content
      
      // Try to extract video URL from the response
      const videoUrlMatch = content.match(/https?:\/\/[^\s]+\.mp4/)
      
      if (videoUrlMatch) {
        // Video generation completed successfully
        return NextResponse.json({
          success: true,
          videoUrl: videoUrlMatch[0],
          status: 'completed'
        })
      } else {
        // Check if it's a processing status
        if (content.includes('processing') || content.includes('generating')) {
          return NextResponse.json({
            success: true,
            status: 'processing',
            estimatedTime: estimateProcessingTime(body.duration, body.quality),
            taskId: generateTaskId()
          })
        } else {
          // Return the content as video URL (API might return direct URL)
          return NextResponse.json({
            success: true,
            videoUrl: content.trim(),
            status: 'completed'
          })
        }
      }
    }

    // If no valid response structure, return error
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid response from video generation service',
        status: 'failed'
      },
      { status: 500 }
    )

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 'failed'
      },
      { status: 500 }
    )
  }
}

function createEnhancedPrompt(request: VideoGenerationRequest): string {
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

function estimateProcessingTime(duration: number, quality: string): number {
  // Base time in seconds for processing
  let baseTime = duration * 10 // 10 seconds of processing per second of video
  
  if (quality === 'high') {
    baseTime *= 1.5 // High quality takes 50% longer
  }
  
  return Math.max(baseTime, 30) // Minimum 30 seconds
}

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ 
    status: 'healthy',
    service: 'video-generation',
    timestamp: new Date().toISOString(),
    models: ['replicate/google/veo-3'],
    supportedFormats: ['16:9', '9:16', '1:1'],
    maxDuration: 30,
    maxPromptLength: 1000
  })
}