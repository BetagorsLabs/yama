import React from 'react';
import { Box, Text } from 'ink';
import { Table } from './Table';
import { StatusIndicator } from './StatusIndicator';

interface CommandOutputProps {
  title?: string;
  children: React.ReactNode;
}

export function CommandOutput({ title, children }: CommandOutputProps) {
  return (
    <Box flexDirection="column" padding={1}>
      {title && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="cyan">
            {title}
          </Text>
          <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        </Box>
      )}
      {children}
    </Box>
  );
}

interface ListItem {
  label: string;
  value: string | React.ReactNode;
  status?: 'success' | 'error' | 'warning' | 'info';
}

interface InfoListProps {
  items: ListItem[];
}

export function InfoList({ items }: InfoListProps) {
  return (
    <Box flexDirection="column" gap={0}>
      {items.map((item, index) => (
        <Box key={index} flexDirection="row" gap={1}>
          <Text color="gray">{item.label}:</Text>
          {typeof item.value === 'string' ? (
            <Text color="yellow">{item.value}</Text>
          ) : (
            item.value
          )}
          {item.status && (
            <StatusIndicator status={item.status} label="" />
          )}
        </Box>
      ))}
    </Box>
  );
}

interface StatusListProps {
  items: Array<{
    label: string;
    status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  }>;
}

export function StatusList({ items }: StatusListProps) {
  return (
    <Box flexDirection="column" gap={0}>
      {items.map((item, index) => (
        <Box key={index} flexDirection="row" gap={1}>
          <StatusIndicator status={item.status} label={item.label} />
        </Box>
      ))}
    </Box>
  );
}
