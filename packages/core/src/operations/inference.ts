import type { ParsedOperation } from "./types.js";

/**
 * Pluralize a word (simple implementation)
 */
function pluralize(word: string): string {
  if (word.endsWith("y")) {
    return word.slice(0, -1) + "ies";
  }
  if (word.endsWith("s") || word.endsWith("x") || word.endsWith("z") || 
      word.endsWith("ch") || word.endsWith("sh")) {
    return word + "es";
  }
  return word + "s";
}

/**
 * Convert entity name to path segment
 */
function entityNameToPath(entityName: string): string {
  const lower = entityName.toLowerCase();
  return pluralize(lower);
}

/**
 * Extract entity name from operation name
 * Examples:
 * - listPosts -> Post
 * - getPost -> Post
 * - createPost -> Post
 * - listPostComments -> Comment (with parent Post)
 */
export function extractEntityName(operationName: string): string | undefined {
  // Remove common prefixes
  const prefixes = ["list", "get", "create", "update", "delete", "search", "find"];
  
  for (const prefix of prefixes) {
    if (operationName.startsWith(prefix)) {
      const remainder = operationName.slice(prefix.length);
      // Convert camelCase to PascalCase
      return remainder.charAt(0).toUpperCase() + remainder.slice(1);
    }
  }
  
  // If no prefix, assume the whole name is the entity (capitalized)
  if (operationName.charAt(0).toUpperCase() === operationName.charAt(0)) {
    return operationName;
  }
  
  return undefined;
}

/**
 * Infer HTTP method from operation name
 */
export function inferMethodFromName(operationName: string): string {
  if (operationName.startsWith("list") || operationName.startsWith("get") || 
      operationName.startsWith("search") || operationName.startsWith("find")) {
    return "GET";
  }
  if (operationName.startsWith("create")) {
    return "POST";
  }
  if (operationName.startsWith("update")) {
    return "PUT";
  }
  if (operationName.startsWith("delete")) {
    return "DELETE";
  }
  // Default for custom operations
  return "POST";
}

/**
 * Infer operation type from name
 */
export function inferOperationType(operationName: string): ParsedOperation["operationType"] {
  if (operationName.startsWith("list")) {
    return "list";
  }
  if (operationName.startsWith("get")) {
    return "get";
  }
  if (operationName.startsWith("create")) {
    return "create";
  }
  if (operationName.startsWith("update")) {
    return "update";
  }
  if (operationName.startsWith("delete")) {
    return "delete";
  }
  if (operationName.startsWith("search") || operationName.startsWith("find")) {
    return "search";
  }
  return "custom";
}

/**
 * Infer path from operation name
 * Examples:
 * - listPosts -> /posts
 * - getPost -> /posts/{id}
 * - createPost -> /posts
 * - updatePost -> /posts/{id}
 * - deletePost -> /posts/{id}
 * - searchPosts -> /posts/search
 * - publishPost -> /posts/{id}/publish
 */
export function inferPathFromName(
  operationName: string,
  entityName?: string,
  parentEntity?: string
): string {
  const opType = inferOperationType(operationName);
  
  // If parent is specified, create nested path
  if (parentEntity) {
    const parentPath = entityNameToPath(parentEntity);
    const parentIdParam = `${parentEntity.charAt(0).toLowerCase() + parentEntity.slice(1)}Id`;
    
    // Extract child entity from operation name
    let childEntity = entityName;
    if (!childEntity) {
      // Try to extract from operation name (e.g., listPostComments -> Comment)
      const parts = operationName.split(/(?=[A-Z])/);
      // Find the part after parent entity
      const parentIndex = parts.findIndex(p => 
        p.toLowerCase() === parentEntity.toLowerCase()
      );
      if (parentIndex >= 0 && parentIndex < parts.length - 1) {
        childEntity = parts.slice(parentIndex + 1).join("");
      }
    }
    
    if (childEntity) {
      const childPath = entityNameToPath(childEntity);
      
      if (opType === "list") {
        return `/${parentPath}/{${parentIdParam}}/${childPath}`;
      }
      if (opType === "get") {
        return `/${parentPath}/{${parentIdParam}}/${childPath}/{id}`;
      }
      if (opType === "create") {
        return `/${parentPath}/{${parentIdParam}}/${childPath}`;
      }
      if (opType === "delete") {
        return `/${parentPath}/{${parentIdParam}}/${childPath}/{id}`;
      }
    }
  }
  
  // Standard paths without parent
  if (!entityName) {
    entityName = extractEntityName(operationName);
  }
  
  if (!entityName) {
    // Fallback: use operation name as-is (lowercase, kebab-case)
    const kebab = operationName
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "");
    return `/${kebab}`;
  }
  
  const pathSegment = entityNameToPath(entityName);
  
  if (opType === "list") {
    return `/${pathSegment}`;
  }
  if (opType === "get") {
    return `/${pathSegment}/{id}`;
  }
  if (opType === "create") {
    return `/${pathSegment}`;
  }
  if (opType === "update") {
    return `/${pathSegment}/{id}`;
  }
  if (opType === "delete") {
    return `/${pathSegment}/{id}`;
  }
  if (opType === "search") {
    return `/${pathSegment}/search`;
  }
  
  // Custom operation (e.g., publishPost -> /posts/{id}/publish)
  // Extract verb from name (everything after entity name)
  const entityLower = entityName.toLowerCase();
  const nameLower = operationName.toLowerCase();
  if (nameLower.includes(entityLower)) {
    const verb = nameLower.replace(entityLower, "").replace(/^list|^get|^create|^update|^delete/, "");
    if (verb) {
      return `/${pathSegment}/{id}/${verb}`;
    }
  }
  
  // Fallback
  return `/${pathSegment}`;
}
