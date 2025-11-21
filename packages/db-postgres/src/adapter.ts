import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type {
  DatabaseAdapter,
  DatabaseConnection,
} from "@yama/core";
import type { DatabaseConfig, YamaEntities } from "@yama/core";
import { generateDrizzleSchema } from "./drizzle-schema.js";
import { generateMigrationSQL } from "./migrations.js";

let dbClient: ReturnType<typeof drizzle> | null = null;
let sqlClient: ReturnType<typeof postgres> | null = null;

/**
 * PostgreSQL database adapter
 */
export const postgresqlAdapter: DatabaseAdapter = {
  async init(config: DatabaseConfig): Promise<DatabaseConnection> {
    if (dbClient && sqlClient) {
      return { db: dbClient, sql: sqlClient };
    }

    // Create postgres client
    sqlClient = postgres(config.url, {
      max: config.pool?.max || 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ...config.options,
    });

    // Create drizzle instance
    dbClient = drizzle(sqlClient);

    return { db: dbClient, sql: sqlClient };
  },

  getClient(): unknown {
    if (!dbClient) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return dbClient;
  },

  getSQL(): unknown {
    if (!sqlClient) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return sqlClient;
  },

  async close(): Promise<void> {
    if (sqlClient) {
      await sqlClient.end();
      sqlClient = null;
      dbClient = null;
    }
  },

  async generateSchema(entities: YamaEntities): Promise<string> {
    return generateDrizzleSchema(entities);
  },

  async generateMigration(
    entities: YamaEntities,
    migrationName: string
  ): Promise<string> {
    return generateMigrationSQL(entities, migrationName);
  },
};

