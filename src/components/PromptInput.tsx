'use client'

import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

export function PromptInput({ 
  value, 
  onChange, 
  placeholder = "Describe your video...",
  maxLength = 1000,
  disabled = false 
}: PromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = [
    {
      category: 'Nature',
      prompts: [
        'A serene mountain lake reflecting autumn colors with mist rising from the water',
        'Time-lapse of cherry blossoms blooming in a peaceful Japanese garden',
        'Dramatic ocean waves crashing against rugged coastal rocks during storm',
        'Golden hour sunlight filtering through dense forest canopy with dancing particles'
      ]
    },
    {
      category: 'Urban',
      prompts: [
        'Bustling city street at night with neon lights and reflections on wet pavement',
        'Modern skyline view with glass buildings reflecting sunset colors',
        'Time-lapse of traffic flowing through busy intersection with light trails',
        'Cozy coffee shop interior with warm lighting and steam rising from cups'
      ]
    },
    {
      category: 'Abstract',
      prompts: [
        'Flowing liquid metal with rainbow reflections morphing into geometric shapes',
        'Colorful paint drops splashing and mixing in slow motion macro view',
        'Geometric patterns expanding and contracting with vibrant gradient colors',
        'Particle systems creating complex formations with lighting effects'
      ]
    },
    {
      category: 'Cinematic',
      prompts: [
        'Epic space battle with starships and laser beams in deep space',
        'Medieval castle on a hill during thunderstorm with lightning flashes',
        'Futuristic laboratory with holographic displays and robotic arms',
        'Desert landscape with ancient ruins and sandstorm approaching'
      ]
    }
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    const allPrompts = suggestions.reduce((acc, cat) => [...acc, ...cat.prompts], [] as string[])
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev < allPrompts.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev > 0 ? prev - 1 : allPrompts.length - 1
        )
        break
      case 'Enter':
        if (focusedSuggestion >= 0) {
          e.preventDefault()
          onChange(allPrompts[focusedSuggestion])
          setShowSuggestions(false)
          setFocusedSuggestion(-1)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setFocusedSuggestion(-1)
        break
    }
  }

  const handleSuggestionClick = (prompt: string) => {
    onChange(prompt)
    setShowSuggestions(false)
    setFocusedSuggestion(-1)
    textareaRef.current?.focus()
  }

  const enhancePrompt = () => {
    if (value.trim()) {
      const enhancements = [
        'cinematic lighting',
        'high quality',
        '4K resolution',
        'professional cinematography',
        'smooth motion',
        'vibrant colors'
      ]
      
      const randomEnhancements = enhancements
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .join(', ')
      
      const enhanced = `${value.trim()}, ${randomEnhancements}`
      if (enhanced.length <= maxLength) {
        onChange(enhanced)
      }
    }
  }

  const clearPrompt = () => {
    onChange('')
    textareaRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => !value && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className="min-h-24 max-h-48 resize-y pr-24 text-base"
          rows={3}
        />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {value.trim() && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={enhancePrompt}
                disabled={disabled}
                className="h-6 px-2 text-xs bg-background/80 backdrop-blur-sm"
              >
                ✨ Enhance
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearPrompt}
                disabled={disabled}
                className="h-6 px-2 text-xs bg-background/80 backdrop-blur-sm"
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSuggestions(!showSuggestions)}
          disabled={disabled}
          className="text-xs"
        >
          {showSuggestions ? 'Hide' : 'Show'} Suggestions
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <span className={value.length > maxLength * 0.9 ? 'text-yellow-500' : ''}>
            {value.length}
          </span>
          <span className={value.length === maxLength ? 'text-red-500' : ''}>
            /{maxLength}
          </span>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <Card className="absolute z-10 w-full mt-1 max-h-96 overflow-y-auto border-border/50 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            {suggestions.map((category, categoryIndex) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {category.category}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  {category.prompts.map((prompt, promptIndex) => {
                    const globalIndex = suggestions
                      .slice(0, categoryIndex)
                      .reduce((acc, cat) => acc + cat.prompts.length, 0) + promptIndex
                    
                    return (
                      <button
                        key={promptIndex}
                        onClick={() => handleSuggestionClick(prompt)}
                        disabled={disabled}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          focusedSuggestion === globalIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {prompt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Use arrow keys to navigate, Enter to select, Esc to close
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}