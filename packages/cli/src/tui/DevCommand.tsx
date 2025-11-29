import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { render, Box, Text, useApp } from 'ink';
import { DevServer, type ServerStatus, type FileChange } from './DevServer';
import { StatusIndicator } from './components/StatusIndicator';
import { Spinner } from './components/Spinner';
import { startYamaNodeRuntime, type YamaServer } from '@betagors/yama-runtime-node';
import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import { existsSync, statSync } from 'fs';
import { dirname, join, relative, extname } from 'path';
import { findYamaConfig } from '../utils/project-detection';
import { generateOnce } from '../commands/generate';
import { readYamaConfig } from '../utils/file-utils';
import { loadEnvFile } from '@betagors/yama-core';

interface DevCommandProps {
  port: number;
  configPath: string;
  environment: string;
  watch: boolean;
  generate?: boolean;
}

const WATCHED_EXTENSIONS = new Set(['.ts', '.js', '.yaml', '.yml', '.json', '.mjs', '.cjs']);
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.yama/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/out/**',
  '**/.turbo/**',
  '**/.vercel/**',
  '**/coverage/**',
  '**/.nyc_output/**',
  '**/*.log',
  '**/*.tsbuildinfo',
  '**/.DS_Store',
  '**/Thumbs.db',
  '**/.env.local',
  '**/.env.*.local',
  '**/secrets.yaml',
  '**/secrets.yml',
  '**/*.secret',
  '**/lib/generated/**',
  '**/generated/**',
  '**/.vscode/**',
  '**/.idea/**',
  '**/*.swp',
  '**/*.swo',
];

const DEBOUNCE_DELAYS = {
  config: 300,
  handler: 200,
  default: 500,
} as const;

const MAX_RECENT_CHANGES = 10;
const FILE_MOD_TIMES_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MIN_RESTART_INTERVAL = 100; // Minimum time between restarts (ms)

// Shared file modification times cache (cleaned up periodically)
const fileModTimes = new Map<string, number>();

// Pre-compile ignore patterns for better performance
const IGNORE_REGEXES = IGNORE_PATTERNS.map((pattern) => 
  new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
);

function shouldWatchFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  if (!WATCHED_EXTENSIONS.has(ext)) {
    return false;
  }
  const normalizedPath = filePath.replace(/\\/g, '/');
  return !IGNORE_REGEXES.some((regex) => regex.test(normalizedPath));
}

function hasFileChanged(filePath: string): boolean {
  try {
    if (!existsSync(filePath)) {
      return false;
    }
    const stats = statSync(filePath);
    const currentMtime = stats.mtimeMs;
    const lastMtime = fileModTimes.get(filePath) || 0;
    const timeDiff = Math.abs(currentMtime - lastMtime);
    if (timeDiff < 10) {
      return false;
    }
    fileModTimes.set(filePath, currentMtime);
    return true;
  } catch {
    return true;
  }
}

// Cleanup old file modification times periodically to prevent memory leaks
function cleanupFileModTimes() {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  for (const [path, mtime] of fileModTimes.entries()) {
    // Remove entries for files that haven't been accessed recently
    if (now - mtime > maxAge) {
      fileModTimes.delete(path);
    }
  }
}

