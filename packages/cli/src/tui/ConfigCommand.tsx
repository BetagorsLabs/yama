import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';

interface ConfigCommandProps {
  config: unknown;
  configPath: string;
}

export function ConfigCommandTUI({ config, configPath }: ConfigCommandProps) {
  return (
    <CommandOutput title={`📋 Configuration (${configPath})`}>
      <Box>
        <Text>{JSON.stringify(config, null, 2)}</Text>
      </Box>
    </CommandOutput>
  );
}

export function runConfigTUI(props: ConfigCommandProps) {
  render(<ConfigCommandTUI {...props} />);
}
