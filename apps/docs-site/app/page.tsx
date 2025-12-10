import Link from 'next/link';
import { ArrowRight, Github, Play, Hammer } from 'lucide-react';
import { Button } from './components/ui/button';
import { HeroSection } from './components/sections/hero';
import { CodeDemoSection } from './components/sections/code-demo';
import { ComparisonTable } from './components/sections/comparison';
import { SocialProof } from './components/sections/social-proof';
import { ExamplesCarousel } from './components/sections/examples';
import { HowItWorks } from './components/sections/how-it-works';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Under Construction Banner */}
      <div className="sticky top-0 z-[100] border-b border-primary/30 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base flex-1">
              <Hammer className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-center font-medium">
                <span className="text-primary">🚧 Under Active Development</span>
                <span className="hidden sm:inline text-muted-foreground ml-2">— Stay tuned for updates!</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="https://github.com/betagors/yamajs" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="GitHub">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="https://discord.gg/XwDmddq4Pz" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-xs font-semibold" title="Discord">
                Discord
              </Link>
              <Link href="https://x.com/yamajs_org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm" title="X (Twitter)">
                𝕏
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects - Tron-style neon grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* One-sentence positioning */}
        <div className="border-y border-primary/20 bg-primary/5 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-lg md:text-xl text-foreground/90 font-medium">
              The backend framework that removes <span className="text-primary font-bold">90% of the code</span> while keeping <span className="text-secondary font-bold">100% of the power</span>
            </p>
          </div>
        </div>

        {/* Live Code Demo Section */}
        <CodeDemoSection />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* How It Works */}
        <HowItWorks />

        {/* Examples Carousel */}
        <ExamplesCarousel />

        {/* Social Proof / Wall of Love */}
        <SocialProof />

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 py-24">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-foreground md:text-5xl mb-6">
              Start building in <span className="text-primary">under 15 seconds</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              One command. Zero configuration. Full-stack type safety from day one.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-10 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/70 transition-all"
              >
                <Link href="https://github.com/betagors/yamajs" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  Start building now →
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="h-14 px-10 text-lg border-2 border-primary/50 bg-background/50 text-foreground hover:bg-primary/10 hover:border-primary"
              >
                <Link href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 90-second demo
                </Link>
              </Button>
            </div>

            <div className="inline-flex items-center gap-3 rounded-lg bg-card border border-primary/30 px-6 py-4 font-mono text-primary backdrop-blur-sm">
              <span className="text-muted-foreground">$</span>
              <span>npm create yama@latest</span>
              <button 
                className="ml-2 rounded p-1.5 hover:bg-primary/20 transition-colors"
                aria-label="Copy command"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-primary/20 bg-background/50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Link href="https://github.com/betagors/yamajs" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="https://discord.gg/XwDmddq4Pz" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Discord
                </Link>
                <Link href="https://x.com/yamajs_org" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  𝕏
                </Link>
              </div>
              <p className="text-sm text-muted-foreground text-center md:text-right">
                Made by one indie developer · <span className="text-secondary">100% open source</span> · No VC · No bullshit
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

