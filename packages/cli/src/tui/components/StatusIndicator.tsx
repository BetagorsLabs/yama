import React from 'react';
import { Text } from 'ink';

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  label: string;
}

const statusSymbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  pending: '⏳',
};

const statusColors = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  pending: 'gray',
};

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <Text>
      <Text color={statusColors[status]}>{statusSymbols[status]}</Text>
      {' '}
      <Text>{label}</Text>
    </Text>
  );
}
