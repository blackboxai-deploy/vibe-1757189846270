'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface GenerationConfig {
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  style: string
  quality: 'standard' | 'high'
}

interface GenerationSettingsProps {
  config: GenerationConfig
  onChange: (config: GenerationConfig) => void
  disabled?: boolean
}

export function GenerationSettings({ config, onChange, disabled = false }: GenerationSettingsProps) {
  const updateConfig = (updates: Partial<GenerationConfig>) => {
    onChange({ ...config, ...updates })
  }

  const durationOptions = [
    { value: 5, label: '5 seconds', description: 'Quick preview' },
    { value: 10, label: '10 seconds', description: 'Standard' },
    { value: 15, label: '15 seconds', description: 'Extended' },
    { value: 30, label: '30 seconds', description: 'Long form' }
  ]

  const aspectRatioOptions = [
    { value: '16:9', label: 'Landscape (16:9)', icon: '📺', description: 'Perfect for YouTube, TV' },
    { value: '9:16', label: 'Portrait (9:16)', icon: '📱', description: 'Great for TikTok, Instagram Stories' },
    { value: '1:1', label: 'Square (1:1)', icon: '⬜', description: 'Ideal for Instagram posts' }
  ] as const

  const styleOptions = [
    { value: 'cinematic', label: 'Cinematic', description: 'Film-like quality with dramatic lighting' },
    { value: 'realistic', label: 'Realistic', description: 'Natural, true-to-life appearance' },
    { value: 'animation', label: 'Animation', description: '3D animated style' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and stylized visuals' },
    { value: 'documentary', label: 'Documentary', description: 'Clean, professional look' },
    { value: 'abstract', label: 'Abstract', description: 'Experimental and creative' }
  ]

  const qualityOptions = [
    { value: 'standard', label: 'Standard Quality', description: 'Faster generation' },
    { value: 'high', label: 'High Quality', description: 'Best visual quality, takes longer' }
  ] as const

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Duration Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>⏱️</span>
            <span>Duration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={config.duration.toString()}
            onValueChange={(value) => updateConfig({ duration: parseInt(value) })}
            disabled={disabled}
            className="space-y-3"
          >
            {durationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value.toString()} id={`duration-${option.value}`} />
                <div className="flex-1">
                  <Label 
                    htmlFor={`duration-${option.value}`} 
                    className="text-sm font-medium cursor-pointer flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {option.description}
                    </Badge>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Aspect Ratio Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>📐</span>
            <span>Format</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={config.aspectRatio}
            onValueChange={(value) => updateConfig({ aspectRatio: value as '16:9' | '9:16' | '1:1' })}
            disabled={disabled}
            className="space-y-3"
          >
            {aspectRatioOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={`aspect-${option.value}`} />
                <div className="flex-1">
                  <Label 
                    htmlFor={`aspect-${option.value}`} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Style Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>🎨</span>
            <span>Style</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={config.style}
            onValueChange={(value) => updateConfig({ style: value })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a style" />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div>
                    <div className="font-medium">{style.label}</div>
                    <div className="text-xs text-muted-foreground">{style.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quality Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>⚡</span>
            <span>Quality</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={config.quality}
            onValueChange={(value) => updateConfig({ quality: value as 'standard' | 'high' })}
            disabled={disabled}
            className="space-y-3"
          >
            {qualityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={`quality-${option.value}`} />
                <div className="flex-1">
                  <Label 
                    htmlFor={`quality-${option.value}`} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {option.value === 'high' && (
                        <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          Slower
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <div className="lg:col-span-2">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-medium">{config.duration}s</div>
                <div className="text-muted-foreground text-xs">Duration</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="font-medium">{config.aspectRatio}</div>
                <div className="text-muted-foreground text-xs">Format</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="font-medium capitalize">{config.style}</div>
                <div className="text-muted-foreground text-xs">Style</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="font-medium capitalize">{config.quality}</div>
                <div className="text-muted-foreground text-xs">Quality</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}