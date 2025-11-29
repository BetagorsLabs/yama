import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';

interface Snapshot {
  hash: string;
  createdAt: string;
  description: string;
  parent?: string;
}

interface SnapshotListCommandProps {
  snapshots: Snapshot[];
}

export function SnapshotListCommandTUI({ snapshots }: SnapshotListCommandProps) {
  const tableData = snapshots.map((s) => [
    s.hash.substring(0, 8) + '...',
    s.createdAt,
    s.description || '-',
    s.parent ? s.parent.substring(0, 8) + '...' : '-',
  ]);

  return (
    <CommandOutput title="📸 Schema Snapshots">
      <Table data={tableData} headers={['Hash', 'Created', 'Description', 'Parent']} />
      <Box marginTop={1}>
        <Text color="green">Total: {snapshots.length} snapshot(s)</Text>
      </Box>
    </CommandOutput>
  );
}

export function runSnapshotListTUI(props: SnapshotListCommandProps) {
  render(<SnapshotListCommandTUI {...props} />);
}
