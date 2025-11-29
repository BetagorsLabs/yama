import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';
import { InfoList } from './components/CommandOutput';

interface PluginMetric {
  plugin: string;
  loadTime: number;
  initTime: number;
  apiCalls: number;
  errors: number;
  lastError?: string;
}

interface PluginMetricsCommandProps {
  summary: {
    totalPlugins: number;
    totalLoadTime: number;
    totalInitTime: number;
    averageLoadTime: number;
    averageInitTime: number;
    totalAPICalls: number;
    totalErrors: number;
  };
  plugins: PluginMetric[];
}

export function PluginMetricsCommandTUI({ summary, plugins }: PluginMetricsCommandProps) {
  const pluginTableData = plugins.map((p) => [
    p.plugin,
    p.loadTime.toFixed(2),
    p.initTime.toFixed(2),
    String(p.apiCalls),
    String(p.errors),
    p.lastError ? `${p.lastError.substring(0, 30)}...` : '-',
  ]);

  return (
    <CommandOutput title="📊 Plugin Metrics Summary">
      <Box flexDirection="column" gap={1}>
        <InfoList
          items={[
            { label: 'Total Plugins', value: String(summary.totalPlugins) },
            { label: 'Total Load Time', value: `${summary.totalLoadTime.toFixed(2)}ms` },
            { label: 'Total Init Time', value: `${summary.totalInitTime.toFixed(2)}ms` },
            { label: 'Average Load Time', value: `${summary.averageLoadTime.toFixed(2)}ms` },
            { label: 'Average Init Time', value: `${summary.averageInitTime.toFixed(2)}ms` },
            { label: 'Total API Calls', value: String(summary.totalAPICalls) },
            { label: 'Total Errors', value: String(summary.totalErrors) },
          ]}
        />

        {plugins.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="cyan" marginBottom={1}>
              📦 Per-Plugin Metrics
            </Text>
            <Table
              data={pluginTableData}
              headers={['Plugin', 'Load (ms)', 'Init (ms)', 'API Calls', 'Errors', 'Last Error']}
            />
          </Box>
        )}

        <Box marginTop={1}>
          <Text color="gray" dimColor>
            💡 Tip: Use --reset to clear metrics
          </Text>
          <Text color="gray" dimColor>
            💡 Tip: Use --format prometheus or --format json for export
          </Text>
        </Box>
      </Box>
    </CommandOutput>
  );
}

export function runPluginMetricsTUI(props: PluginMetricsCommandProps) {
  render(<PluginMetricsCommandTUI {...props} />);
}