export function DevCommandTUI({
  port,
  configPath,
  environment,
  watch,
  generate,
}: DevCommandProps) {
  const { exit } = useApp();
  const [server, setServer] = useState<YamaServer | null>(null);
  const [watcher, setWatcher] = useState<FSWatcher | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'starting',
  });
  const [recentChanges, setRecentChanges] = useState<FileChange[]>([]);
  const [restartCount, setRestartCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Use refs for values that don't need to trigger re-renders
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRestartTimeRef = useRef<number>(0);
  const isRestartingRef = useRef<boolean>(false);
  const isShuttingDownRef = useRef<boolean>(false);

  // Memoize config directory to avoid recalculating
  const configDir = useMemo(() => dirname(configPath), [configPath]);

  const updateStatus = useCallback((status: ServerStatus) => {
    setServerStatus(status);
  }, []);

  const addFileChange = useCallback((change: FileChange) => {
    setRecentChanges((prev) => {
      // Use functional update to avoid stale closures
      const updated = [...prev, change];
      return updated.slice(-MAX_RECENT_CHANGES);
    });
  }, []);

  const incrementRestart = useCallback(() => {
    setRestartCount((prev) => prev + 1);
  }, []);

  const startServer = useCallback(async () => {
    if (isShuttingDownRef.current) {
      return null;
    }
    
    try {
      updateStatus({ status: 'starting' });
      const serverInstance = await startYamaNodeRuntime(port, configPath, environment);
      
      if (isShuttingDownRef.current) {
        // Component unmounted during startup, clean up
        try {
          await serverInstance.stop();
        } catch {
          // Ignore stop errors
        }
        return null;
      }
      
      setServer(serverInstance);
      updateStatus({ status: 'running' });
      return serverInstance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      updateStatus({ status: 'error', message: errorMessage });
      throw error;
    }
  }, [port, configPath, environment, updateStatus]);

  const stopServer = useCallback(async (serverInstance?: YamaServer | null) => {
    const instance = serverInstance ?? server;
    if (instance) {
      try {
        await Promise.race([
          instance.stop(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Stop timeout')), 2000)
          )
        ]);
      } catch (error) {
        // Ignore stop errors and timeouts
      }
      if (instance === server) {
        setServer(null);
      }
    }
  }, [server]);

  const restartServer = useCallback(async () => {
    // Prevent concurrent restarts
    if (isRestartingRef.current || isShuttingDownRef.current) {
      return;
    }

    // Rate limiting - prevent restarts too close together
    const now = Date.now();
    const timeSinceLastRestart = now - lastRestartTimeRef.current;
    if (timeSinceLastRestart < MIN_RESTART_INTERVAL) {
      // Reschedule restart
      restartTimeoutRef.current = setTimeout(() => {
        restartServer();
      }, MIN_RESTART_INTERVAL - timeSinceLastRestart);
      return;
    }

    isRestartingRef.current = true;
    lastRestartTimeRef.current = now;

    try {
      updateStatus({ status: 'restarting' });
      const currentServer = server;
      await stopServer(currentServer);
      
      // Small delay to ensure port is released
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (isShuttingDownRef.current) {
        return;
      }
      
      await startServer();
      incrementRestart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      updateStatus({ status: 'error', message: errorMessage });
    } finally {
      isRestartingRef.current = false;
    }
  }, [server, startServer, stopServer, updateStatus, incrementRestart]);

  const handleFileChange = useCallback(
    async (filePath: string, type: 'change' | 'add' | 'remove') => {
      if (isShuttingDownRef.current || !hasFileChanged(filePath)) {
        return;
      }

      const relativePath = relative(configDir, filePath);
      addFileChange({ path: relativePath, type, timestamp: Date.now() });

      const isConfig = filePath.endsWith('.yaml') || filePath.endsWith('.yml');
      
      // Clear existing timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      // Debounce restart with adaptive delay
      const delay = isConfig ? DEBOUNCE_DELAYS.config : DEBOUNCE_DELAYS.handler;
      restartTimeoutRef.current = setTimeout(async () => {
        restartTimeoutRef.current = null;
        
        if (isShuttingDownRef.current) {
          return;
        }

        // Generate SDK/types if config changed
        if (isConfig && generate) {
          setIsGenerating(true);
          setGenerationError(null);
          try {
            await generateOnce(configPath, {});
          } catch (error) {
            setGenerationError(error instanceof Error ? error.message : String(error));
          } finally {
            setIsGenerating(false);
          }
        }
        
        await restartServer();
      }, delay);
    },
    [configDir, configPath, generate, addFileChange, restartServer]
  );

  // Setup file modification times cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupFileModTimes();
    }, FILE_MOD_TIMES_CLEANUP_INTERVAL);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let fileWatcher: FSWatcher | null = null;

    const init = async () => {
      // Generate SDK/types if requested
      if (generate && mounted) {
        setIsGenerating(true);
        try {
          await generateOnce(configPath, {});
        } catch (error) {
          if (mounted) {
            setGenerationError(error instanceof Error ? error.message : String(error));
          }
        } finally {
          if (mounted) {
            setIsGenerating(false);
          }
        }
      }

      // Start server
      try {
        await startServer();
      } catch (error) {
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to start server';
          exit(new Error(errorMessage));
        }
        return;
      }

      // Setup watch mode
      if (watch && mounted) {
        const handlersDir = join(configDir, 'src', 'handlers');
        const normalizedConfigPath = configPath.replace(/\\/g, '/');
        const watchPatterns: string[] = [normalizedConfigPath];

        if (existsSync(handlersDir)) {
          watchPatterns.push(handlersDir.replace(/\\/g, '/') + '/**/*');
        }

        const srcDir = join(configDir, 'src');
        if (existsSync(srcDir)) {
          watchPatterns.push(srcDir.replace(/\\/g, '/') + '/**/*');
        }

        const isWindows = process.platform === 'win32';
        fileWatcher = chokidar.watch(watchPatterns, {
          ignoreInitial: true,
          persistent: true,
          ignorePermissionErrors: true,
          usePolling: isWindows,
          atomic: true,
          ignored: (path: string) => {
            const normalizedPath = path.replace(/\\/g, '/');
            if (IGNORE_REGEXES.some((regex) => regex.test(normalizedPath))) {
              return true;
            }
            return !shouldWatchFile(path);
          },
        });

        fileWatcher.on('change', (filePath) => {
          if (mounted && shouldWatchFile(filePath)) {
            handleFileChange(filePath, 'change');
          }
        });

        fileWatcher.on('add', (filePath) => {
          if (mounted && shouldWatchFile(filePath)) {
            handleFileChange(filePath, 'add');
          }
        });

        fileWatcher.on('unlink', (filePath) => {
          fileModTimes.delete(filePath);
          if (mounted && shouldWatchFile(filePath)) {
            handleFileChange(filePath, 'remove');
          }
        });

        fileWatcher.on('error', (error) => {
          // Log but don't crash on watch errors
          if (mounted && error instanceof Error) {
            console.error('Watch error:', error.message);
          }
        });

        if (mounted) {
          setWatcher(fileWatcher);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      isShuttingDownRef.current = true;
      
      // Clear restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // Close watcher
      if (fileWatcher) {
        fileWatcher.close().catch(() => {
          // Ignore close errors
        });
      } else if (watcher) {
        watcher.close().catch(() => {
          // Ignore close errors
        });
      }
      
      // Stop server
      stopServer(server);
    };
  }, [startServer, stopServer, watch, configPath, configDir, generate, handleFileChange, server, exit]);

  // Handle graceful shutdown
  useEffect(() => {
    const handleShutdown = async () => {
      if (isShuttingDownRef.current) {
        // Already shutting down, force exit
        process.exit(1);
        return;
      }

      isShuttingDownRef.current = true;
      updateStatus({ status: 'stopped' });
      
      // Clear restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // Close watcher with timeout
      if (watcher) {
        try {
          await Promise.race([
            watcher.close(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Watcher close timeout')), 1000)
            )
          ]);
        } catch {
          // Ignore close errors and timeouts
        }
      }
      
      // Stop server with timeout
      try {
        await Promise.race([
          stopServer(server),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Server stop timeout')), 2000)
          )
        ]);
      } catch {
        // Ignore stop errors and timeouts
      }
      
      exit();
    };

    const sigintHandler = () => handleShutdown();
    const sigtermHandler = () => handleShutdown();

    process.on('SIGINT', sigintHandler);
    process.on('SIGTERM', sigtermHandler);

    return () => {
      process.removeListener('SIGINT', sigintHandler);
      process.removeListener('SIGTERM', sigtermHandler);
    };
  }, [watcher, server, stopServer, exit, updateStatus]);

  return (
    <Box flexDirection="column">
      <DevServer
        port={port}
        configPath={configPath}
        environment={environment}
        watch={watch}
        serverStatus={serverStatus}
        recentChanges={recentChanges}
        restartCount={restartCount}
        startTime={startTime}
      />
      
      {isGenerating && (
        <Box marginTop={1}>
          <Spinner label="Generating SDK and types..." />
        </Box>
      )}
      
      {generationError && (
        <Box marginTop={1}>
          <StatusIndicator status="warning" label={`Generation: ${generationError}`} />
        </Box>
      )}
    </Box>
  );
}

export function runDevTUI(options: DevCommandProps) {
  render(<DevCommandTUI {...options} />);
}
