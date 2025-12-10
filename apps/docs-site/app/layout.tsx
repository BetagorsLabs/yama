import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { Logo } from './components/Logo';
import Link from 'next/link';
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from "./components/mode-toggle"
import { MobileNav } from "./components/MobileNav"
import { Github } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Yama JS - Backend APIs in 80 lines',
    template: '%s | Yama JS'
  },
  description: 'The backend framework that removes 90% of the code while keeping 100% of the power. YAML config + TypeScript handlers = Full CRUD API with auth, docs, and type-safe SDKs.',
  keywords: ['backend framework', 'typescript', 'nodejs', 'api', 'openapi', 'type-safe', 'yaml', 'postgresql', 'rest api'],
  authors: [{ name: 'Betagors' }],
  creator: 'Betagors',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yamajs.com',
    siteName: 'Yama JS',
    title: 'Yama JS - Backend APIs in 80 lines',
    description: 'The backend framework that removes 90% of the code while keeping 100% of the power.',
    images: [
      {
        url: 'https://yamajs.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Yama JS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yama JS - Backend APIs in 80 lines',
    description: 'The backend framework that removes 90% of the code while keeping 100% of the power.',
    images: ['https://yamajs.com/og-image.png'],
    creator: '@yamajs_org',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

const navLinks = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: 'https://github.com/betagors/yamajs', label: 'GitHub', external: true },
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground no-underline transition hover:text-primary"
        >
          <Logo />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            Yama JS
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link
            href="/docs"
            className="hidden lg:inline-flex rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-primary hover:bg-primary/10"
          >
            Docs
          </Link>
          <Link
            href="/docs/getting-started"
            className="hidden lg:inline-flex rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-primary hover:bg-primary/10"
          >
            Getting Started
          </Link>
          <a
            href="https://github.com/betagors/yamajs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-primary hover:bg-primary/10"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
            </body>
        </html>
    );
}
