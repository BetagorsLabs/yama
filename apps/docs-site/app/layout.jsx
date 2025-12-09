import { Footer, Layout } from 'nextra-theme-docs';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import './styles/docs.css';
import { Logo } from './components/Logo';
import Link from 'next/link';

export const metadata = {
  title: 'Yama JS Documentation',
  description: 'Configuration-first backend platform that turns YAML into fully functional APIs, SDKs, and documentation.',
};

const navLinks = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: 'https://github.com/BetagorsLabs/yama', label: 'GitHub', external: true },
];

const navbar = (
  <nav className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:supports-[backdrop-filter]:bg-neutral-950/60">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-neutral-900 no-underline transition hover:opacity-80 dark:text-neutral-50"
      >
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        {navLinks.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 sm:inline-flex"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 sm:inline-flex"
            >
              {link.label}
            </Link>
          ),
        )}
        <Link
          href="/docs"
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-neutral-900"
        >
          Docs
        </Link>
      </div>
    </div>
  </nav>
);
const banner = (
  <Banner storageKey="yama-alpha-banner" dismissible={false}>
    🚀 <strong>Alpha Release</strong> - Yama JS is currently in alpha. APIs may change without notice.
  </Banner>
);
const footer = <Footer>MIT {new Date().getFullYear()} © Yama JS.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <Head>
        {/* Additional head tags can be added here */}
      </Head>
      <body>
        <Layout
          navbar={navbar}
          banner={banner}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/BetagorsLabs/yama/tree/main/apps/docs-site"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

