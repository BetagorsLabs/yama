import React from 'react';
import { Box, Text } from 'ink';

interface TableProps {
  data: string[][];
  headers?: string[];
  border?: boolean;
}

export function Table({ data, headers, border = true }: TableProps) {
  if (data.length === 0) {
    return <Text>No data</Text>;
  }

  // Use headers if provided, otherwise use first row
  const headerRow = headers || data[0];
  const rows = headers ? data : data.slice(1);

  // Calculate column widths
  const columnWidths = headerRow.map((_, colIndex) => {
    const headerLength = headerRow[colIndex]?.length || 0;
    const maxDataLength = Math.max(
      ...rows.map(row => row[colIndex]?.length || 0)
    );
    return Math.max(headerLength, maxDataLength, 10);
  });

  const renderRow = (row: string[], isHeader = false) => {
    const cells = row.map((cell, index) => {
      const width = columnWidths[index] || 10;
      const padded = (cell || '').padEnd(width).substring(0, width);
      return (
        <Text key={index} bold={isHeader} color={isHeader ? 'cyan' : undefined}>
          {padded}
        </Text>
      );
    });

    return (
      <Box key={isHeader ? 'header' : row.join('-')} flexDirection="row" gap={1}>
        {border && <Text>│</Text>}
        {cells.map((cell, i) => (
          <React.Fragment key={i}>
            {cell}
            {border && i < cells.length - 1 && <Text>│</Text>}
          </React.Fragment>
        ))}
        {border && <Text>│</Text>}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      {border && (
        <Text>
          {'┌' + columnWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐'}
        </Text>
      )}
      {renderRow(headerRow, true)}
      {border && (
        <Text>
          {'├' + columnWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤'}
        </Text>
      )}
      {rows.map((row, index) => (
        <React.Fragment key={index}>{renderRow(row)}</React.Fragment>
      ))}
      {border && (
        <Text>
          {'└' + columnWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘'}
        </Text>
      )}
    </Box>
  );
}
