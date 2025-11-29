import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';

interface PluginSearchResult {
  name: string;
  version: string;
  description: string;
  score: string;
}

interface PluginSearchCommandProps {
  query: string;
  plugins: PluginSearchResult[];
}

export function PluginSearchCommandTUI({ query, plugins }: PluginSearchCommandProps) {
  const tableData = plugins.map((p) => [p.name, p.version, p.description, p.score]);

  return (
    <CommandOutput title={`🔍 Search Results for "${query}"`}>
      <Table
        data={tableData}
        headers={['Plugin', 'Version', 'Description', 'Score']}
      />
      <Box marginTop={1} flexDirection="column" gap={0}>
        <Text color="green">Found {plugins.length} plugin(s)</Text>
        <Text color="gray">Install with: yama plugin install {'<plugin-name>'}</Text>
      </Box>
    </CommandOutput>
  );
}

export function runPluginSearchTUI(props: PluginSearchCommandProps) {
  render(<PluginSearchCommandTUI {...props} />);
}
