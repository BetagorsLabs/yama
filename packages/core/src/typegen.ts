import type { SchemaField, SchemaDefinition, YamaSchemas } from "./schemas.js";
import type { YamaEntities } from "./entities.js";
import { entitiesToSchemas, mergeSchemas } from "./entities.js";

/**
 * Endpoint definition for handler context generation
 */
export interface EndpointDefinition {
  path: string;
  method: string;
  handler?: string;
  description?: string;
  params?: Record<string, SchemaField>;
  query?: Record<string, SchemaField>;
  body?: {
    type?: string;
  };
  response?: {
    type?: string;
  };
  auth?: {
    required?: boolean;
    roles?: string[];
  };
}

/**
 * Yama config for handler context generation
 */
export interface HandlerContextConfig {
  schemas?: YamaSchemas;
  entities?: YamaEntities;
  endpoints?: EndpointDefinition[];
}

/**
 * Available services configuration for handler context generation
 */
export interface AvailableServices {
  db?: boolean; // Database adapter available
  entities?: boolean; // Entity repositories available
  cache?: boolean; // Cache adapter available
  storage?: boolean; // Storage buckets available
  realtime?: boolean; // Realtime adapter available
}

/**
 * Convert a Yama schema field to TypeScript type string
 */
function fieldToTypeScript(
  field: SchemaField,
  indent = 0,
  schemas?: YamaSchemas,
  visited: Set<string> = new Set()
): string {
  const spaces = "  ".repeat(indent);
  
  // Handle schema references
  if (field.$ref) {
    if (visited.has(field.$ref)) {
      throw new Error(`Circular reference detected in type generation: ${field.$ref}`);
    }
    
    if (!schemas || !schemas[field.$ref]) {
      throw new Error(`Schema reference "${field.$ref}" not found in type generation`);
    }
    
    // Return the referenced schema name directly
    return field.$ref;
  }
  
  // Type is required if $ref is not present
  if (!field.type) {
    throw new Error(`Field must have either a type or $ref`);
  }
  
  switch (field.type) {
    case "string":
      // Handle enum types
      if (field.enum && Array.isArray(field.enum)) {
        const enumValues = field.enum
          .map((val) => (typeof val === "string" ? `"${val}"` : String(val)))
          .join(" | ");
        return enumValues;
      }
      return "string";
    
    case "number":
    case "integer":
      // Handle enum types for numbers
      if (field.enum && Array.isArray(field.enum)) {
        const enumValues = field.enum.map((val) => String(val)).join(" | ");
        return enumValues;
      }
      return "number";
    
    case "boolean":
      // Handle enum types for booleans
      if (field.enum && Array.isArray(field.enum)) {
        const enumValues = field.enum.map((val) => String(val)).join(" | ");
        return enumValues;
      }
      return "boolean";
    
    case "array":
      if (field.items) {
        const itemType = fieldToTypeScript(field.items, indent, schemas, visited);
        return `${itemType}[]`;
      }
      return "unknown[]";
    
    case "object":
      if (field.properties) {
        const props: string[] = [];
        for (const [propName, propField] of Object.entries(field.properties)) {
          const propType = fieldToTypeScript(propField, indent + 1, schemas, visited);
          const optional = propField.required ? "" : "?";
          props.push(`${spaces}  ${propName}${optional}: ${propType};`);
        }
        return `{\n${props.join("\n")}\n${spaces}}`;
      }
      return "Record<string, unknown>";
    
    default:
      return "unknown";
  }
}

/**
 * Generate TypeScript type definition for a schema
 */
function generateSchemaType(
  schemaName: string,
  schemaDef: SchemaDefinition,
  schemas?: YamaSchemas,
  visited: Set<string> = new Set()
): string {
  const fields: string[] = [];
  
  for (const [fieldName, field] of Object.entries(schemaDef.fields)) {
    const fieldType = fieldToTypeScript(field, 1, schemas, visited);
    const optional = field.required ? "" : "?";
    fields.push(`  ${fieldName}${optional}: ${fieldType};`);
  }
  
  return `export interface ${schemaName} {\n${fields.join("\n")}\n}`;
}

