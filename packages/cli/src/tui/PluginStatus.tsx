import React from 'react';
import { render, Box, Text } from 'ink';
import { Table } from './components/Table';
import { StatusIndicator } from './components/StatusIndicator';

interface PluginStatusRow {
  plugin: string;
  installed: string;
  package: string;
  pending: string;
  status: string;
}

interface PluginStatusProps {
  plugins: PluginStatusRow[];
  history?: Array<{
    version: string;
    migration: string;
    type: string;
    appliedAt: string;
  }>;
  pluginName?: string;
}

export function PluginStatusTUI({ plugins, history, pluginName }: PluginStatusProps) {
  const tableData = plugins.map((p) => [
    p.plugin,
    p.installed,
    p.package,
    p.pending,
    p.status,
  ]);

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          📦 Plugin Migration Status
        </Text>
        <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
      </Box>

      <Box marginBottom={1}>
        <Table
          data={tableData}
          headers={['Plugin', 'Installed', 'Package', 'Pending', 'Status']}
        />
      </Box>

      {history && history.length > 0 && pluginName && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan" marginBottom={1}>
            📜 Migration History for {pluginName}
          </Text>
          <Table
            data={history.map((h) => [
              h.version,
              h.migration,
              h.type,
              h.appliedAt,
            ])}
            headers={['Version', 'Migration', 'Type', 'Applied At']}
          />
        </Box>
      )}
    </Box>
  );
}

export function runPluginStatusTUI(props: PluginStatusProps) {
  render(<PluginStatusTUI {...props} />);
}
