'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { VideoPreview } from './VideoPreview'

interface Generation {
  id: string
  prompt: string
  config: {
    duration: number
    aspectRatio: string
    style: string
    quality: string
  }
  status: 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  videoUrl?: string
  error?: string
}

interface GenerationHistoryProps {
  history: Generation[]
  onClearHistory: () => void
}

export function GenerationHistory({ history, onClearHistory }: GenerationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest')
  const [filterBy, setFilterBy] = useState<'all' | 'completed' | 'failed'>('all')

  const filteredAndSortedHistory = history
    .filter(gen => {
      const matchesSearch = gen.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterBy === 'all' || gen.status === filterBy
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'duration':
          return b.config.duration - a.config.duration
        default:
          return 0
      }
    })

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async (generation: Generation) => {
    if (!generation.videoUrl) return

    try {
      const response = await fetch(generation.videoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `video-${generation.id}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
      toast.success('Video downloaded!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download video')
    }
  }

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast.success('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Failed to copy prompt')
    }
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-medium mb-2">No Generation History</h3>
        <p className="text-muted-foreground">
          Your completed video generations will appear here for easy access and management.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Generation History?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your generation history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearHistory}>
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedHistory.length} of {history.length} videos
        </span>
        <div className="flex items-center space-x-4">
          <span>✅ {history.filter(h => h.status === 'completed').length} completed</span>
          <span>❌ {history.filter(h => h.status === 'failed').length} failed</span>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedHistory.map((generation) => (
          <Card key={generation.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium line-clamp-1">
                  Video #{generation.id.slice(-6)}
                </CardTitle>
                <Badge 
                  className={
                    generation.status === 'completed' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }
                >
                  {generation.status === 'completed' ? '✅' : '❌'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Video Thumbnail/Preview */}
              {generation.status === 'completed' && generation.videoUrl ? (
                <VideoPreview
                  videoUrl={generation.videoUrl}
                  title={`Video #${generation.id.slice(-6)}`}
                  prompt={generation.prompt}
                  config={generation.config}
                >
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <img 
                      src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8d050c45-1c24-4f6b-9df4-b5c19d301340.png"
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <span className="text-xl">▶️</span>
                      </div>
                    </div>
                  </div>
                </VideoPreview>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <span className="text-4xl opacity-50">❌</span>
                </div>
              )}

              {/* Prompt */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {generation.prompt}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyPrompt(generation.prompt)}
                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy Prompt
                </Button>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Duration</span>
                  <Badge variant="outline" className="text-xs">{generation.config.duration}s</Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Format</span>
                  <Badge variant="outline" className="text-xs">{generation.config.aspectRatio}</Badge>
                </div>
              </div>

              {/* Error Message */}
              {generation.status === 'failed' && generation.error && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border">
                  {generation.error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {generation.status === 'completed' && generation.videoUrl && (
                  <>
                    <VideoPreview
                      videoUrl={generation.videoUrl}
                      title={`Video #${generation.id.slice(-6)}`}
                      prompt={generation.prompt}
                      config={generation.config}
                    >
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <span className="mr-1">👁️</span>
                        View
                      </Button>
                    </VideoPreview>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(generation)}
                      className="flex-1 text-xs"
                    >
                      <span className="mr-1">⬇️</span>
                      Download
                    </Button>
                  </>
                )}
              </div>

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {formatDate(generation.createdAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedHistory.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">No Videos Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  )
}