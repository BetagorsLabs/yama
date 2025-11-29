import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { StatusIndicator } from './components/StatusIndicator';
import { Spinner } from './components/Spinner';

export interface ServerStatus {
  status: 'starting' | 'running' | 'restarting' | 'error' | 'stopped';
  message?: string;
}

export interface FileChange {
  path: string;
  type: 'change' | 'add' | 'remove';
  timestamp: number;
}

interface DevServerProps {
  port: number;
  configPath: string;
  environment: string;
  watch: boolean;
  serverStatus: ServerStatus;
  recentChanges: FileChange[];
  restartCount: number;
  startTime: number;
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function getStatusIndicator(status: ServerStatus['status']) {
  switch (status) {
    case 'starting':
      return <Spinner label="Starting server..." />;
    case 'running':
      return <StatusIndicator status="success" label="Server running" />;
    case 'restarting':
      return <Spinner label="Restarting server..." />;
    case 'error':
      return <StatusIndicator status="error" label="Server error" />;
    case 'stopped':
      return <StatusIndicator status="warning" label="Server stopped" />;
  }
}

export const DevServer = React.memo(function DevServer({
  port,
  configPath,
  environment,
  watch,
  serverStatus,
  recentChanges,
  restartCount,
  startTime,
}: DevServerProps) {
  // Update uptime every second when server is running
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    if (serverStatus.status !== 'running') {
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [serverStatus.status]);

  // Memoize uptime calculation
  const uptime = useMemo(() => {
    return formatUptime(currentTime - startTime);
  }, [currentTime, startTime]);

  // Memoize recent changes display (only show last 5)
  const displayChanges = useMemo(() => {
    return recentChanges.slice(-5);
  }, [recentChanges]);

  // Memoize status indicator to avoid recreating component
  const statusIndicator = useMemo(() => {
    return getStatusIndicator(serverStatus.status);
  }, [serverStatus.status]);

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          🚀 Yama Development Server
        </Text>
        <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
      </Box>

      <Box flexDirection="column" gap={1} marginBottom={1}>
        <Box>
          <Text>Status: </Text>
          {statusIndicator}
        </Box>
        
        <Box>
          <Text>Port: </Text>
          <Text color="yellow">{port}</Text>
        </Box>
        
        <Box>
          <Text>Environment: </Text>
          <Text color="yellow">{environment}</Text>
        </Box>
        
        <Box>
          <Text>Config: </Text>
          <Text color="gray">{configPath}</Text>
        </Box>
        
        {serverStatus.status === 'running' && (
          <>
            <Box>
              <Text>Uptime: </Text>
              <Text color="green">{uptime}</Text>
            </Box>
            <Box>
              <Text>Restarts: </Text>
              <Text color={restartCount > 0 ? 'yellow' : 'green'}>
                {restartCount}
              </Text>
            </Box>
          </>
        )}
      </Box>

      {serverStatus.status === 'running' && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan" marginBottom={1}>
            📡 Server Endpoints
          </Text>
          <Box flexDirection="column" gap={0}>
            <Text>
              <Text color="blue">→</Text> Server:{' '}
              <Text color="green">http://localhost:{port}</Text>
            </Text>
            <Text>
              <Text color="blue">→</Text> Health:{' '}
              <Text color="green">http://localhost:{port}/health</Text>
            </Text>
            <Text>
              <Text color="blue">→</Text> Config:{' '}
              <Text color="green">http://localhost:{port}/config</Text>
            </Text>
            <Text>
              <Text color="blue">→</Text> Docs:{' '}
              <Text color="green">http://localhost:{port}/docs</Text>
            </Text>
          </Box>
        </Box>
      )}

      {watch && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan" marginBottom={1}>
            👀 Watch Mode
          </Text>
          <StatusIndicator status="success" label="Watching for changes" />
          {displayChanges.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text color="gray" dimColor>
                Recent changes:
              </Text>
              {displayChanges.map((change, index) => {
                const symbol =
                  change.type === 'add'
                    ? '➕'
                    : change.type === 'remove'
                    ? '🗑️'
                    : '📝';
                return (
                  <Text key={`${change.path}-${change.timestamp}-${index}`} color="gray" dimColor>
                    {symbol} {change.path}
                  </Text>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {serverStatus.message && (
        <Box marginTop={1}>
          <Text color="yellow">{serverStatus.message}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Press Ctrl+C to stop
        </Text>
      </Box>
    </Box>
  );
});
