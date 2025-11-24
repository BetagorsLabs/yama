import type { SchemaDefinition, YamaSchemas } from "./schemas";
/**
 * Entity field types supported by Yama
 */
export type EntityFieldType = "uuid" | "string" | "number" | "boolean" | "timestamp" | "text" | "jsonb" | "integer";
/**
 * Entity field definition
 */
export interface EntityField {
    type: EntityFieldType;
    dbType?: string;
    dbColumn?: string;
    primary?: boolean;
    generated?: boolean;
    nullable?: boolean;
    default?: unknown;
    index?: boolean;
    api?: string | false;
    apiFormat?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: unknown[];
}
/**
 * Entity index definition
 */
export interface EntityIndex {
    fields: string[];
    name?: string;
    unique?: boolean;
}
/**
 * Entity definition
 */
export interface EntityDefinition {
    table: string;
    fields: Record<string, EntityField>;
    indexes?: EntityIndex[];
    apiSchema?: string;
}
/**
 * Collection of entity definitions
 */
export interface YamaEntities {
    [entityName: string]: EntityDefinition;
}
/**
 * Database connection configuration
 */
export interface DatabaseConfig {
    dialect: "postgresql" | "pglite";
    /**
     * Database connection URL.
     * For PostgreSQL: use a standard postgresql:// connection string.
     * For PGlite: use ":memory:" for in-memory, or a path for persistent storage.
     * Optional for PGlite (defaults to .yama/data/db/pglite for persistent storage).
     */
    url?: string;
    pool?: {
        min?: number;
        max?: number;
    };
    options?: Record<string, unknown>;
}
/**
 * HTTP server configuration
 */
export interface ServerConfig {
    engine?: "fastify";
    options?: Record<string, unknown>;
}
/**
 * Convert entity definition to API schema definition
 */
export declare function entityToSchema(entityName: string, entityDef: EntityDefinition, entities?: YamaEntities): SchemaDefinition;
/**
 * Convert all entities to schemas
 */
export declare function entitiesToSchemas(entities: YamaEntities): YamaSchemas;
/**
 * Merge entity-generated schemas with explicit schemas
 * Explicit schemas take precedence
 */
export declare function mergeSchemas(explicitSchemas: YamaSchemas | undefined, entitySchemas: YamaSchemas): YamaSchemas;
