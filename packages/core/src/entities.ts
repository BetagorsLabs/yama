import type { SchemaField, SchemaDefinition, YamaSchemas } from "./schemas.js";

/**
 * Entity field types supported by Yama
 */
export type EntityFieldType = "uuid" | "string" | "number" | "boolean" | "timestamp" | "text" | "jsonb" | "integer";

/**
 * Entity field definition - shorthand syntax is the default
 * Use object syntax only for advanced configuration (dbColumn, dbType, etc.)
 */
export type EntityFieldDefinition = string | EntityField;

/**
 * Entity field definition (parsed/normalized)
 * Shorthand strings are parsed into this format
 */
export interface EntityField {
  type: EntityFieldType;
  dbType?: string; // PostgreSQL-specific type override (e.g., "varchar(255)")
  dbColumn?: string; // Explicit DB column name (for snake_case mapping)
  primary?: boolean;
  generated?: boolean; // Auto-generate (UUID, serial, etc.)
  nullable?: boolean;
  default?: unknown; // Default value or function name (e.g., "now()")
  index?: boolean; // Create index on this field
  unique?: boolean; // Unique constraint
  
  // API schema mapping
  api?: string | false; // API field name or false to exclude
  apiFormat?: string; // Format hint for API (e.g., "date-time")
  
  // API validation rules
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
  
  // Inline relation marker (when field is an entity reference)
  _isInlineRelation?: boolean;
  _inlineRelation?: {
    entity: string;
    relationType: "belongsTo" | "hasMany" | "hasOne" | "manyToMany";
    cascade?: boolean;
    through?: string;
    timestamps?: boolean;
  };
}

/**
 * Relation type definitions
 */
export type RelationType = 
  | `hasMany(${string})` 
  | `belongsTo(${string})` 
  | `hasOne(${string})` 
  | `manyToMany(${string})`;

/**
 * Relation definition
 * Can be shorthand (e.g., "hasMany(Post)") or full object
 */
export type RelationDefinition = string | {
  type: "hasMany" | "belongsTo" | "hasOne" | "manyToMany";
  entity: string;
  foreignKey?: string; // For belongsTo/hasMany
  through?: string; // For manyToMany (junction table)
  localKey?: string; // For manyToMany
  foreignKeyTarget?: string; // For manyToMany
  onDelete?: "cascade" | "setNull" | "restrict" | "noAction"; // For belongsTo/hasMany
};

/**
 * Validation rule
 * Can be a string (e.g., "email", "unique", "minLength(2)") or an object
 */
export type ValidationRule = string | {
  type: string;
  value?: unknown;
  message?: string;
};

/**
 * Computed field definition
 * Can be a string expression or an object with more options
 */
export type ComputedFieldDefinition = string | {
  expression: string;
  type?: EntityFieldType;
  dependsOn?: string[]; // Fields this computed field depends on
};

/**
 * Entity hooks
 */