/**
 * Generate TypeScript types from Yama schemas and entities
 */
export function generateTypes(
  schemas?: YamaSchemas,
  entities?: YamaEntities
): string {
  const imports = `// This file is auto-generated from yama.yaml
// Do not edit manually - your changes will be overwritten

`;

  // Convert entities to schemas and merge with explicit schemas
  const entitySchemas = entities ? entitiesToSchemas(entities) : {};
  const allSchemas = mergeSchemas(schemas, entitySchemas);

  const typeDefinitions: string[] = [];
  
  for (const [schemaName, schemaDef] of Object.entries(allSchemas)) {
    typeDefinitions.push(generateSchemaType(schemaName, schemaDef, allSchemas));
  }
  
  return imports + typeDefinitions.join("\n\n") + "\n";
}

/**
 * Convert handler name to TypeScript interface name
 */
function handlerNameToInterfaceName(handlerName: string): string {
  // Convert camelCase to PascalCase and add "HandlerContext" suffix
  const pascalCase = handlerName.charAt(0).toUpperCase() + handlerName.slice(1);
  return `${pascalCase}HandlerContext`;
}

/**
 * Generate TypeScript type for params/query from endpoint definition
 */
function generateParamsOrQueryType(
  fields: Record<string, SchemaField> | undefined,
  schemas?: YamaSchemas,
  visited: Set<string> = new Set(),
  useTypesNamespace: boolean = false
): string {
  if (!fields || Object.keys(fields).length === 0) {
    return "{}";
  }

  const props: string[] = [];
  for (const [fieldName, field] of Object.entries(fields)) {
    let fieldType = fieldToTypeScript(field, 0, schemas, visited);
    
    // If using Types namespace and field is a $ref, prefix with Types.
    if (useTypesNamespace && field.$ref) {
      fieldType = `Types.${fieldType}`;
    }
    
    const optional = field.required ? "" : "?";
    props.push(`  ${fieldName}${optional}: ${fieldType};`);
  }

  return `{\n${props.join("\n")}\n}`;
}

/**
 * Generate handler context types from Yama config
 */
