import React, { useEffect, useState } from 'react';
import { Text } from 'ink';

interface SpinnerProps {
  label?: string;
}

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Spinner({ label }: SpinnerProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text>
      <Text color="cyan">{frames[frameIndex]}</Text>
      {label && <Text> {label}</Text>}
    </Text>
  );
}
