import React, { useState, useCallback } from 'react';
import { render, Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import type { DockerComposeConfig, ProjectInfo } from './types.js';

interface Step {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

interface DockerSetupWizardProps {
  projectInfo: ProjectInfo;
  onComplete: (config: DockerComposeConfig) => void;
}

type WizardState = {
  step: number;
  databaseType?: 'postgres' | 'mysql' | 'mariadb' | 'mongodb' | 'none';
  databaseVersion?: string;
  includeDbAdmin?: boolean;
  dbAdminTool?: 'pgadmin' | 'adminer';
  pgAdminVersion?: string;
  adminerVersion?: string;
  includeCache?: boolean;
  redisVersion?: string;
  includeMailpit?: boolean;
  mailpitVersion?: string;
};

const STEPS: Step[] = [
  { id: 'database', title: 'Database Selection', component: DatabaseStep },
  { id: 'dbVersion', title: 'Database Version', component: DatabaseVersionStep },
  { id: 'dbAdmin', title: 'Database Admin Tool', component: DatabaseAdminStep },
  { id: 'cache', title: 'Redis Cache', component: CacheStep },
  { id: 'mailpit', title: 'Mailpit', component: MailpitStep },
  { id: 'summary', title: 'Summary', component: SummaryStep },
];

function DatabaseStep({ state, onUpdate, projectInfo }: any) {
  const items = [
    { label: 'PostgreSQL (recommended)', value: 'postgres' },
    { label: 'MySQL', value: 'mysql' },
    { label: 'MariaDB', value: 'mariadb' },
    { label: 'MongoDB', value: 'mongodb' },
    { label: 'None', value: 'none' },
  ];

  const defaultIndex = projectInfo.databasePlugin ? 0 : 4;

  const handleSelect = useCallback((item: { value: string }) => {
    onUpdate({ databaseType: item.value as any });
  }, [onUpdate]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">🐳 Which database would you like to include?</Text>
      <SelectInput
        items={items}
        onSelect={handleSelect}
        defaultIndex={defaultIndex}
      />
    </Box>
  );
}

function DatabaseVersionStep({ state, onUpdate }: any) {
  const [value, setValue] = useState(state.databaseVersion || getDefaultVersion(state.databaseType));

  function getDefaultVersion(dbType?: string): string {
    if (dbType === 'postgres') return '16-alpine';
    if (dbType === 'mysql') return '8.0';
    if (dbType === 'mariadb') return '11-alpine';
    if (dbType === 'mongodb') return '7';
    return 'latest';
  }

  useInput((input, key) => {
    if (key.return) {
      onUpdate({ databaseVersion: value || getDefaultVersion(state.databaseType) });
    }
  });

  if (!state.databaseType || state.databaseType === 'none') {
    return null;
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">📦 Database version (press Enter to use default):</Text>
      <Text color="gray">Default: {getDefaultVersion(state.databaseType)}</Text>
      <TextInput
        value={value}
        onChange={setValue}
        placeholder={getDefaultVersion(state.databaseType)}
      />
      <Text color="dim">Press Enter to continue</Text>
    </Box>
  );
}

function DatabaseAdminStep({ state, onUpdate }: any) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToolSelect, setShowToolSelect] = useState(false);

  useInput((input, key) => {
    if (state.databaseType && state.databaseType !== 'none' && state.databaseType !== 'mongodb') {
      if (!showConfirm && !showToolSelect) {
        if (input.toLowerCase() === 'y') {
          setShowConfirm(true);
          onUpdate({ includeDbAdmin: true });
          setShowToolSelect(true);
        } else if (input.toLowerCase() === 'n') {
          onUpdate({ includeDbAdmin: false });
        }
      }
    }
  });

  if (!state.databaseType || state.databaseType === 'none' || state.databaseType === 'mongodb') {
    return null;
  }

  if (!showConfirm) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color="cyan">🛠️  Include database admin tool? (y/n)</Text>
        <Text color="gray">Default: Yes</Text>
      </Box>
    );
  }

  if (showToolSelect && !state.dbAdminTool) {
    const items = state.databaseType === 'postgres'
      ? [
          { label: 'pgAdmin (PostgreSQL only)', value: 'pgadmin' },
          { label: 'Adminer (PostgreSQL, MySQL, MariaDB)', value: 'adminer' },
        ]
      : [{ label: 'Adminer (PostgreSQL, MySQL, MariaDB)', value: 'adminer' }];

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color="cyan">🔧 Which admin tool?</Text>
        <SelectInput
          items={items}
          onSelect={(item) => {
            onUpdate({ dbAdminTool: item.value });
            if (item.value === 'pgadmin') {
              onUpdate({ pgAdminVersion: 'latest' });
            } else {
              onUpdate({ adminerVersion: 'latest' });
            }
          }}
        />
      </Box>
    );
  }

  return null;
}

