import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { StatusIndicator } from './components/StatusIndicator';
import { StatusList } from './components/CommandOutput';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  schemaCount?: number;
  endpointCount?: number;
}

interface ValidateCommandProps {
  configPath: string;
  result: ValidationResult;
}

export function ValidateCommandTUI({ configPath, result }: ValidateCommandProps) {
  const statusItems = [
    ...(result.schemaCount !== undefined
      ? [{ label: `Found ${result.schemaCount} schema(s)`, status: 'success' as const }]
      : []),
    ...(result.endpointCount !== undefined
      ? [{ label: `Found ${result.endpointCount} endpoint(s)`, status: 'success' as const }]
      : []),
    ...result.warnings.map((w) => ({ label: w, status: 'warning' as const })),
    ...result.errors.map((e) => ({ label: e, status: 'error' as const })),
  ];

  return (
    <CommandOutput title={`🔍 Validating ${configPath}`}>
      <Box flexDirection="column" gap={1}>
        {result.schemaCount !== undefined && (
          <StatusIndicator
            status="success"
            label={`Found ${result.schemaCount} schema(s)`}
          />
        )}
        {result.endpointCount !== undefined && (
          <StatusIndicator
            status="success"
            label={`Found ${result.endpointCount} endpoint(s)`}
          />
        )}
        {result.warnings.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="yellow">
              Warnings:
            </Text>
            {result.warnings.map((warning, index) => (
              <Text key={index} color="yellow">
                {warning}
              </Text>
            ))}
          </Box>
        )}
        {result.errors.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="red">
              Validation errors:
            </Text>
            {result.errors.map((error, index) => (
              <Text key={index} color="red">
                {error}
              </Text>
            ))}
          </Box>
        )}
        <Box marginTop={1}>
          {result.isValid ? (
            <StatusIndicator status="success" label="Configuration is valid!" />
          ) : (
            <StatusIndicator status="error" label="Configuration has errors" />
          )}
        </Box>
      </Box>
    </CommandOutput>
  );
}

export function runValidateTUI(props: ValidateCommandProps) {
  render(<ValidateCommandTUI {...props} />);
  // Exit with appropriate code
  if (!props.result.isValid) {
    process.exit(1);
  }
}
