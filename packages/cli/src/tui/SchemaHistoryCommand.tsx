import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';

interface Migration {
  id: number;
  name: string;
  fromHash: string;
  toHash: string;
  appliedAt: string;
}

interface SchemaHistoryCommandProps {
  migrations: Migration[];
  showGraph?: boolean;
}

export function SchemaHistoryCommandTUI({ migrations, showGraph }: SchemaHistoryCommandProps) {
  if (showGraph) {
    return (
      <CommandOutput title="📅 Migration Timeline">
        <Box flexDirection="column" gap={0}>
          {migrations.map((m, index) => (
            <Box key={m.id} flexDirection="column" gap={0}>
              <Text>
                <Text color="gray" dimColor>
                  {m.appliedAt}
                </Text>{' '}
                {m.name} {index < migrations.length - 1 ? '↓' : ''}
              </Text>
            </Box>
          ))}
        </Box>
      </CommandOutput>
    );
  }

  const tableData = migrations.map((m) => [
    String(m.id),
    m.name,
    m.fromHash ? `${m.fromHash.substring(0, 8)}...` : '-',
    m.toHash ? `${m.toHash.substring(0, 8)}...` : '-',
    m.appliedAt,
  ]);

  return (
    <CommandOutput title="📜 Migration History">
      <Table
        data={tableData}
        headers={['ID', 'Name', 'From Hash', 'To Hash', 'Applied At']}
      />
    </CommandOutput>
  );
}

export function runSchemaHistoryTUI(props: SchemaHistoryCommandProps) {
  render(<SchemaHistoryCommandTUI {...props} />);
}
