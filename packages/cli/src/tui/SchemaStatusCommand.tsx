import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';
import { StatusIndicator } from './components/StatusIndicator';

interface MigrationStatus {
  status: 'applied' | 'pending';
  migration: string;
  appliedAt: string;
  hash: string;
}

interface SchemaStatusCommandProps {
  migrations: MigrationStatus[];
  pendingCount: number;
}

export function SchemaStatusCommandTUI({ migrations, pendingCount }: SchemaStatusCommandProps) {
  const tableData = migrations.map((m) => [
    m.status === 'applied' ? '✅ Applied' : '⏳ Pending',
    m.migration,
    m.appliedAt,
    m.hash,
  ]);

  return (
    <CommandOutput title="📊 Migration Status">
      <Table
        data={tableData}
        headers={['Status', 'Migration', 'Applied At', 'Hash']}
      />
      <Box marginTop={1}>
        {pendingCount === 0 ? (
          <StatusIndicator status="success" label="All migrations are applied." />
        ) : (
          <Text color="yellow">
            {pendingCount} migration(s) pending. Apply with: yama schema:apply
          </Text>
        )}
      </Box>
    </CommandOutput>
  );
}

export function runSchemaStatusTUI(props: SchemaStatusCommandProps) {
  render(<SchemaStatusCommandTUI {...props} />);
}