export interface EntityHooks {
  beforeCreate?: string; // Path to handler file
  afterCreate?: string;
  beforeUpdate?: string;
  afterUpdate?: string;
  beforeDelete?: string;
  afterDelete?: string;
  beforeSave?: string;
  afterSave?: string;
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
 * CRUD configuration for auto-generating endpoints
 */
export interface CrudConfig {
  /**
   * Enable CRUD endpoint generation for this entity
   * Can be:
   * - `true` - Generate all CRUD endpoints (GET, POST, PUT, PATCH, DELETE)
   * - `false` - Don't generate CRUD endpoints
   * - Array of methods to generate (e.g., ["GET", "POST"])
   * - Object with method-specific config:
   *   - Individual methods: { "GET": { auth: { required: false } } }
   *   - Method groups: { "read": { auth: { required: false } }, "write": { auth: { required: true, roles: ["admin"] } } }
   * 
   * Method groups available:
   * - `read` - GET methods
   * - `write` or `mutate` - POST, PUT, PATCH, DELETE methods
   * - `create` - POST method
   * - `update` - PUT, PATCH methods
   * - `delete` - DELETE method
   */
  enabled?: boolean | string[] | Record<string, { auth?: { required?: boolean; roles?: string[] }; path?: string; inputType?: string; responseType?: string }>;
  /**
   * Base path for CRUD endpoints (default: pluralized entity name in lowercase)
   * e.g., "Example" -> "/examples"
   */
  path?: string;
  /**
   * Auth configuration applied to all CRUD endpoints (can be overridden per method or method group)
   */
  auth?: {
    required?: boolean;
    roles?: string[];
    permissions?: string[];
    handler?: string;
  };
  /**
   * Custom input types per HTTP method
   * Overrides the default generated input schemas (e.g., CreateEntityInput, UpdateEntityInput)
   * Example: { POST: "CustomCreateInput", PATCH: "UpdateStatusInput" }
   */
  inputTypes?: Record<string, string>;
  /**
   * Custom response types per HTTP method
   * Use GET_LIST for list endpoints, GET_ONE for single item endpoints
   * Example: { GET_LIST: "TodoSummary", GET_ONE: "TodoDetail", POST: "Todo" }
   */
  responseTypes?: Record<string, string>;
  /**
   * Search configuration for CRUD list endpoints
   * 
   * Simplified syntax options:
   * - `true` - Enable search with smart defaults (all string/text fields, contains mode)
   * - `["field1", "field2"]` - Enable search on specific fields only
   * - `{ fields: [...], mode: "starts", fullText: true }` - Full configuration
   * - `false` - Explicitly disable search (if entity has searchable fields)
   * 
   * If not specified, search is automatically enabled if entity has string/text fields
   */
  search?: boolean | string[] | {
    /**
     * Fields that can be searched (default: all string/text fields)
     * Can be array of field names or true to enable all searchable fields
     */
    fields?: string[] | true;
    /**
     * Search mode: "contains" (default), "starts", "ends", "exact"
     */
    mode?: "contains" | "starts" | "ends" | "exact";
    /**
     * Enable full-text search across multiple fields with a single query parameter
     * Default: true (enabled automatically)
     */
    fullText?: boolean;
  };
  /**
   * Pagination configuration for CRUD list endpoints
   * 
   * Supports all pagination types: offset, page, cursor
   * Default: offset pagination with limit/offset query params
   * 
   * Examples:
   * - `pagination: true` - Enable offset pagination (default)
   * - `pagination: { type: "page" }` - Use page-based pagination
   * - `pagination: { type: "cursor", cursorField: "id" }` - Use cursor pagination
   */
  pagination?: import("./pagination/types.js").PaginationConfig;
}

/**
 * Entity definition
 * Supports both new syntax (with relations, validations, computed, hooks) and legacy syntax
 */
export interface EntityDefinition {
  table: string; // Database table name
  fields: Record<string, EntityFieldDefinition>; // Supports shorthand syntax
  relations?: Record<string, RelationDefinition>; // New: dedicated relations section
  validations?: Record<string, ValidationRule[]>; // New: declarative validations
  computed?: Record<string, ComputedFieldDefinition>; // New: computed fields
  hooks?: EntityHooks; // New: lifecycle hooks
  indexes?: EntityIndex[];
  softDelete?: boolean; // New: enable soft deletes
  apiSchema?: string; // Optional custom API schema name (default: entity name)
  crud?: boolean | CrudConfig; // Optional CRUD endpoint generation
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
  options?: Record<string, unknown>; // Dialect-specific options
}

/**
 * HTTP server configuration
 */
export interface ServerConfig {
  engine?: "fastify"; // Only fastify supported for now, defaults to "fastify"
  options?: Record<string, unknown>; // Engine-specific options
}

/**
 * Parse shorthand field syntax (e.g., "string!", "string?", "enum[user, admin]")
 * Also supports inline relations (e.g., "User!", "Post[]", "Tag[] through:post_tags")
 * and inline constraints (e.g., "string! unique", "string! indexed")
 * Optimized parser - assumes shorthand syntax by default
 */
export function parseFieldDefinition(
  fieldName: string,
  fieldDef: EntityFieldDefinition,
  availableEntities?: Set<string>
): EntityField {
  // Fast path: already parsed
  if (typeof fieldDef !== "string") {
    return fieldDef;
  }

  const field: EntityField = { type: "string" };
  const str = fieldDef.trim();

  // Parse enum syntax: enum[value1, value2, ...]
  const enumMatch = str.match(/^enum\[(.+)\]$/);
  if (enumMatch) {
    const enumValues = enumMatch[1]
      .split(",")
      .map((v) => v.trim().replace(/^["']|["']$/g, ""));
    field.type = "string";
    field.enum = enumValues;
    return field;
  }

  // Check for inline constraints and relation config
  const parts = str.split(/\s+/);
  let baseTypeStr = parts[0];
  const constraints: string[] = [];
  const relationConfig: Record<string, string | boolean> = {};

  // Parse constraints and config from remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part === "unique") {
      constraints.push("unique");
    } else if (part === "indexed" || part === "index") {
      constraints.push("indexed");
    } else if (part === "cascade") {
      relationConfig.cascade = true;
    } else if (part.startsWith("through:")) {
      relationConfig.through = part.substring(8);
    } else if (part === "timestamps:true" || part === "timestamps") {
      relationConfig.timestamps = true;
    }
  }

  // Apply constraints
  if (constraints.includes("unique")) {
    field.unique = true;
  }
  if (constraints.includes("indexed")) {
    field.index = true;
  }

  // Parse type with modifiers: type! (required), type? (nullable)
  let typeStr = baseTypeStr;
  let required = false;
  let nullable = false;
  let isArray = false;

  // Check for array syntax: Entity[]
  if (typeStr.endsWith("[]")) {
    isArray = true;
    typeStr = typeStr.slice(0, -2);
  }

  if (typeStr.endsWith("!")) {
    required = true;
    nullable = false;
    typeStr = typeStr.slice(0, -1);
  } else if (typeStr.endsWith("?")) {
    required = false;
    nullable = true;
    typeStr = typeStr.slice(0, -1);
  }

  // Check if this is an entity reference (capitalized name)
  // Entity names typically start with uppercase letter
  const isEntityReference = /^[A-Z][a-zA-Z0-9]*$/.test(typeStr) && 
    (availableEntities?.has(typeStr) ?? true); // If we have entity list, check it; otherwise assume it's an entity

  if (isEntityReference) {
    // This is an inline relation
    field._isInlineRelation = true;
    
    // Determine relation type based on syntax
    let relationType: "belongsTo" | "hasMany" | "hasOne" | "manyToMany";
    if (isArray) {
      // Could be hasMany or manyToMany - default to manyToMany if through is specified, otherwise hasMany
      relationType = relationConfig.through ? "manyToMany" : "hasMany";
    } else if (nullable && !required) {
      // Single nullable entity reference - likely hasOne
      relationType = "hasOne";
    } else {
      // Single required entity reference - belongsTo
      relationType = "belongsTo";
    }

    field._inlineRelation = {
      entity: typeStr,
      relationType,
      ...(relationConfig.cascade && { cascade: true }),
      ...(relationConfig.through && { through: relationConfig.through as string }),
      ...(relationConfig.timestamps && { timestamps: true }),
    };

    // Return early - this is a relation, not a field
    return field;
  }

  // Parse default value: type = value
  const defaultMatch = typeStr.match(/^(.+?)\s*=\s*(.+)$/);
  if (defaultMatch) {
    typeStr = defaultMatch[1].trim();
    const defaultValue = defaultMatch[2].trim();
    
    // Try to parse default value
    if (defaultValue === "true" || defaultValue === "false") {
      field.default = defaultValue === "true";
    } else if (defaultValue === "now" || defaultValue === "now()") {
      field.default = "now()";
    } else if (!isNaN(Number(defaultValue)) && defaultValue !== "") {
      field.default = Number(defaultValue);
    } else {
      // Remove quotes if present
      field.default = defaultValue.replace(/^["']|["']$/g, "");
    }
  }

  // Map type string to EntityFieldType
  const typeMap: Record<string, EntityFieldType> = {
    string: "string",
    text: "text",
    uuid: "uuid",
    number: "number",
    integer: "integer",
    boolean: "boolean",
    timestamp: "timestamp",
    jsonb: "jsonb",
  };

  field.type = typeMap[typeStr.toLowerCase()] || "string";
  field.required = required;
  field.nullable = nullable;

  return field;
}

/**
 * Parse relation shorthand syntax - optimized for shorthand-first approach
 */
export function parseRelationDefinition(
  relationDef: RelationDefinition
): {
  type: "hasMany" | "belongsTo" | "hasOne" | "manyToMany";
  entity: string;
  foreignKey?: string;
  through?: string;
  localKey?: string;
  foreignKeyTarget?: string;
} {
  // Fast path: already parsed
  if (typeof relationDef !== "string") {
    return relationDef;
  }

  // Optimized regex for common patterns
  const match = relationDef.match(/^(hasMany|belongsTo|hasOne|manyToMany)\((.+)\)$/);
  if (!match) {
    throw new Error(`Invalid relation syntax: ${relationDef}. Use: hasMany(Entity), belongsTo(Entity), hasOne(Entity), or manyToMany(Entity)`);
  }

  return {
    type: match[1] as "hasMany" | "belongsTo" | "hasOne" | "manyToMany",
    entity: match[2].trim(),
  };
}

/**
 * Normalize entity definition - optimized parser for shorthand-first syntax
 * Parses fields and relations on-demand, caching results
 * Extracts inline relations from fields and auto-generates foreign keys
 */
export function normalizeEntityDefinition(
  entityName: string,
  entityDef: EntityDefinition,
  allEntities?: YamaEntities
): Omit<EntityDefinition, "fields" | "relations"> & {
  fields: Record<string, EntityField>;
  relations?: Record<string, ReturnType<typeof parseRelationDefinition>>;
} {
  // Build normalized structure - only copy what we need
  const normalized: Omit<EntityDefinition, "fields" | "relations"> & {
    fields: Record<string, EntityField>;
    relations?: Record<string, ReturnType<typeof parseRelationDefinition>>;
  } = {
    table: entityDef.table,
    indexes: entityDef.indexes,
    apiSchema: entityDef.apiSchema,
    crud: entityDef.crud,
    validations: entityDef.validations,
    computed: entityDef.computed,
    hooks: entityDef.hooks,
    softDelete: entityDef.softDelete,
    fields: {},
  };

  // Build set of available entity names for validation
  const availableEntities = allEntities 
    ? new Set(Object.keys(allEntities))
    : undefined;

  // Parse fields and extract inline relations
  const fieldEntries = Object.entries(entityDef.fields);
  const inlineRelations: Record<string, ReturnType<typeof parseRelationDefinition>> = {};
  
  for (let i = 0; i < fieldEntries.length; i++) {
    const [fieldName, fieldDef] = fieldEntries[i];
    const parsedField = parseFieldDefinition(fieldName, fieldDef, availableEntities);
    
    // Check if this is an inline relation
    if (parsedField._isInlineRelation && parsedField._inlineRelation) {
      const inlineRel = parsedField._inlineRelation;
      
      // Convert inline relation to normalized relation format
      const normalizedRelation: ReturnType<typeof parseRelationDefinition> = {
        type: inlineRel.relationType,
        entity: inlineRel.entity,
      };

      // Add relation-specific config
      if (inlineRel.through) {
        normalizedRelation.through = inlineRel.through;
      }
      if (inlineRel.cascade && inlineRel.relationType === "belongsTo") {
        // For belongsTo, cascade means onDelete: cascade
        normalizedRelation.onDelete = "cascade";
      }

      // Auto-generate foreign key for belongsTo relations
      if (inlineRel.relationType === "belongsTo") {
        const foreignKeyName = `${fieldName}Id`;
        
        // Only auto-generate if foreign key doesn't already exist
        if (!entityDef.fields[foreignKeyName]) {
          normalized.fields[foreignKeyName] = {
            type: "uuid",
            required: !parsedField.nullable,
            nullable: parsedField.nullable,
            index: true, // Auto-index foreign keys
          };
          normalizedRelation.foreignKey = foreignKeyName;
        } else {
          // Foreign key exists, use it
          const fkField = parseFieldDefinition(foreignKeyName, entityDef.fields[foreignKeyName], availableEntities);
          normalized.fields[foreignKeyName] = fkField;
          normalizedRelation.foreignKey = foreignKeyName;
        }
      }

      // Store inline relation
      inlineRelations[fieldName] = normalizedRelation;
    } else {
      // Regular field
      normalized.fields[fieldName] = parsedField;
    }
  }

  // Parse explicit relations if present
  const explicitRelations: Record<string, ReturnType<typeof parseRelationDefinition>> = {};
  if (entityDef.relations) {
    const relationEntries = Object.entries(entityDef.relations);
    for (let i = 0; i < relationEntries.length; i++) {
      const [relationName, relationDef] = relationEntries[i];
      explicitRelations[relationName] = parseRelationDefinition(relationDef);
    }
  }

  // Merge relations: explicit takes precedence over inline
  if (Object.keys(inlineRelations).length > 0 || Object.keys(explicitRelations).length > 0) {
    normalized.relations = {
      ...inlineRelations,
      ...explicitRelations, // Explicit relations override inline ones
    };
  }

  return normalized;
}

/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert entity field type to schema field type
 */
function entityTypeToSchemaType(entityType: EntityFieldType): SchemaField["type"] {
  switch (entityType) {
    case "uuid":
    case "string":
    case "text":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "timestamp":
      return "string";
    case "jsonb":
      return "object";
    default:
      return "string";
  }
}

/**
 * Convert entity field to schema field
 */
function entityFieldToSchemaField(
  fieldName: string,
  entityField: EntityField
): { apiFieldName: string; schemaField: SchemaField } | null {
  // Exclude if api is explicitly false
  if (entityField.api === false) {
    return null;
  }

  // Determine API field name
  const apiFieldName = entityField.api && typeof entityField.api === "string"
    ? entityField.api
    : entityField.dbColumn
    ? snakeToCamel(entityField.dbColumn)
    : fieldName;

  // Convert entity type to schema type
  const schemaType = entityTypeToSchemaType(entityField.type);

  const schemaField: SchemaField = {
    type: schemaType,
    required: entityField.required,
  };

  // Add format for timestamps
  if (entityField.type === "timestamp") {
    schemaField.format = entityField.apiFormat || "date-time";
  }

  // Add validation rules
  if (entityField.minLength !== undefined) {
    schemaField.min = entityField.minLength;
  }
  if (entityField.maxLength !== undefined) {
    schemaField.max = entityField.maxLength;
  }
  if (entityField.min !== undefined) {
    schemaField.min = entityField.min;
  }
  if (entityField.max !== undefined) {
    schemaField.max = entityField.max;
  }
  if (entityField.pattern) {
    schemaField.pattern = entityField.pattern;
  }
  if (entityField.enum) {
    schemaField.enum = entityField.enum;
  }

  // Add default if specified
  if (entityField.default !== undefined) {
    schemaField.default = entityField.default;
  }

  return { apiFieldName, schemaField };
}

/**
 * Convert entity definition to API schema definition
 * Optimized - normalizes once and processes fields efficiently
 */
export function entityToSchema(
  entityName: string,
  entityDef: EntityDefinition,
  entities?: YamaEntities
): SchemaDefinition {
  // Normalize once - all fields become EntityField objects
  const normalized = normalizeEntityDefinition(entityName, entityDef, entities);
  const schemaFields: Record<string, SchemaField> = {};
  const fieldEntries = Object.entries(normalized.fields);

  // Process fields - optimized loop
  for (let i = 0; i < fieldEntries.length; i++) {
    const [fieldName, entityField] = fieldEntries[i];
    const result = entityFieldToSchemaField(fieldName, entityField);
    if (result) {
      schemaFields[result.apiFieldName] = result.schemaField;
    }
  }

  // Computed fields are runtime-only, not in schema
  // They would be resolved dynamically when fetching entities

  return { fields: schemaFields };
}

/**
 * Convert all entities to schemas - optimized batch processing
 */
export function entitiesToSchemas(entities: YamaEntities): YamaSchemas {
  const schemas: YamaSchemas = {};
  const entityEntries = Object.entries(entities);

  // Process all entities in one pass
  for (let i = 0; i < entityEntries.length; i++) {
    const [entityName, entityDef] = entityEntries[i];
    const schemaName = entityDef.apiSchema || entityName;
    schemas[schemaName] = entityToSchema(entityName, entityDef, entities);
  }

  return schemas;
}

/**
 * Merge entity-generated schemas with explicit schemas
 * Explicit schemas take precedence
 */
export function mergeSchemas(
  explicitSchemas: YamaSchemas | undefined,
  entitySchemas: YamaSchemas
): YamaSchemas {
  if (!explicitSchemas) {
    return entitySchemas;
  }

  // Start with entity schemas, then override with explicit schemas
  return {
    ...entitySchemas,
    ...explicitSchemas,
  };
}


