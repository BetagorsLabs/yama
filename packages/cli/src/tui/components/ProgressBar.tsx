import React from 'react';
import { Box, Text } from 'ink';

interface ProgressBarProps {
  progress: number; // 0-100
  width?: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ 
  progress, 
  width = 30, 
  label,
  color = 'green' 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const filled = Math.floor((clampedProgress / 100) * width);
  const empty = width - filled;

  return (
    <Box flexDirection="column">
      {label && <Text>{label}</Text>}
      <Box>
        <Text color={color}>{'█'.repeat(filled)}</Text>
        <Text color="gray">{'░'.repeat(empty)}</Text>
        <Text> {Math.round(clampedProgress)}%</Text>
      </Box>
    </Box>
  );
}
