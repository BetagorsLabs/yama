import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';
import { StatusIndicator } from './components/StatusIndicator';

interface Column {
  name: string;
  type: string;
  nullable: string;
  default: string;
  isPK: boolean;
}

interface DbInspectCommandProps {
  tableName: string;
  columns: Column[];
  rowCount: number;
  sampleData?: Array<Record<string, unknown>>;
}

export function DbInspectCommandTUI({ tableName, columns, rowCount, sampleData }: DbInspectCommandProps) {
  const schemaTableData = columns.map((col) => [
    col.name,
    col.type,
    col.nullable,
    col.default,
    col.isPK ? '✓' : '-',
  ]);

  const sampleTableData = sampleData
    ? [
        Object.keys(sampleData[0]),
        ...sampleData.map((row) =>
          Object.values(row).map((val) => {
            if (val === null) return 'NULL';
            const str = String(val);
            return str.length > 30 ? str.substring(0, 27) + '...' : str;
          })
        ),
      ]
    : [];

  return (
    <CommandOutput title={`📋 Table: ${tableName}`}>
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text bold color="cyan" marginBottom={1}>
            📐 Schema:
          </Text>
          <Table data={schemaTableData} headers={['Column', 'Type', 'Nullable', 'Default', 'PK']} />
        </Box>

        <Box marginTop={1}>
          <Text bold>
            📊 Total rows: {rowCount.toLocaleString()}
          </Text>
        </Box>

        {sampleData && sampleData.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="cyan" marginBottom={1}>
              📄 Sample Data (first 10 rows):
            </Text>
            <Table data={sampleTableData} />
            {rowCount > 10 && (
              <Text color="gray" dimColor marginTop={1}>
                Showing 10 of {rowCount.toLocaleString()} rows.
              </Text>
            )}
          </Box>
        )}

        {rowCount === 0 && (
          <Box marginTop={1}>
            <StatusIndicator status="info" label="Table is empty (no rows)." />
          </Box>
        )}

        <Box marginTop={1}>
          <StatusIndicator status="success" label="Inspection complete." />
        </Box>
      </Box>
    </CommandOutput>
  );
}

export function runDbInspectTUI(props: DbInspectCommandProps) {
  render(<DbInspectCommandTUI {...props} />);
}
