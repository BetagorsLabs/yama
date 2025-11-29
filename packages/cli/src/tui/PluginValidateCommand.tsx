import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { StatusIndicator } from './components/StatusIndicator';

interface ValidationResult {
  plugin: string;
  valid: boolean;
  error?: string;
}

interface PluginValidateCommandProps {
  results: ValidationResult[];
  summary: {
    valid: number;
    invalid: number;
  };
}

export function PluginValidateCommandTUI({ results, summary }: PluginValidateCommandProps) {
  return (
    <CommandOutput title="🔍 Validating Service Plugins">
      <Box flexDirection="column" gap={1}>
        {results.map((result, index) => (
          <Box key={index} flexDirection="column" gap={0}>
            {result.valid ? (
              <StatusIndicator status="success" label={`${result.plugin} - Valid`} />
            ) : (
              <Box flexDirection="column" gap={0}>
                <StatusIndicator status="error" label={`${result.plugin} - Invalid`} />
                {result.error && (
                  <Text color="red" dimColor>
                    {'  '}{result.error}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        ))}

        <Box marginTop={1} flexDirection="column" gap={0}>
          <Text bold color="cyan">
            📊 Results:
          </Text>
          <StatusIndicator status="success" label={`${summary.valid} valid`} />
          {summary.invalid > 0 && (
            <StatusIndicator status="error" label={`${summary.invalid} invalid`} />
          )}
        </Box>
      </Box>
    </CommandOutput>
  );
}

export function runPluginValidateTUI(props: PluginValidateCommandProps) {
  render(<PluginValidateCommandTUI {...props} />);
  // Exit with error code if any invalid
  if (props.summary.invalid > 0) {
    process.exit(1);
  }
}
