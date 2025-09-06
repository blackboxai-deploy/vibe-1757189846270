'use client'

import { useState } from 'react'
import { VideoGenerator } from '@/components/VideoGenerator'
import { GenerationQueue } from '@/components/GenerationQueue'
import { GenerationHistory } from '@/components/GenerationHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const [activeGenerations, setActiveGenerations] = useState<any[]>([])
  const [generationHistory, setGenerationHistory] = useState<any[]>([])

  const handleNewGeneration = (generation: any) => {
    setActiveGenerations(prev => [...prev, generation])
  }

  const handleGenerationComplete = (completedGeneration: any) => {
    setActiveGenerations(prev => 
      prev.filter(gen => gen.id !== completedGeneration.id)
    )
    setGenerationHistory(prev => [completedGeneration, ...prev])
  }

  const handleGenerationError = (failedGeneration: any) => {
    setActiveGenerations(prev => 
      prev.filter(gen => gen.id !== failedGeneration.id)
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Create Stunning Videos
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Transform your ideas into professional videos with AI
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            ✨ Powered by Veo-3
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            🚀 High Quality
          </Badge>
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            ⚡ Fast Generation
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-6">
        <div className="flex items-center justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="generate" className="text-sm">Generate</TabsTrigger>
            <TabsTrigger value="queue" className="text-sm">
              Queue 
              {activeGenerations.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeGenerations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              History
              {generationHistory.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {generationHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Generation Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🎬</span>
                <span>Video Generation Studio</span>
              </CardTitle>
              <CardDescription>
                Describe your video idea and watch it come to life with cutting-edge AI technology.
                Generate videos up to 30 seconds with customizable settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoGenerator 
                onNewGeneration={handleNewGeneration}
                onGenerationComplete={handleGenerationComplete}
                onGenerationError={handleGenerationError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">⏳</span>
                <span>Generation Queue</span>
              </CardTitle>
              <CardDescription>
                Track the progress of your video generations in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerationQueue 
                generations={activeGenerations}
                onGenerationComplete={handleGenerationComplete}
                onGenerationError={handleGenerationError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📚</span>
                <span>Generation History</span>
              </CardTitle>
              <CardDescription>
                Browse and manage your previously generated videos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerationHistory 
                history={generationHistory}
                onClearHistory={() => setGenerationHistory([])}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {(activeGenerations.length > 0 || generationHistory.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎥</span>
                <div>
                  <p className="text-2xl font-bold">{generationHistory.length}</p>
                  <p className="text-sm text-muted-foreground">Videos Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-2xl font-bold">{activeGenerations.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="text-2xl font-bold">Veo-3</p>
                  <p className="text-sm text-muted-foreground">AI Model</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}