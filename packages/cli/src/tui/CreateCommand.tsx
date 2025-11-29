import React, { useState, useCallback, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { createCommand } from '../commands/create.ts';

interface CreateCommandProps {
  projectName?: string;
  database?: string;
  yes?: boolean;
}

type Step = 'welcome' | 'projectName' | 'database' | 'creating' | 'success' | 'error';

interface CreateState {
  step: Step;
  projectName: string;
  database: string;
  error?: string;
}

export function CreateCommandTUI({ projectName: initialProjectName, database: initialDatabase, yes }: CreateCommandProps) {
  const { exit } = useApp();
  const [state, setState] = useState<CreateState>({
    step: initialProjectName && initialDatabase ? 'creating' : initialProjectName ? 'database' : 'projectName',
    projectName: initialProjectName || '',
    database: initialDatabase || 'none',
  });
  const creatingRef = useRef(false);

  const handleProjectNameSubmit = useCallback((name: string) => {
    if (!name || name.trim().length === 0) {
      return;
    }
    if (!/^[a-z0-9-_]+$/i.test(name)) {
      setState(prev => ({ ...prev, error: 'Project name can only contain letters, numbers, hyphens, and underscores' }));
      return;
    }
    setState(prev => ({ ...prev, projectName: name.trim(), step: 'database', error: undefined }));
  }, []);

  const handleDatabaseSelect = useCallback((item: { value: string }) => {
    setState(prev => ({ ...prev, database: item.value, step: 'creating' }));
  }, []);

  useEffect(() => {
    if (state.step === 'creating' && !creatingRef.current) {
      creatingRef.current = true;
      // Execute the actual creation
      createCommand(state.projectName || undefined, {
        database: state.database,
        yes: yes || false,
      })
        .then(() => {
          setState(prev => ({ ...prev, step: 'success' }));
          // Exit after a short delay to show success message
          setTimeout(() => {
            exit();
          }, 2000);
        })
        .catch((error) => {
          setState(prev => ({ 
            ...prev, 
            step: 'error', 
            error: error instanceof Error ? error.message : String(error)
          }));
          creatingRef.current = false;
        });
    }
  }, [state.step, state.projectName, state.database, yes, exit]);

  // Handle keyboard input for project name
  useInput((input, key) => {
    if (state.step === 'projectName' && key.return) {
      handleProjectNameSubmit(state.projectName);
    }
    if (state.step === 'error' && key.escape) {
      exit();
    }
  });

  if (state.step === 'projectName') {
    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Box flexDirection="column" gap={0}>
          <Text bold color="cyan">
            ✨ Create Yama Project
          </Text>
          <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        </Box>
        <Text bold>What is your project named?</Text>
        <Text color="gray">Default: my-yama-app</Text>
        {state.error && (
          <Text color="red">{state.error}</Text>
        )}
        <TextInput
          value={state.projectName}
          onChange={(value) => setState(prev => ({ ...prev, projectName: value, error: undefined }))}
          onSubmit={handleProjectNameSubmit}
          placeholder="my-yama-app"
        />
        <Text color="dim">Press Enter to continue</Text>
      </Box>
    );
  }

  if (state.step === 'database') {
    const databaseItems = [
      { 
        label: 'None (start simple, add database later)', 
        value: 'none',
      },
      { 
        label: 'PGlite (in-memory PostgreSQL, no setup needed)', 
        value: 'pglite',
      },
      { 
        label: 'PostgreSQL (pure JS, no build tools needed)', 
        value: 'postgresql',
      },
    ];

    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Box flexDirection="column" gap={0}>
          <Text bold color="cyan">
            ✨ Create Yama Project: {state.projectName}
          </Text>
          <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        </Box>
        <Text bold>Which database would you like to use?</Text>
        <SelectInput
          items={databaseItems}
          onSelect={handleDatabaseSelect}
          defaultIndex={databaseItems.findIndex(item => item.value === state.database)}
        />
      </Box>
    );
  }

  if (state.step === 'creating') {
    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Box flexDirection="column" gap={0}>
          <Text bold color="cyan">
            ✨ Creating Yama Project
          </Text>
          <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        </Box>
        <Text>Project: <Text color="yellow">{state.projectName}</Text></Text>
        <Text>Database: <Text color="yellow">{state.database === 'none' ? 'None' : state.database}</Text></Text>
        <Text color="gray">Creating project structure...</Text>
      </Box>
    );
  }

  if (state.step === 'error') {
    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Box flexDirection="column" gap={0}>
          <Text bold color="red">
            ❌ Project Creation Failed
          </Text>
          <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        </Box>
        <Text color="red">{state.error || 'Unknown error occurred'}</Text>
      </Box>
    );
  }

  // Success step - the createCommand already prints success, so we can exit
  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <Box flexDirection="column" gap={0}>
        <Text bold color="green">
          ✅ Project Created Successfully!
        </Text>
        <Text>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
      </Box>
      <Text>Project: <Text color="cyan">{state.projectName}</Text></Text>
      <Text>Database: <Text color="cyan">{state.database === 'none' ? 'None' : state.database}</Text></Text>
      <Text color="gray">Exiting...</Text>
    </Box>
  );
}

export function runCreateTUI(props: CreateCommandProps) {
  render(<CreateCommandTUI {...props} />);
}
