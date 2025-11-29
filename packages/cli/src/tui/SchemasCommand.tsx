import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';
import type { YamaSchemas } from '@betagors/yama-core';

interface SchemasCommandProps {
  schemas: YamaSchemas;
}

export function SchemasCommandTUI({ schemas }: SchemasCommandProps) {
  const schemaEntries = Object.entries(schemas);
  const tableData = schemaEntries.flatMap(([schemaName, schemaDef]) => {
    if (!schemaDef.fields || Object.keys(schemaDef.fields).length === 0) {
      return [[schemaName, '-', '-', '-']];
    }
    return Object.entries(schemaDef.fields).map(([fieldName, field], index) => {
      const required = field.required ? 'required' : 'optional';
      const type = field.$ref || field.type || 'unknown';
      const defaultVal = field.default !== undefined ? JSON.stringify(field.default) : '-';
      return index === 0
        ? [schemaName, fieldName, type, `${required}${defaultVal !== '-' ? ` (default: ${defaultVal})` : ''}`]
        : ['', fieldName, type, `${required}${defaultVal !== '-' ? ` (default: ${defaultVal})` : ''}`];
    });
  });

  return (
    <CommandOutput title={`📦 Schemas (${schemaEntries.length})`}>
      <Table
        data={tableData}
        headers={['Schema', 'Field', 'Type', 'Details']}
      />
    </CommandOutput>
  );
}

export function runSchemasTUI(props: SchemasCommandProps) {
  render(<SchemasCommandTUI {...props} />);
}
