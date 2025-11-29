import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';
import { StatusIndicator } from './components/StatusIndicator';

interface PluginHealth {
  plugin: string;
  status: 'healthy' | 'unhealthy' | 'no-check' | 'error' | 'not-installed';
  details: string;
  error: string;
}

interface PluginHealthCommandProps {
  plugins: PluginHealth[];
  summary: {
    healthy: number;
    unhealthy: number;
    noCheck: number;
  };
}

export function PluginHealthCommandTUI({ plugins, summary }: PluginHealthCommandProps) {
  const tableData = plugins.map((p) => {
    const statusText =
      p.status === 'healthy'
        ? '✅ Healthy'
        : p.status === 'unhealthy'
        ? '❌ Unhealthy'
        : p.status === 'no-check'
        ? '⚠️  No health check'
        : p.status === 'not-installed'
        ? '❌ Not installed'
        : '❌ Error';
    return [p.plugin, statusText, p.details || '-', p.error || '-'];
  });

  return (
    <CommandOutput title="🏥 Plugin Health Status">
      <Table
        data={tableData}
        headers={['Plugin', 'Status', 'Details', 'Error']}
      />
      <Box marginTop={1} flexDirection="column" gap={0}>
        <Text bold color="cyan">
          📊 Summary:
        </Text>
        {summary.healthy > 0 && (
          <StatusIndicator status="success" label={`Healthy: ${summary.healthy} plugin(s)`} />
        )}
        {summary.unhealthy > 0 && (
          <StatusIndicator status="error" label={`Unhealthy: ${summary.unhealthy} plugin(s)`} />
        )}
        {summary.noCheck > 0 && (
          <StatusIndicator status="warning" label={`No health check: ${summary.noCheck} plugin(s)`} />
        )}
      </Box>
    </CommandOutput>
  );
}

export function runPluginHealthTUI(props: PluginHealthCommandProps) {
  render(<PluginHealthCommandTUI {...props} />);
  // Exit with error code if any unhealthy
  if (props.summary.unhealthy > 0) {
    process.exit(1);
  }
}
