# Yama JS Marketing Website

The high-converting marketing website for Yama JS - built with Next.js 15, Tailwind CSS, and shadcn/ui.

## 🎯 Goal

Convert visitors to users in **under 15 seconds**. Target: **60% CTR** on "Start building now" button.

## 🚀 Features

- **Hero Section**: Huge headline, GitHub stars counter, animated terminal demo
- **Live Code Demo**: Split-screen showing YAML config → Auto-generated API
- **Comparison Table**: Yama vs NestJS vs tRPC vs Express
- **How It Works**: 3-step visual workflow
- **Examples Carousel**: Real-world templates ready to deploy
- **Social Proof**: Wall of love (Twitter testimonials) + Built with Yama showcase
- **Dark Mode First**: Tron-style neon aesthetic (cyan/green accents)
- **SEO Optimized**: Meta tags, OG images, structured data
- **Mobile Perfect**: Fully responsive, optimized for Twitter/X traffic

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + custom neon utilities
- **Components**: shadcn/ui + Radix primitives
- **Font**: Inter (via Google Fonts)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Installation

```bash
cd apps/docs-site
pnpm install
```

## 🏃 Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Build

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
apps/docs-site/
├── app/
│   ├── components/
│   │   ├── sections/          # Page sections
│   │   │   ├── hero.tsx
│   │   │   ├── code-demo.tsx
│   │   │   ├── comparison.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── examples.tsx
│   │   │   └── social-proof.tsx
│   │   └── ui/                # Reusable UI components
│   ├── layout.tsx             # Root layout + metadata
│   ├── page.tsx               # Homepage
│   └── globals.css            # Global styles + neon effects
├── public/
│   ├── humans.txt
│   ├── .well-known/
│   │   └── security.txt
│   └── [favicon files]
└── MARKETING_ASSETS.md        # Marketing copy & assets guide
```

## 🎨 Design System

### Colors
- **Primary**: Cyan (#06b6d4)
- **Secondary**: Green (#22c55e)
- **Background**: Black (#000000)
- **Text**: White/Gray scale

### Typography
- **Font**: Inter
- **Headings**: Bold, 4xl-7xl
- **Body**: Regular, lg-xl
- **Code**: Fira Code (mono)

### Effects
- Neon glow on hover
- Grid background (Tron-style)
- Subtle animations (pulse, fade)
- Gradient buttons

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set build command: `pnpm build`
3. Set output directory: `.next`
4. Deploy!

Your site will be live at `yamajs.com` (or your custom domain)

### Environment Variables

No environment variables needed for the marketing site. All data is static or fetched client-side.

## 📊 Performance Targets

- **Lighthouse Score**: 100/100 on mobile
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

Run audit:
```bash
pnpm build
pnpm start
# Open Chrome DevTools → Lighthouse
```

## 🎯 Conversion Optimization

### Key CTAs (in order of importance)
1. **Hero CTA**: "Start building now →" (GitHub link)
2. **Code Demo**: Copy buttons on all code blocks
3. **Comparison Table**: "npm create yama@latest" copy button
4. **Footer CTA**: Large button + terminal command

### Tracking (TODO)
- [ ] Google Analytics 4
- [ ] Plausible (privacy-friendly alternative)
- [ ] GitHub stars webhook (auto-update counter)
- [ ] Discord member count API

## 🔧 Customization

### Update GitHub Stars Count
The hero section fetches live stars from GitHub API. No configuration needed.

### Add New Examples
Edit `apps/docs-site/app/components/sections/examples.tsx`:

```tsx
const examples = [
  {
    title: 'Your Project',
    description: 'Project description',
    liveUrl: 'https://...',
    githubUrl: 'https://github.com/...',
    tech: ['PostgreSQL', 'Redis'],
    lines: 85,
  },
  // ... more examples
];
```

### Add Testimonials
Edit `apps/docs-site/app/components/sections/social-proof.tsx`:

```tsx
const tweets = [
  {
    author: 'Developer Name',
    handle: '@username',
    avatar: '👨‍💻',
    content: 'Quote here...',
    verified: true,
  },
  // ... more tweets
];
```

## 📝 Content Guidelines

### Headlines
- Max 12 words
- Use numbers ("80 lines", "90% less code")
- Create urgency ("under 15 seconds")

### Copy
- Benefit-driven, not feature-driven
- Show, don't tell (use code examples)
- Address pain points directly

### Code Examples
- Keep examples under 20 lines
- Show real-world use cases
- Highlight the "magic" (auto-generation)

## 🐛 Known Issues

- [ ] Safari: Grid background may flicker on scroll (CSS containment issue)
- [ ] Mobile: Hero terminal animation disabled for performance
- [ ] iOS: Some gradient text may render as solid (fallback works)

## 🤝 Contributing

This is the marketing site. For framework contributions, see the main [Yama repository](https://github.com/betagors/yamajs).

Marketing improvements welcome:
- Better copy
- Performance optimizations
- A/B test results
- SEO improvements

## 📄 License

MPL-2.0 License - see [LICENSE](LICENSE) for details

## 🔗 Links

- **Website**: [yamajs.com](https://yamajs.com)
- **Docs**: [yamajs.com/docs](https://yamajs.com/docs)
- **GitHub**: [github.com/betagors/yamajs](https://github.com/betagors/yamajs)
- **Discord**: [discord.gg/XwDmddq4Pz](https://discord.gg/XwDmddq4Pz)
- **𝕏 (formerly Twitter)**: [@yamajs_org](https://x.com/yamajs_org)

---

Built with 💚 by [Betagors](https://github.com/betagors)

No VC. No bullshit. 100% open source.
