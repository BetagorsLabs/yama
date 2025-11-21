import type { YamaEntities, EntityDefinition, EntityField } from "@yama/core";

/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Get API field name from entity field
 */
function getApiFieldName(fieldName: string, field: EntityField): string | null {
  if (field.api === false) {
    return null;
  }
  if (field.api && typeof field.api === "string") {
    return field.api;
  }
  if (field.dbColumn) {
    return snakeToCamel(field.dbColumn);
  }
  return fieldName;
}

/**
 * Get database column name from entity field
 */
function getDbColumnName(fieldName: string, field: EntityField): string {
  return field.dbColumn || fieldName;
}

/**
 * Get all queryable fields from entity (exclude generated/primary fields for queries)
 */
function getQueryableFields(entityDef: EntityDefinition): Array<{ fieldName: string; apiFieldName: string; dbColumnName: string; field: EntityField }> {
  const fields: Array<{ fieldName: string; apiFieldName: string; dbColumnName: string; field: EntityField }> = [];
  
  for (const [fieldName, field] of Object.entries(entityDef.fields)) {
    const apiFieldName = getApiFieldName(fieldName, field);
    if (apiFieldName && !field.generated) {
      fields.push({
        fieldName,
        apiFieldName,
        dbColumnName: getDbColumnName(fieldName, field),
        field
      });
    }
  }
  
  return fields;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate repository class for a single entity
 */
function generateRepositoryClass(
  entityName: string,
  entityDef: EntityDefinition,
  typesImportPath: string
): string {
  const tableName = entityName.toLowerCase();
  const apiSchemaName = entityDef.apiSchema || entityName;
  const createInputName = `Create${apiSchemaName}Input`;
  const updateInputName = `Update${apiSchemaName}Input`;
  
  const mapperToEntity = `map${apiSchemaName}To${entityName}Entity`;
  const mapperFromEntity = `map${entityName}EntityTo${apiSchemaName}`;
  
  const queryableFields = getQueryableFields(entityDef);
  const primaryField = Object.entries(entityDef.fields).find(([, f]) => f.primary);
  const primaryFieldName = primaryField ? primaryField[0] : 'id';
  const primaryDbColumn = primaryField ? getDbColumnName(primaryField[0], primaryField[1]) : 'id';
  const primaryApiField = primaryField ? getApiFieldName(primaryField[0], primaryField[1]) || primaryField[0] : 'id';
  
  // Generate field metadata for runtime parsing
  const fieldMetadata = queryableFields.map(f => ({
    apiName: f.apiFieldName,
    dbColumn: f.dbColumnName,
    type: f.field.type
  }));
  
  return `import { postgresqlAdapter } from "@yama/db-postgres";
import { ${tableName} } from "./schema.js";
import { ${mapperToEntity}, ${mapperFromEntity} } from "./mapper.js";
import { eq, and, or, like, ilike, gt, lt, gte, lte, desc, asc } from "drizzle-orm";
import type { ${apiSchemaName}, ${createInputName}, ${updateInputName} } from "${typesImportPath}";
import type { ReturnType } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/postgres-js";

type Database = ReturnType<typeof drizzle>;

function getDb(): Database {
  try {
    return postgresqlAdapter.getClient() as Database;
  } catch (error) {
    throw new Error("Database not initialized - ensure database is configured in yama.yaml");
  }
}

// Field metadata for dynamic query parsing
const FIELD_METADATA = ${JSON.stringify(fieldMetadata, null, 2)};
const PRIMARY_FIELD = ${JSON.stringify({ apiName: primaryApiField, dbColumn: primaryDbColumn })};

/**
 * Parse method name into query conditions
 */
function parseMethodName(methodName: string): { conditions: any[]; orderBy?: any; returnsArray: boolean } | null {
  if (!methodName.startsWith('find')) {
    return null;
  }
  
  const conditions: any[] = [];
  let orderBy: any = undefined;
  let returnsArray = true;
  
  // Check if returns single item
  if (methodName.includes('One') || methodName.includes('First') || methodName.includes('ById')) {
    returnsArray = false;
  }
  
  // Extract query part
  let queryPart = methodName.replace(/^find/, '');
  
  // Parse OrderBy
  const orderByMatch = queryPart.match(/OrderBy(\\w+)(Desc|Asc)/i);
  if (orderByMatch) {
    const orderField = orderByMatch[1];
    const direction = orderByMatch[2].toLowerCase() === 'desc' ? 'desc' : 'asc';
    const fieldInfo = FIELD_METADATA.find(f => 
      f.apiName.toLowerCase() === orderField.toLowerCase()
    );
    if (fieldInfo) {
      orderBy = { field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, direction };
    }
    queryPart = queryPart.replace(/OrderBy\\w+(Desc|Asc)/i, '');
  }
  
  // Split by And
  const parts = queryPart.split(/And/);
  
  for (const part of parts) {
    if (!part) continue;
    
    // IsTrue/IsFalse
    const isTrueMatch = part.match(/^(\\w+)IsTrue$/i);
    const isFalseMatch = part.match(/^(\\w+)IsFalse$/i);
    
    if (isTrueMatch) {
      const fieldName = isTrueMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo && fieldInfo.type === 'boolean') {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: '=', value: true });
        continue;
      }
    }
    
    if (isFalseMatch) {
      const fieldName = isFalseMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo && fieldInfo.type === 'boolean') {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: '=', value: false });
        continue;
      }
    }
    
    // Contains
    const containsMatch = part.match(/^(\\w+)Contains$/i);
    if (containsMatch) {
      const fieldName = containsMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo) {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: 'ilike', isParameter: true });
        continue;
      }
    }
    
    // StartsWith
    const startsWithMatch = part.match(/^(\\w+)StartsWith$/i);
    if (startsWithMatch) {
      const fieldName = startsWithMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo) {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: 'startsWith', isParameter: true });
        continue;
      }
    }
    
    // EndsWith
    const endsWithMatch = part.match(/^(\\w+)EndsWith$/i);
    if (endsWithMatch) {
      const fieldName = endsWithMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo) {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: 'endsWith', isParameter: true });
        continue;
      }
    }
    
    // After/Before
    const afterMatch = part.match(/^(\\w+)After$/i);
    const beforeMatch = part.match(/^(\\w+)Before$/i);
    
    if (afterMatch) {
      const fieldName = afterMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo) {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: '>', isParameter: true });
        continue;
      }
    }
    
    if (beforeMatch) {
      const fieldName = beforeMatch[1];
      const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
      if (fieldInfo) {
        conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: '<', isParameter: true });
        continue;
      }
    }
    
    // Equals or just field name
    const equalsMatch = part.match(/^(\\w+)Equals$/i);
    const fieldName = equalsMatch ? equalsMatch[1] : part;
    const fieldInfo = FIELD_METADATA.find(f => f.apiName.toLowerCase() === fieldName.toLowerCase());
    
    if (fieldInfo) {
      conditions.push({ field: fieldInfo.apiName, dbColumn: fieldInfo.dbColumn, operator: '=', isParameter: true });
    }
  }
  
  if (conditions.length === 0) {
    return null;
  }
  
  return { conditions, orderBy, returnsArray };
}

/**
 * Execute dynamic query
 */
async function executeDynamicQuery(methodName: string, args: any[]): Promise<any> {
  const parsed = parseMethodName(methodName);
  if (!parsed) {
    throw new Error(\`Method \${methodName} not found\`);
  }
  
  const db = getDb();
  let query = db.select().from(${tableName});
  
  const drizzleConditions: any[] = [];
  let argIndex = 0;
  
  for (const condition of parsed.conditions) {
    const column = ${tableName}[condition.dbColumn];
    if (!column) continue;
    
    if (condition.value !== undefined) {
      // Fixed value (IsTrue/IsFalse)
      drizzleConditions.push(eq(column, condition.value));
    } else if (condition.isParameter) {
      // Parameter value
      if (argIndex >= args.length) {
        throw new Error(\`Method \${methodName} requires \${parsed.conditions.filter(c => c.isParameter).length} argument(s)\`);
      }
      const value = args[argIndex++];
      
      switch (condition.operator) {
        case '=':
          drizzleConditions.push(eq(column, value));
          break;
        case '>':
          drizzleConditions.push(gt(column, value));
          break;
        case '<':
          drizzleConditions.push(lt(column, value));
          break;
        case 'ilike':
          drizzleConditions.push(ilike(column, \`%\${value}%\`));
          break;
        case 'startsWith':
          drizzleConditions.push(ilike(column, \`\${value}%\`));
          break;
        case 'endsWith':
          drizzleConditions.push(ilike(column, \`%\${value}\`));
          break;
        default:
          drizzleConditions.push(eq(column, value));
      }
    }
  }
  
  if (drizzleConditions.length > 0) {
    query = query.where(and(...drizzleConditions)) as any;
  }
  
  if (parsed.orderBy) {
    const orderColumn = ${tableName}[parsed.orderBy.dbColumn] || ${tableName}.${primaryDbColumn};
    query = query.orderBy(parsed.orderBy.direction === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  }
  
  if (!parsed.returnsArray) {
    query = query.limit(1) as any;
  }
  
  const entities = await query;
  const results = entities.map(${mapperFromEntity});
  
  return parsed.returnsArray ? results : (results[0] || null);
}

export class ${entityName}Repository {
  /**
   * Create a new ${apiSchemaName}
   */
  async create(input: ${createInputName}): Promise<${apiSchemaName}> {
    const db = getDb();
    const entityData = ${mapperToEntity}(input as any);
    const [entity] = await db.insert(${tableName}).values(entityData).returning();
    return ${mapperFromEntity}(entity);
  }

  /**
   * Find ${apiSchemaName} by ID
   */
  async findById(id: string): Promise<${apiSchemaName} | null> {
    const db = getDb();
    const [entity] = await db.select().from(${tableName}).where(eq(${tableName}.${primaryDbColumn}, id)).limit(1);
    if (!entity) return null;
    return ${mapperFromEntity}(entity);
  }

  /**
   * Find all ${apiSchemaName} records
   */
  async findAll(options?: {
${queryableFields.map(f => {
  const tsType = f.field.type === 'boolean' ? 'boolean' : 
                f.field.type === 'number' || f.field.type === 'integer' ? 'number' : 'string';
  return `    ${f.apiFieldName}?: ${tsType};`;
}).join('\n')}
    limit?: number;
    offset?: number;
    orderBy?: { field: string; direction?: 'asc' | 'desc' };
  }): Promise<${apiSchemaName}[]> {
    const db = getDb();
    let query = db.select().from(${tableName});
    
    const conditions: any[] = [];
${queryableFields.map(f => {
  const dbCol = f.dbColumnName;
  return `    if (options?.${f.apiFieldName} !== undefined) {
      conditions.push(eq(${tableName}.${dbCol}, options.${f.apiFieldName}));
    }`;
}).join('\n')}
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    if (options?.orderBy) {
      const orderField = ${tableName}[options.orderBy.field] || ${tableName}.${primaryDbColumn};
      query = query.orderBy(options.orderBy.direction === 'desc' ? desc(orderField) : asc(orderField)) as any;
    }
    
    if (options?.limit !== undefined) {
      query = query.limit(options.limit) as any;
    }
    
    if (options?.offset !== undefined) {
      query = query.offset(options.offset) as any;
    }
    
    const entities = await query;
    return entities.map(${mapperFromEntity});
  }

  /**
   * Update ${apiSchemaName} by ID
   */
  async update(id: string, input: ${updateInputName}): Promise<${apiSchemaName} | null> {
    const db = getDb();
    const entityData = ${mapperToEntity}(input as any);
    const [entity] = await db.update(${tableName})
      .set(entityData)
      .where(eq(${tableName}.${primaryDbColumn}, id))
      .returning();
    
    if (!entity) return null;
    return ${mapperFromEntity}(entity);
  }

  /**
   * Delete ${apiSchemaName} by ID
   */
  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(${tableName}).where(eq(${tableName}.${primaryDbColumn}, id)).returning();
    return result.length > 0;
  }
}

// Create proxied instance to handle dynamic method calls
const baseRepository = new ${entityName}Repository();
export const ${entityName.toLowerCase()}Repository = new Proxy(baseRepository, {
  get(target: any, prop: string | symbol) {
    // If method exists on the class, use it
    if (target[prop] && typeof target[prop] === 'function') {
      return target[prop].bind(target);
    }
    
    // Otherwise, try to parse as dynamic query method
    if (typeof prop === 'string' && prop.startsWith('find')) {
      return async (...args: any[]) => {
        return executeDynamicQuery(prop, args);
      };
    }
    
    return target[prop];
  }
});
`;
}

/**
 * Generate type definitions for repository methods
 */
function generateRepositoryTypes(
  entityName: string,
  entityDef: EntityDefinition,
  typesImportPath: string
): string {
  const apiSchemaName = entityDef.apiSchema || entityName;
  const createInputName = `Create${apiSchemaName}Input`;
  const updateInputName = `Update${apiSchemaName}Input`;
  
  const queryableFields = getQueryableFields(entityDef);
  const primaryField = Object.entries(entityDef.fields).find(([, f]) => f.primary);
  const primaryFieldName = primaryField ? getApiFieldName(primaryField[0], primaryField[1]) || primaryField[0] : 'id';
  
  // Generate method signatures for common patterns
  const methodSignatures: string[] = [];
  
  // Standard CRUD
  methodSignatures.push(`  create(input: ${createInputName}): Promise<${apiSchemaName}>;`);
  methodSignatures.push(`  findById(id: string): Promise<${apiSchemaName} | null>;`);
  methodSignatures.push(`  findAll(options?: FindAllOptions): Promise<${apiSchemaName}[]>;`);
  methodSignatures.push(`  update(id: string, input: ${updateInputName}): Promise<${apiSchemaName} | null>;`);
  methodSignatures.push(`  delete(id: string): Promise<boolean>;`);
  methodSignatures.push('');
  
  // Generate dynamic method signatures
  // Single field queries
  for (const field of queryableFields) {
    const fieldType = field.field.type === 'boolean' ? 'boolean' : 
                     field.field.type === 'number' || field.field.type === 'integer' ? 'number' : 'string';
    
    // findBy{Field}
    methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}(value: ${fieldType}): Promise<${apiSchemaName}[]>;`);
    
    // findBy{Field}IsTrue/IsFalse (for booleans)
    if (field.field.type === 'boolean') {
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}IsTrue(): Promise<${apiSchemaName}[]>;`);
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}IsFalse(): Promise<${apiSchemaName}[]>;`);
    }
    
    // findBy{Field}Equals
    methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}Equals(value: ${fieldType}): Promise<${apiSchemaName}[]>;`);
    
    // String operations
    if (field.field.type === 'string' || field.field.type === 'text') {
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}Contains(value: string): Promise<${apiSchemaName}[]>;`);
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}StartsWith(value: string): Promise<${apiSchemaName}[]>;`);
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}EndsWith(value: string): Promise<${apiSchemaName}[]>;`);
    }
    
    // Date/number comparisons
    if (field.field.type === 'timestamp' || field.field.type === 'number' || field.field.type === 'integer') {
      const dateType = field.field.type === 'timestamp' ? 'string' : 'number';
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}After(value: ${dateType}): Promise<${apiSchemaName}[]>;`);
      methodSignatures.push(`  findBy${capitalize(field.apiFieldName)}Before(value: ${dateType}): Promise<${apiSchemaName}[]>;`);
    }
    
    // findByIdAnd{Field}
    if (field.apiFieldName.toLowerCase() !== primaryFieldName.toLowerCase()) {
      methodSignatures.push(`  findByIdAnd${capitalize(field.apiFieldName)}(id: string, value: ${fieldType}): Promise<${apiSchemaName} | null>;`);
      
      if (field.field.type === 'boolean') {
        methodSignatures.push(`  findByIdAnd${capitalize(field.apiFieldName)}IsTrue(id: string): Promise<${apiSchemaName} | null>;`);
        methodSignatures.push(`  findByIdAnd${capitalize(field.apiFieldName)}IsFalse(id: string): Promise<${apiSchemaName} | null>;`);
      }
    }
  }
  
  // Two field combinations (limit to avoid explosion)
  for (let i = 0; i < queryableFields.length && i < 5; i++) {
    for (let j = i + 1; j < queryableFields.length && j < 5; j++) {
      const field1 = queryableFields[i];
      const field2 = queryableFields[j];
      const type1 = field1.field.type === 'boolean' ? 'boolean' : 
                   field1.field.type === 'number' || field1.field.type === 'integer' ? 'number' : 'string';
      const type2 = field2.field.type === 'boolean' ? 'boolean' : 
                   field2.field.type === 'number' || field2.field.type === 'integer' ? 'number' : 'string';
      
      methodSignatures.push(`  findBy${capitalize(field1.apiFieldName)}And${capitalize(field2.apiFieldName)}(value1: ${type1}, value2: ${type2}): Promise<${apiSchemaName}[]>;`);
      
      if (field2.field.type === 'boolean') {
        methodSignatures.push(`  findBy${capitalize(field1.apiFieldName)}And${capitalize(field2.apiFieldName)}IsTrue(value1: ${type1}): Promise<${apiSchemaName}[]>;`);
        methodSignatures.push(`  findBy${capitalize(field1.apiFieldName)}And${capitalize(field2.apiFieldName)}IsFalse(value1: ${type1}): Promise<${apiSchemaName}[]>;`);
      }
    }
  }
  
  // OrderBy variants
  for (const field of queryableFields.slice(0, 5)) {
    methodSignatures.push(`  findAllOrderBy${capitalize(field.apiFieldName)}Asc(): Promise<${apiSchemaName}[]>;`);
    methodSignatures.push(`  findAllOrderBy${capitalize(field.apiFieldName)}Desc(): Promise<${apiSchemaName}[]>;`);
  }
  
  return `// This file is auto-generated from yama.yaml
// Do not edit manually - your changes will be overwritten

import type { ${apiSchemaName}, ${createInputName}, ${updateInputName} } from "${typesImportPath}";

export interface FindAllOptions {
${queryableFields.map(f => {
  const tsType = f.field.type === 'boolean' ? 'boolean' : 
                f.field.type === 'number' || f.field.type === 'integer' ? 'number' : 'string';
  return `  ${f.apiFieldName}?: ${tsType};`;
}).join('\n')}
  limit?: number;
  offset?: number;
  orderBy?: { field: string; direction?: 'asc' | 'desc' };
}

export interface ${entityName}RepositoryMethods {
${methodSignatures.join('\n')}
}

export type ${entityName}RepositoryType = ${entityName}RepositoryMethods;
`;
}

/**
 * Generate complete repository file from entities
 */
export function generateRepository(
  entities: YamaEntities,
  typesImportPath: string = "../types"
): { repository: string; types: string } {
  const repositoryClasses: string[] = [];
  const typeDefinitions: string[] = [];
  
  for (const [entityName, entityDef] of Object.entries(entities)) {
    repositoryClasses.push(generateRepositoryClass(entityName, entityDef, typesImportPath));
    typeDefinitions.push(generateRepositoryTypes(entityName, entityDef, typesImportPath));
  }
  
  return {
    repository: `// This file is auto-generated from yama.yaml
// Do not edit manually - your changes will be overwritten

${repositoryClasses.join('\n\n')}
`,
    types: typeDefinitions.join('\n\n')
  };
}
