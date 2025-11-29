import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { StatusIndicator } from './components/StatusIndicator';
import { InfoList } from './components/CommandOutput';

interface Plugin {
  name: string;
  version: string;
  type?: string;
  service?: string;
}

interface PluginListCommandProps {
  plugins: Plugin[];
}

export function PluginListCommandTUI({ plugins }: PluginListCommandProps) {
  return (
    <CommandOutput title="📦 Installed Yama Service Plugins">
      {plugins.length === 0 ? (
        <Box flexDirection="column" gap={1}>
          <Text>No service plugins installed.</Text>
          <Text color="gray">Install a plugin with: yama plugin install {'<package-name>'}</Text>
        </Box>
      ) : (
        <Box flexDirection="column" gap={1}>
          {plugins.map((plugin, index) => (
            <Box key={index} flexDirection="column" gap={0}>
              <StatusIndicator status="success" label={`${plugin.name}@${plugin.version}`} />
              {plugin.type && (
                <Text color="gray" dimColor>
                  {'  '}Type: {plugin.type}
                </Text>
              )}
              {plugin.service && (
                <Text color="gray" dimColor>
                  {'  '}Service: {plugin.service}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </CommandOutput>
  );
}

export function runPluginListTUI(props: PluginListCommandProps) {
  render(<PluginListCommandTUI {...props} />);
}