function CacheStep({ state, onUpdate, projectInfo }: any) {
  useInput((input, key) => {
    if (input.toLowerCase() === 'y') {
      onUpdate({ includeCache: true, redisVersion: '7-alpine' });
    } else if (input.toLowerCase() === 'n') {
      onUpdate({ includeCache: false });
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">⚡ Include Redis cache? (y/n)</Text>
      <Text color="gray">Default: {projectInfo.redisPlugin ? 'Yes' : 'No'}</Text>
    </Box>
  );
}

function MailpitStep({ state, onUpdate }: any) {
  useInput((input, key) => {
    if (input.toLowerCase() === 'y') {
      onUpdate({ includeMailpit: true, mailpitVersion: 'latest' });
    } else if (input.toLowerCase() === 'n') {
      onUpdate({ includeMailpit: false });
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">📧 Include Mailpit for email testing? (y/n)</Text>
      <Text color="gray">Default: No</Text>
    </Box>
  );
}

function SummaryStep({ state, onComplete }: any) {
  const config: DockerComposeConfig = {};

  // Build config from state
  if (state.databaseType && state.databaseType !== 'none') {
    config.includeDatabase = true;
    config.databaseType = state.databaseType;
    if (state.databaseVersion) {
      config.databaseVersion = state.databaseVersion;
    }
    if (state.includeDbAdmin) {
      if (state.dbAdminTool === 'pgadmin') {
        config.includePgAdmin = true;
        if (state.pgAdminVersion) {
          config.pgAdminVersion = state.pgAdminVersion;
        }
      } else if (state.dbAdminTool === 'adminer') {
        config.includeAdminer = true;
        if (state.adminerVersion) {
          config.adminerVersion = state.adminerVersion;
        }
      }
    }
  }

  if (state.includeCache) {
    config.includeRedis = true;
    if (state.redisVersion) {
      config.redisVersion = state.redisVersion;
    }
  }

  if (state.includeMailpit) {
    config.includeMailpit = true;
    if (state.mailpitVersion) {
      config.mailpitVersion = state.mailpitVersion;
    }
  }

  useInput((input, key) => {
    if (key.return) {
      onComplete(config);
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="green">✅ Configuration Summary</Text>
      <Box flexDirection="column" gap={0}>
        {config.includeDatabase && (
          <Text>  ✓ Database: {config.databaseType}</Text>
        )}
        {config.includePgAdmin && (
          <Text>  ✓ pgAdmin: http://localhost:5050</Text>
        )}
        {config.includeAdminer && (
          <Text>  ✓ Adminer: http://localhost:8080</Text>
        )}
        {config.includeRedis && (
          <Text>  ✓ Redis: localhost:6379</Text>
        )}
        {config.includeMailpit && (
          <Text>  ✓ Mailpit: http://localhost:8025</Text>
        )}
      </Box>
      <Text color="dim">Press Enter to confirm</Text>
    </Box>
  );
}

export function DockerSetupWizard({ projectInfo, onComplete }: DockerSetupWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 0,
    databaseType: projectInfo.databasePlugin ? 'postgres' : undefined,
  });

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      
      // Auto-advance steps when conditions are met
      if (prev.step === 0 && newState.databaseType !== undefined) {
        newState.step = 1;
      } else if (prev.step === 1 && (newState.databaseVersion !== undefined || newState.databaseType === 'none')) {
        newState.step = newState.databaseType === 'none' ? 3 : 2;
      } else if (prev.step === 2 && (newState.dbAdminTool !== undefined || newState.includeDbAdmin === false)) {
        newState.step = 3;
      } else if (prev.step === 3 && newState.includeCache !== undefined) {
        newState.step = 4;
      } else if (prev.step === 4 && newState.includeMailpit !== undefined) {
        newState.step = 5;
      }
      
      return newState;
    });
  }, []);

  const CurrentStep = STEPS[state.step]?.component;

  if (!CurrentStep) {
    return null;
  }

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          🐳 Docker Compose Setup Wizard - Step {state.step + 1}/{STEPS.length}
        </Text>
      </Box>
      <CurrentStep
        state={state}
        onUpdate={updateState}
        projectInfo={projectInfo}
        onComplete={onComplete}
      />
    </Box>
  );
}

/**
 * Run Ink-based interactive Docker Compose setup
 */
export async function interactiveDockerComposeSetupInk(
  projectInfo: ProjectInfo
): Promise<DockerComposeConfig> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <DockerSetupWizard
        projectInfo={projectInfo}
        onComplete={(config) => {
          unmount();
          resolve(config);
        }}
      />
    );
  });
}
