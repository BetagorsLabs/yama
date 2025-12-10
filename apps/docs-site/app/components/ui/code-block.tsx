'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Prism from 'prismjs';
import { Button } from './button';
import { Copy, Check, Code2, Database, FileCode, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

const patchedLanguages = new Set<string>();
const languagesToPatch = ['javascript', 'typescript', 'tsx', 'jsx', 'bash', 'shell', 'sh', 'zsh', 'fish', 'ps', 'powershell', 'yaml', 'yml', 'json', 'sql'];

function ensureYamaKeyword() {
  languagesToPatch.forEach((lang) => {
    if (patchedLanguages.has(lang)) return;
    const grammar = Prism.languages?.[lang];
    if (!grammar) return;
    Prism.languages.insertBefore(lang, 'keyword', {
      'yama-keyword': {
        pattern: /\byama\b/g,
        alias: 'keyword',
      },
    });
    patchedLanguages.add(lang);
  });
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const lang = language || (className?.match(/language-(\w+)/)?.[1] || 'text');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Map common language names to syntax highlighter languages
  const getSyntaxLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      js: 'javascript',
      py: 'python',
      sh: 'bash',
      shell: 'bash',
      zsh: 'bash',
      fish: 'bash',
      ps1: 'powershell',
      powershell: 'powershell',
      yml: 'yaml',
      env: 'bash', // env files are basically shell
    };
    return languageMap[lang] || lang;
  };

  const syntaxLang = getSyntaxLanguage(lang);

  const codeString = useMemo(() => {
    if (typeof children === 'string') return children.trimEnd();
    if (Array.isArray(children)) return children.join('\n').trimEnd();
    return String(children).trimEnd();
  }, [children]);

  // Patch Prism grammars so "yama" highlights like a keyword
  ensureYamaKeyword();

  const headerIcon = (() => {
    const key = syntaxLang.toLowerCase();
    if (key.includes('bash') || key.includes('shell') || key.includes('zsh') || key.includes('fish') || key.includes('ps') || key.includes('powershell')) {
      return <Terminal className="h-3.5 w-3.5 text-muted-foreground/80" />;
    }
    if (key.includes('sql')) {
      return <Database className="h-3.5 w-3.5 text-muted-foreground/80" />;
    }
    if (key.includes('ts') || key.includes('js')) {
      return <Code2 className="h-3.5 w-3.5 text-muted-foreground/80" />;
    }
    return <FileCode className="h-3.5 w-3.5 text-muted-foreground/80" />;
  })();

  const containerClass = cn(
    'not-prose relative group overflow-hidden rounded-lg border shadow-sm',
    'border-primary/20 bg-card/50 backdrop-blur-sm'
  );

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between border-b border-primary/10 px-3.5 py-2 bg-primary/5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {headerIcon}
          {syntaxLang}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 w-7 p-0 opacity-0 transition-opacity hover:bg-primary/10 group-hover:opacity-100"
          >
            {copied ? (
              <Check className="h-4 w-4 text-secondary" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={syntaxLang}
        style={resolvedTheme === 'light' ? oneLight : oneDark}
        customStyle={{
          margin: 0,
          padding: '0.95rem 1.1rem',
          background: 'transparent',
          fontSize: '0.88rem',
          lineHeight: '1.55',
          overflowX: 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
            background: 'transparent',
          },
        }}
        wrapLines={false}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

// Pre component wrapper for MDX
export function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const child = React.Children.only(children) as React.ReactElement;

  // If it's a code element, use our CodeBlock component
  if (child?.type === 'code') {
    return (
      <CodeBlock
        className={child.props.className}
        language={child.props.language}
      >
        {child.props.children}
      </CodeBlock>
    );
  }

  // Otherwise, render as normal pre
  return <pre {...props}>{children}</pre>;
}
