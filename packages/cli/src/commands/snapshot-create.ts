import { existsSync } from "fs";
import { findYamaConfig } from "../utils/project-detection.ts";
import { getConfigDir, readYamaConfig } from "../utils/file-utils.ts";
import {
  createSnapshot,
  saveSnapshot,
  getCurrentSnapshot,
  updateState,
  snapshotExists,
  resolveEnvVars,
  loadEnvFile,
  entitiesToModel,
} from "@betagors/yama-core";
import { info, error, success } from "../utils/cli-utils.ts";
import { confirm } from "../utils/interactive.ts";

interface SnapshotCreateOptions {
  config?: string;
  description?: string;
  env?: string;
}

export async function snapshotCreateCommand(options: SnapshotCreateOptions): Promise<void> {
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  try {
    const environment = options.env || process.env.NODE_ENV || "development";
    loadEnvFile(configPath, environment);
    
    const config = readYamaConfig(configPath) as any;
    const resolvedConfig = resolveEnvVars(config) as any;
    const configDir = getConfigDir(configPath);

    if (!resolvedConfig.entities) {
      error("No entities found in yama.yaml");
      process.exit(1);
    }

    // Get current snapshot
    const currentSnapshotHash = getCurrentSnapshot(configDir, environment);

    // Create snapshot from current entities
    const newSnapshot = createSnapshot(
      resolvedConfig.entities,
      {
        createdAt: new Date().toISOString(),
        createdBy: process.env.USER || "system",
        description: options.description || "Manual snapshot",
      },
      currentSnapshotHash || undefined
    );

    // Check if snapshot already exists
    if (snapshotExists(configDir, newSnapshot.hash)) {
      info(`Snapshot already exists: ${newSnapshot.hash.substring(0, 8)}...`);
      info("No changes detected in schema.");
      return;
    }

    // Confirm creation
    const confirmed = await confirm(
      `Create snapshot ${newSnapshot.hash.substring(0, 8)}...?`,
      true
    );

    if (!confirmed) {
      info("Snapshot creation cancelled.");
      return;
    }

    // Save snapshot
    saveSnapshot(configDir, newSnapshot);
    success(`Snapshot created: ${newSnapshot.hash.substring(0, 8)}...`);

    // Update state
    updateState(configDir, environment, newSnapshot.hash);
    info(`Environment '${environment}' updated to snapshot ${newSnapshot.hash.substring(0, 8)}...`);
  } catch (err) {
    error(`Failed to create snapshot: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
