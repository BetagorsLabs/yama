'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const examples = [
  {
    title: 'Todo API',
    description: 'Full CRUD with auth, PostgreSQL, and real-time updates',
    liveUrl: 'https://todo-api-yama.fly.dev',
    githubUrl: 'https://github.com/betagors/yamajs/tree/main/examples/todo-api',
    tech: ['PostgreSQL', 'JWT Auth', 'WebSockets'],
    lines: 75,
    image: '/examples/todo.png',
  },
  {
    title: 'SaaS Boilerplate',
    description: 'Multi-tenant app with Stripe, emails, and admin panel',
    liveUrl: 'https://saas-yama.fly.dev',
    githubUrl: 'https://github.com/betagors/yama-saas-template',
    tech: ['Stripe', 'SMTP', 'Multi-tenant'],
    lines: 120,
    image: '/examples/saas.png',
  },
  {
    title: 'AI Wrapper API',
    description: 'OpenAI proxy with rate limiting and usage tracking',
    liveUrl: 'https://ai-api-yama.fly.dev',
    githubUrl: 'https://github.com/betagors/yama-ai-template',
    tech: ['OpenAI', 'Redis', 'Rate Limiting'],
    lines: 60,
    image: '/examples/ai.png',
  },
  {
    title: 'Real-time Chat',
    description: 'WebSocket chat with rooms, typing indicators, and presence',
    liveUrl: 'https://chat-yama.fly.dev',
    githubUrl: 'https://github.com/betagors/yama-chat-template',
    tech: ['WebSockets', 'Redis PubSub', 'PostgreSQL'],
    lines: 90,
    image: '/examples/chat.png',
  },
  {
    title: 'Blog API',
    description: 'Content management with markdown, tags, and SEO',
    liveUrl: 'https://blog-api-yama.fly.dev',
    githubUrl: 'https://github.com/betagors/yamajs/tree/main/examples/blog-api',
    tech: ['PostgreSQL', 'Full-text Search', 'S3'],
    lines: 85,
    image: '/examples/blog.png',
  },
];

export function ExamplesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
  };

  const currentExample = examples[currentIndex];

  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-purple-500/5 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Built with Yama
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-world examples you can copy and deploy in minutes
          </p>
        </div>

        {/* Main Carousel */}
        <div className="relative">
          <div className="rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Image Preview */}
              <div className="relative bg-gradient-to-br from-primary/10 to-purple-500/10 p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  {/* Placeholder for screenshot */}
                  <div className="w-full h-64 rounded-lg bg-background/50 border border-primary/30 flex items-center justify-center mb-4">
                    <div className="text-6xl">🚀</div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Link href={currentExample.liveUrl} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-secondary/50 text-secondary hover:bg-secondary/10"
                    >
                      <Link href={currentExample.githubUrl} target="_blank">
                        <Github className="h-4 w-4 mr-2" />
                        Source
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {currentExample.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentExample.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Lines of code:</span>
                    <span className="font-mono text-primary font-semibold">
                      ~{currentExample.lines}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {currentExample.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold"
                >
                  <Link href={currentExample.githubUrl} target="_blank">
                    <Github className="h-4 w-4 mr-2" />
                    Copy this template
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              size="sm"
              variant="outline"
              onClick={prevSlide}
              className="h-10 w-10 rounded-full p-0 border-primary/50 hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </Button>

            <div className="flex gap-2">
              {examples.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={nextSlide}
              className="h-10 w-10 rounded-full p-0 border-primary/50 hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>

        {/* Grid of all examples */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {examples.slice(0, 3).map((example) => (
            <Link
              key={example.title}
              href={example.githubUrl}
              target="_blank"
              className="group p-6 rounded-xl border border-primary/20 bg-card/30 hover:border-primary/40 hover:bg-card/50 transition-all"
            >
              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {example.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {example.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">~{example.lines} lines</span>
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
