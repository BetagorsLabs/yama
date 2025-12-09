import type { MDXComponents } from 'mdx/types';
// import { Cards, Card } from './app/components/Cards'; // Uncomment if you want to keep using these

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}
