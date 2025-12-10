'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Github, Star, Users, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function HeroSection() {
  const [stars, setStars] = useState<number | null>(null);
  
  useEffect(() => {
    // Fetch GitHub stars
    fetch('https://api.github.com/repos/betagors/yamajs')
      .then(res => res.json())
      .then(data => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="border-primary/30 bg-primary/10 text-primary font-medium px-4 py-1.5">
                Open-source · No VC · No lock-in
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-foreground">Backend APIs</span>
                <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  in 80 lines
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                YAML config + TypeScript handlers = Full CRUD API with auth, docs, and type-safe SDKs
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/70 transition-all"
              >
                <Link href="https://github.com/betagors/yamajs" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  Start building now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg border-2 border-primary/50 bg-background/50 text-foreground hover:bg-primary/10 hover:border-primary"
              >
                <Link href="#demo">
                  Watch demo (90s)
                </Link>
              </Button>
            </div>

            {/* Social proof badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {stars !== null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{stars.toLocaleString()}</span>
                  <span>stars</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">500+</span>
                <span>developers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-muted-foreground">Active development</span>
              </div>
            </div>
          </div>

          {/* Right: Animated Terminal Demo */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl" />
            <div className="relative rounded-xl border border-primary/30 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-2 text-xs font-medium text-primary">terminal</span>
                </div>
              </div>
              
              {/* Terminal Content */}
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-secondary">$</span>
                  <span className="text-foreground/80">npm create yama@latest</span>
                </div>
                <div className="text-primary">
                  ✓ Created new Yama project
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-secondary">$</span>
                  <span className="text-foreground/80">yama dev</span>
                </div>
                <div className="space-y-1 text-muted-foreground text-xs">
                  <div>🚀 Server running on http://localhost:4000</div>
                  <div>📚 Swagger UI: http://localhost:4000/docs</div>
                  <div>✨ Type-safe SDK generated</div>
                  <div className="flex items-center gap-2 text-secondary mt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                    <span>Ready in 847ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
