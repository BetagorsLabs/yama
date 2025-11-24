import type { YamaSchemas } from "./schemas";
import type { YamaEntities } from "./entities";
/**
 * Generate TypeScript types from Yama schemas and entities
 */
export declare function generateTypes(schemas?: YamaSchemas, entities?: YamaEntities): string;
