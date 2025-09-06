'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

interface VideoPreviewProps {
  videoUrl: string
  title: string
  prompt: string
  config: {
    duration: number
    aspectRatio: string
    style: string
    quality: string
  }
  children: React.ReactNode
}

export function VideoPreview({ 
  videoUrl, 
  title, 
  prompt, 
  config, 
  children 
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [videoUrl])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (video.muted) {
      video.muted = false
      video.volume = volume
    } else {
      video.muted = true
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const downloadVideo = async () => {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-generated-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
      toast.success('Video downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download video')
    }
  }

  const shareVideo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this AI-generated video: ${prompt}`,
          url: videoUrl
        })
        toast.success('Video shared successfully!')
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(videoUrl)
        toast.success('Video URL copied to clipboard!')
      } catch (error) {
        console.error('Copy failed:', error)
        toast.error('Failed to share video')
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Video Player */}
          <div 
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden aspect-video"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-center space-y-2">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                  <p>Loading video...</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              playsInline
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                {/* Progress Bar */}
                <Slider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {volume === 0 ? '🔇' : '🔊'}
                    </Button>
                    
                    <div className="w-20">
                      <Slider
                        value={[volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <span className="text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? '🗗' : '🗖'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Information */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Prompt</h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  {prompt}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <Badge variant="outline">{config.duration}s</Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Format</span>
                  <Badge variant="outline">{config.aspectRatio}</Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Style</span>
                  <Badge variant="outline" className="capitalize">{config.style}</Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Quality</span>
                  <Badge variant="outline" className="capitalize">{config.quality}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadVideo} className="flex-1">
              <span className="mr-2">⬇️</span>
              Download
            </Button>
            <Button onClick={shareVideo} variant="outline" className="flex-1">
              <span className="mr-2">🔗</span>
              Share
            </Button>
            <Button
              onClick={() => window.open(videoUrl, '_blank')}
              variant="outline"
              className="flex-1"
            >
              <span className="mr-2">🎥</span>
              Open
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}