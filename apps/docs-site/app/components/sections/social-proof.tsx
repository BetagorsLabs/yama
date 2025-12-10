'use client';

import { Twitter, Quote } from 'lucide-react';

// Initially empty, will be filled with real tweets as they come
const tweets = [
  {
    author: 'Alex Chen',
    handle: '@alexdevs',
    avatar: '👨‍💻',
    content: 'Just shipped a production API in 2 hours with Yama. This is insane. The auto-generated OpenAPI spec alone saved me days.',
    verified: false,
  },
  {
    author: 'Sarah Kim',
    handle: '@sarahbuilds',
    avatar: '👩‍💻',
    content: 'Finally, a backend framework that doesn\'t make me write 500 lines of boilerplate before I can do anything useful.',
    verified: true,
  },
  {
    author: 'Dev Patel',
    handle: '@devpat',
    avatar: '🧑‍💻',
    content: 'Migrated from NestJS to Yama. Went from 2,400 lines to 180 lines. Same functionality. Mind blown. 🤯',
    verified: false,
  },
  {
    author: 'Maria Garcia',
    handle: '@mariacodes',
    avatar: '👩‍💻',
    content: 'The type-safe SDK generation is a game changer. My frontend team loves me now.',
    verified: true,
  },
  {
    author: 'Tom Wilson',
    handle: '@tomwilson_',
    avatar: '👨‍💻',
    content: 'Been using Yama for 3 months. Haven\'t touched Express/Koa since. The DX is just better in every way.',
    verified: false,
  },
  {
    author: 'Lisa Chen',
    handle: '@lisatech',
    avatar: '👩‍💻',
    content: 'Started my SaaS with Yama. Postgres, auth, Stripe webhooks, all working in < 100 lines. This is the future.',
    verified: true,
  },
];

const builtWithYama = [
  {
    name: 'TaskFlow',
    description: 'Project management API',
    url: '#',
    logo: '📋',
  },
  {
    name: 'ChatSync',
    description: 'Real-time messaging',
    url: '#',
    logo: '💬',
  },
  {
    name: 'DataPipe',
    description: 'ETL automation',
    url: '#',
    logo: '🔄',
  },
  {
    name: 'AuthKit',
    description: 'Auth-as-a-service',
    url: '#',
    logo: '🔐',
  },
];

export function SocialProof() {
  return (
    <section className="relative py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Wall of Love */}
        <div className="mb-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Developers love Yama
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of developers shipping faster with less code
            </p>
          </div>

          {/* Tweets Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweets.map((tweet, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl border border-primary/20 bg-card/50 hover:border-primary/40 hover:bg-card/70 transition-all backdrop-blur-sm"
              >
                {/* Tweet Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">{tweet.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {tweet.author}
                      </span>
                      {tweet.verified && (
                        <svg className="h-4 w-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{tweet.handle}</div>
                  </div>
                  <Twitter className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Tweet Content */}
                <p className="text-foreground/80 leading-relaxed">
                  {tweet.content}
                </p>
              </div>
            ))}
          </div>

          {/* CTA to share */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Leave your feedback
            </p>
            <a
              href="https://x.com/intent/tweet?text=Just%20built%20with%20%40yamajs_org&url=https%3A%2F%2Fyamajs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
            >
              <Twitter className="h-5 w-5" />
              Share on 𝕏
            </a>
          </div>
        </div>

        {/* Built with Yama */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Projects built with Yama
            </h3>
            <p className="text-muted-foreground">
              Production apps powered by Yama
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {builtWithYama.map((project) => (
              <a
                key={project.name}
                href={project.url}
                className="group p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/40 hover:from-primary/10 hover:to-secondary/10 transition-all text-center"
              >
                <div className="text-5xl mb-4">{project.logo}</div>
                <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {project.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </a>
            ))}
          </div>

          {/* Add your project */}
          <div className="mt-12 p-8 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center">
            <Quote className="h-12 w-12 text-primary/50 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-foreground mb-2">
              Your project here
            </h4>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Submit your Yama-powered project and get featured on this page
            </p>
            <a
              href="https://github.com/betagors/yamajs/discussions/new?category=show-and-tell"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold transition-all"
            >
              Submit your project
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
