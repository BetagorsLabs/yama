import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';

interface TableInfo {
  name: string;
  rowCount: string;
}

interface DbListCommandProps {
  tables: TableInfo[];
  dbType: string;
  dbLocation: string;
}

export function DbListCommandTUI({ tables, dbType, dbLocation }: DbListCommandProps) {
  const tableData = tables.map((t) => [t.name, t.rowCount]);

  return (
    <CommandOutput title={`📊 Database Tables (${dbType} - ${dbLocation})`}>
      <Table data={tableData} headers={['Table Name', 'Row Count']} />
      <Box marginTop={1}>
        <Text color="green">Found {tables.length} table(s).</Text>
      </Box>
    </CommandOutput>
  );
}

export function runDbListTUI(props: DbListCommandProps) {
  render(<DbListCommandTUI {...props} />);
}
