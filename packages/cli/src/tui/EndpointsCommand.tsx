import React from 'react';
import { render, Box, Text } from 'ink';
import { CommandOutput } from './components/CommandOutput';
import { Table } from './components/Table';

interface Endpoint {
  path: string;
  method: string;
  handler: string;
  description?: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: { type: string };
  response?: { type: string };
}

interface EndpointsCommandProps {
  endpoints: Endpoint[];
}

export function EndpointsCommandTUI({ endpoints }: EndpointsCommandProps) {
  const tableData = endpoints.map((endpoint) => [
    endpoint.method.toUpperCase(),
    endpoint.path,
    endpoint.handler,
    endpoint.description || '-',
    endpoint.body?.type || '-',
    endpoint.response?.type || '-',
  ]);

  return (
    <CommandOutput title={`📡 Endpoints (${endpoints.length})`}>
      <Table
        data={tableData}
        headers={['Method', 'Path', 'Handler', 'Description', 'Body', 'Response']}
      />
    </CommandOutput>
  );
}

export function runEndpointsTUI(props: EndpointsCommandProps) {
  render(<EndpointsCommandTUI {...props} />);
}
