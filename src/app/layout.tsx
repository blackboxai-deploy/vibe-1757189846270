import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Video Generation Studio',
  description: 'Create stunning videos with AI-powered generation technology',
  keywords: ['AI', 'video generation', 'artificial intelligence', 'creative tools'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Video Studio
                      </h1>
                      <p className="text-xs text-muted-foreground">Powered by AI</p>
                    </div>
                  </div>
                  
                  <nav className="hidden md:flex items-center space-x-6">
                    <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Generate
                    </span>
                    <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      History
                    </span>
                    <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Settings
                    </span>
                  </nav>

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">U</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            
            <footer className="border-t border-border/40 mt-16">
              <div className="container mx-auto px-4 py-8">
                <div className="text-center text-sm text-muted-foreground">
                  <p>© 2024 AI Video Studio. Create amazing videos with artificial intelligence.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}