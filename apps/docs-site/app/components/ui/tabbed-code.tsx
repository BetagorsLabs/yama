'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Code2, Database, FileCode, Terminal } from 'lucide-react';
import { CodeBlock } from './code-block';

interface TabProps {
  label: string;
  language?: string;
  code: string;
  showIndentGuides?: boolean;
}

export function Tab({ label, language, code }: TabProps) {
  return null; // This component doesn't render anything directly
}

interface TabbedCodeProps {
  children: React.ReactNode;
  defaultTab?: string;
}

type TabDefinition = {
  label: string;
  content: string;
  language?: string;
  showIndentGuides?: boolean;
};

function getLanguageIcon(language?: string) {
  const key = (language || '').toLowerCase();
  if (key.includes('bash') || key.includes('sh') || key.includes('shell') || key.includes('zsh') || key.includes('fish') || key.includes('ps')) {
    return <Terminal className="h-3.5 w-3.5 text-muted-foreground/80" />;
  }
  if (key.includes('sql')) {
    return <Database className="h-3.5 w-3.5 text-muted-foreground/80" />;
  }
  if (key.includes('ts') || key.includes('js')) {
    return <Code2 className="h-3.5 w-3.5 text-muted-foreground/80" />;
  }
  return <FileCode className="h-3.5 w-3.5 text-muted-foreground/80" />;
}

function collectTabs(children: React.ReactNode): TabDefinition[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) return [];

    // Unwrap fragments to avoid missing nested Tab elements
    if (child.type === React.Fragment) {
      return collectTabs((child.props as any)?.children);
    }

    const childProps = child.props as any;
    const isTabComponent =
      child.type === Tab ||
      childProps?.mdxType === 'Tab' ||
      childProps?.originalType === 'Tab' ||
      typeof childProps?.label === 'string';

    if (!isTabComponent) return [];

    const labelText = String(childProps.label ?? '').toLowerCase();
    const inferredLanguage =
      childProps.language ||
      childProps.lang ||
      (labelText.includes('yaml') || labelText.includes('yml') ? 'yaml' : 'bash');

    return [
      {
        label: childProps.label,
        content: childProps.code ?? childProps.children ?? '',
        language: inferredLanguage,
        showIndentGuides: childProps.showIndentGuides,
      },
    ];
  });
}

export function TabbedCode({ children, defaultTab }: TabbedCodeProps) {
  const tabs = collectTabs(children);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="not-prose my-3 w-full text-sm">
      <Tabs defaultValue={defaultTab || tabs[0].label} className="w-full">
        <TabsList className="mb-2 inline-flex flex-wrap items-center gap-1 max-w-full rounded-lg border border-primary/20 bg-primary/5 px-1.5 py-1 text-[11px] font-medium">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.label}
              value={tab.label}
              className="h-8 px-2.5 py-1 leading-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <span className="flex items-center gap-1.5">
                {getLanguageIcon(tab.language || tab.label)}
                {tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.label} value={tab.label} className="mt-1">
            <CodeBlock language={tab.language} showIndentGuides={tab.showIndentGuides}>
              {tab.content}
            </CodeBlock>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
