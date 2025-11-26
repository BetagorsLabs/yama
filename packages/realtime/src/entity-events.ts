import type { RealtimeAdapter } from "./adapter";
import type { RealtimeEntityConfig } from "./types";

/**
 * Setup entity event hooks
 */
export function setupEntityEvents(
  adapter: RealtimeAdapter,
  entityConfigs: Record<string, RealtimeEntityConfig>,
  repositories?: Record<string, any>
): void {
  if (!repositories) return;

  for (const [entityName, entityConfig] of Object.entries(entityConfigs)) {
    if (!entityConfig.enabled) continue;

    const repository = repositories[entityName];
    if (!repository) continue;

    const channelPrefix = entityConfig.channelPrefix || entityName.toLowerCase();
    const events = entityConfig.events || ["created", "updated", "deleted"];

    // Hook into repository methods
    hookRepositoryMethods(repository, channelPrefix, events, entityConfig.watchFields, adapter);
  }
}

/**
 * Hook into repository methods to emit events
 */
function hookRepositoryMethods(
  repository: any,
  channelPrefix: string,
  events: string[],
  watchFields: string[] | undefined,
  adapter: RealtimeAdapter
): void {
  // Hook create method
  if (events.includes("created") && typeof repository.create === "function") {
    const originalCreate = repository.create.bind(repository);
    repository.create = async function(...args: any[]) {
      const result = await originalCreate(...args);
      adapter.publishAsync(`${channelPrefix}:created`, "created", result);
      return result;
    };
  }

  // Hook update method
  if (events.includes("updated") && typeof repository.update === "function") {
    const originalUpdate = repository.update.bind(repository);
    repository.update = async function(id: any, data: any, ...args: any[]) {
      const result = await originalUpdate(id, data, ...args);
      
      // Check if watched fields changed
      if (watchFields && watchFields.length > 0) {
        const changed = watchFields.some(field => field in data);
        if (changed) {
          adapter.publishAsync(`${channelPrefix}:updated`, "updated", result);
        }
      } else {
        // Emit for any update
        adapter.publishAsync(`${channelPrefix}:updated`, "updated", result);
      }
      
      return result;
    };
  }

  // Hook delete method
  if (events.includes("deleted") && typeof repository.delete === "function") {
    const originalDelete = repository.delete.bind(repository);
    repository.delete = async function(id: any, ...args: any[]) {
      const result = await originalDelete(id, ...args);
      adapter.publishAsync(`${channelPrefix}:deleted`, "deleted", { id });
      return result;
    };
  }
}

