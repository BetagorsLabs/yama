import React from 'react';
import { Box as InkBox, Text } from 'ink';
import type { BoxProps as InkBoxProps } from 'ink';

export interface BoxProps extends InkBoxProps {
  title?: string;
  border?: boolean;
  borderColor?: string;
}

export function Box({ 
  title, 
  border = false, 
  borderColor = 'gray',
  children,
  ...props 
}: BoxProps) {
  const content = (
    <InkBox {...props}>
      {title && (
        <Text color={borderColor} bold>
          {title}
        </Text>
      )}
      {children}
    </InkBox>
  );

  if (!border) {
    return content;
  }

  // Simple border implementation
  return (
    <InkBox flexDirection="column" {...props}>
      {title && (
        <Text color={borderColor}>
          {'┌─ ' + title + ' ' + '─'.repeat(20)}
        </Text>
      )}
      <InkBox paddingX={title ? 1 : 0}>
        {children}
      </InkBox>
    </InkBox>
  );
}
