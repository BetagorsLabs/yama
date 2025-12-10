import type { MDXComponents } from 'mdx/types';
import { Cards, Card } from './app/components/Cards';
import { Pre } from './app/components/ui/code-block';
import { TabbedCode, Tab } from './app/components/ui/tabbed-code';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Cards,
    Card,
    pre: Pre,
    TabbedCode,
    Tab,
    ...components,
  }
}
