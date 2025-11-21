// Export client functions (legacy - for backward compatibility)
export {
  initDatabase,
  getDatabase,
  getSQL,
  closeDatabase,
} from "./client.js";

// Export generators
export { generateDrizzleSchema } from "./drizzle-schema.js";
export { generateMigrationSQL, generateMigrationFile } from "./migrations.js";
export { generateMapper } from "./mapper.js";
export { generateRepository } from "./repository.js";

// Export adapter
export { postgresqlAdapter } from "./adapter.js";