export function generateHandlerContexts(
  config: HandlerContextConfig,
  typesImportPath: string = "../types",
  handlerContextImportPath: string = "@betagors/yama-core",
  repositoryTypesImportPath?: string,
  availableServices?: AvailableServices
): string {
  // Determine which services are available
  // Services are only available if both the plugin is configured AND the service is actually used
  const hasDb = availableServices?.db ?? false;
  const hasEntities = (availableServices?.entities ?? false) && (config.entities && Object.keys(config.entities).length > 0);
  const hasCache = availableServices?.cache ?? false;
  const hasStorage = availableServices?.storage ?? false;
  const hasRealtime = availableServices?.realtime ?? false;

  // Generate entities type if entities exist
  let entitiesType = "Record<string, unknown>";
  let repositoryTypesImport = "";
  
  if (config.entities && Object.keys(config.entities).length > 0) {
    const entityNames = Object.keys(config.entities);
    
    // Add import for repository types if path is provided
    if (repositoryTypesImportPath) {
      repositoryTypesImport = `import type { ${entityNames.map(name => `${name}RepositoryMethods`).join(", ")} } from "${repositoryTypesImportPath}";\n`;
      const entityRepositories = entityNames.map(name => {
        return `  ${name}: ${name}RepositoryMethods;`;
      }).join("\n");
      entitiesType = `{\n${entityRepositories}\n}`;
    } else {
      // Fallback: use Record with entity names as keys when repository types aren't available
      const entityRepositories = entityNames.map(name => {
        return `  ${name}: any;`;
      }).join("\n");
      entitiesType = `{\n${entityRepositories}\n}`;
    }
  }

  // Determine if we need to import DatabaseAdapter
  const needsDbImport = hasDb;
  const dbImport = needsDbImport ? `import type { DatabaseAdapter } from "${handlerContextImportPath}";\n` : "";

  const imports = `// This file is auto-generated from yama.yaml
// Do not edit manually - your changes will be overwritten

import type { HandlerContext } from "${handlerContextImportPath}";
${dbImport}import type * as Types from "${typesImportPath}";
${repositoryTypesImport}
`;

  if (!config.endpoints || config.endpoints.length === 0) {
    return imports + "// No endpoints defined\n";
  }

  // Convert entities to schemas and merge with explicit schemas
  const entitySchemas = config.entities ? entitiesToSchemas(config.entities) : {};
  const allSchemas = mergeSchemas(config.schemas, entitySchemas);

  // Group endpoints by handler name (in case multiple endpoints use same handler)
  const handlerEndpoints = new Map<string, EndpointDefinition[]>();
  
  for (const endpoint of config.endpoints) {
    if (endpoint.handler) {
      const existing = handlerEndpoints.get(endpoint.handler) || [];
      existing.push(endpoint);
      handlerEndpoints.set(endpoint.handler, existing);
    }
  }

  if (handlerEndpoints.size === 0) {
    return imports + "// No handlers defined in endpoints\n";
  }

  const contextInterfaces: string[] = [];

  for (const [handlerName, endpoints] of handlerEndpoints.entries()) {
    // Use the first endpoint for type generation (if multiple, they should have compatible types)
    const endpoint = endpoints[0];
    const interfaceName = handlerNameToInterfaceName(handlerName);

    // Generate body type
    let bodyType = "unknown";
    if (endpoint.body?.type) {
      const bodySchemaType = endpoint.body.type;
      // Check if it's a schema reference
      if (allSchemas[bodySchemaType]) {
        bodyType = `Types.${bodySchemaType}`;
      } else {
        bodyType = bodySchemaType;
      }
    }

    // Generate params type
    const paramsType = generateParamsOrQueryType(endpoint.params, allSchemas, new Set(), true);

    // Generate query type
    const queryType = generateParamsOrQueryType(endpoint.query, allSchemas, new Set(), true);

    // Generate response type (for return type hint)
    let responseType = "unknown";
    if (endpoint.response?.type) {
      const responseSchemaType = endpoint.response.type;
      if (allSchemas[responseSchemaType]) {
        responseType = `Types.${responseSchemaType}`;
      } else {
        responseType = responseSchemaType;
      }
    }

    // Build the properties to include based on available services
    const properties: string[] = [
      `  body: ${bodyType};`,
      `  params: ${paramsType};`,
      `  query: ${queryType};`
    ];

    // Add services only if they're available
    if (hasDb) {
      properties.push(`  db: DatabaseAdapter;`);
    }
    if (hasEntities) {
      properties.push(`  entities: ${entitiesType};`);
    }
    if (hasCache) {
      properties.push(`  cache: NonNullable<HandlerContext['cache']>;`);
    }
    if (hasStorage) {
      properties.push(`  storage: NonNullable<HandlerContext['storage']>;`);
    }
    if (hasRealtime) {
      properties.push(`  realtime: NonNullable<HandlerContext['realtime']>;`);
    }

    // Build the interface with Omit to exclude optional properties that we're making required
    const omitProperties: string[] = [];
    if (hasDb) omitProperties.push("'db'");
    if (hasEntities) omitProperties.push("'entities'");
    if (hasCache) omitProperties.push("'cache'");
    if (hasStorage) omitProperties.push("'storage'");
    if (hasRealtime) omitProperties.push("'realtime'");

    const omitType = omitProperties.length > 0 
      ? `Omit<HandlerContext, ${omitProperties.join(" | ")}>`
      : "HandlerContext";

    const interfaceDef = `export interface ${interfaceName} extends ${omitType} {
${properties.join("\n")}
}`;

    contextInterfaces.push(interfaceDef);
  }

  return imports + contextInterfaces.join("\n\n") + "\n";
}

