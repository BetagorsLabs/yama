import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';
import { StatusIndicator } from './components/StatusIndicator';
import { InfoList } from './components/CommandOutput';

interface PluginInfoCommandProps {
  packageName: string;
  version: string;
  description?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  yamaMetadata?: {
    category?: string;
    pluginApi?: string;
    yamaCore?: string;
    dependencies?: { plugins?: string[] };
  };
  isInstalled: boolean;
  installedVersion?: string;
  versions: Array<{ version: string; published: string }>;
  totalVersions: number;
  created: string;
  modified: string;
}

export function PluginInfoCommandTUI(props: PluginInfoCommandProps) {
  const versionTableData = props.versions.map((v) => [v.version, v.published]);

  return (
    <CommandOutput title={`📦 ${props.packageName}`}>
      <Box flexDirection="column" gap={1}>
        <InfoList
          items={[
            { label: 'Version', value: props.version },
            ...(props.description ? [{ label: 'Description', value: props.description }] : []),
            ...(props.homepage ? [{ label: 'Homepage', value: props.homepage }] : []),
            ...(props.repository ? [{ label: 'Repository', value: props.repository }] : []),
            ...(props.license ? [{ label: 'License', value: props.license }] : []),
          ]}
        />

        {props.yamaMetadata && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="cyan">
              🔌 Yama Plugin Metadata:
            </Text>
            <InfoList
              items={[
                ...(props.yamaMetadata.category
                  ? [{ label: 'Category', value: props.yamaMetadata.category }]
                  : []),
                ...(props.yamaMetadata.pluginApi
                  ? [{ label: 'Plugin API', value: props.yamaMetadata.pluginApi }]
                  : []),
                ...(props.yamaMetadata.yamaCore
                  ? [{ label: 'Yama Core', value: props.yamaMetadata.yamaCore }]
                  : []),
                ...(props.yamaMetadata.dependencies?.plugins
                  ? [
                      {
                        label: 'Dependencies',
                        value: props.yamaMetadata.dependencies.plugins.join(', '),
                      },
                    ]
                  : []),
              ]}
            />
          </Box>
        )}

        <Box marginTop={1}>
          {props.isInstalled ? (
            <Box flexDirection="column" gap={0}>
              <StatusIndicator status="success" label="Installed locally" />
              {props.installedVersion && (
                <Text color="gray" dimColor>
                  {'  '}Compatible with Yama Core: {props.installedVersion}
                </Text>
              )}
            </Box>
          ) : (
            <Box flexDirection="column" gap={0}>
              <StatusIndicator status="info" label="Not installed locally" />
              <Text color="gray" dimColor>
                {'  '}Install with: yama plugin install {props.packageName}
              </Text>
            </Box>
          )}
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan" marginBottom={1}>
            📋 Available Versions (showing last 10):
          </Text>
          <Table data={versionTableData} headers={['Version', 'Published']} />
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan">
            📊 Package Info:
          </Text>
          <InfoList
            items={[
              { label: 'Total versions', value: String(props.totalVersions) },
              { label: 'Created', value: props.created },
              { label: 'Modified', value: props.modified },
            ]}
          />
        </Box>
      </Box>
    </CommandOutput>
  );
}

export function runPluginInfoTUI(props: PluginInfoCommandProps) {
  render(<PluginInfoCommandTUI {...props} />);
}
