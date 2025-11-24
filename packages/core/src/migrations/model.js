import { createHash } from "crypto";
/**
 * Normalize entities to a canonical JSON representation
 * This ensures consistent hashing regardless of field order
 */
function normalizeEntities(entities) {
    const normalized = {};
    // Sort entity names for consistency
    const sortedEntityNames = Object.keys(entities).sort();
    for (const entityName of sortedEntityNames) {
        const entity = entities[entityName];
        const normalizedEntity = {
            table: entity.table,
            fields: {},
        };
        // Sort field names for consistency
        const sortedFieldNames = Object.keys(entity.fields).sort();
        for (const fieldName of sortedFieldNames) {
            const field = entity.fields[fieldName];
            // Normalize field by sorting keys and removing undefined values
            const normalizedField = {};
            const fieldKeys = Object.keys(field).sort();
            for (const key of fieldKeys) {
                const value = field[key];
                if (value !== undefined) {
                    normalizedField[key] = value;
                }
            }
            normalizedEntity.fields[fieldName] = normalizedField;
        }
        // Add indexes if present
        if (entity.indexes && entity.indexes.length > 0) {
            normalizedEntity.indexes = entity.indexes
                .map((idx) => ({
                name: idx.name,
                fields: [...idx.fields].sort(),
                unique: idx.unique || false,
            }))
                .sort((a, b) => (a.name || a.fields.join(",")).localeCompare(b.name || b.fields.join(",")));
        }
        normalized[entityName] = normalizedEntity;
    }
    return JSON.stringify(normalized, null, 0);
}
/**
 * Compute SHA-256 hash of entities
 */
export function computeModelHash(entities) {
    const normalized = normalizeEntities(entities);
    return createHash("sha256").update(normalized).digest("hex");
}
/**
 * Convert entities to Model representation
 */
export function entitiesToModel(entities) {
    const hash = computeModelHash(entities);
    const tables = new Map();
    for (const [entityName, entityDef] of Object.entries(entities)) {
        const columns = new Map();
        for (const [fieldName, field] of Object.entries(entityDef.fields)) {
            const dbColumnName = field.dbColumn || fieldName;
            // Convert entity type to SQL type if dbType not provided
            let sqlType = field.dbType || "";
            if (!sqlType) {
                switch (field.type) {
                    case "uuid":
                        sqlType = "UUID";
                        break;
                    case "string":
                        sqlType = field.maxLength ? `VARCHAR(${field.maxLength})` : "VARCHAR(255)";
                        break;
                    case "text":
                        sqlType = "TEXT";
                        break;
                    case "number":
                    case "integer":
                        sqlType = "INTEGER";
                        break;
                    case "boolean":
                        sqlType = "BOOLEAN";
                        break;
                    case "timestamp":
                        sqlType = "TIMESTAMP";
                        break;
                    case "jsonb":
                        sqlType = "JSONB";
                        break;
                    default:
                        sqlType = String(field.type).toUpperCase();
                }
            }
            // Primary keys are always NOT NULL
            const isPrimary = field.primary || false;
            const nullable = isPrimary ? false : (field.nullable !== false && !field.required);
            columns.set(dbColumnName, {
                name: dbColumnName,
                type: sqlType,
                nullable: nullable,
                primary: isPrimary,
                default: field.default,
                generated: field.generated,
            });
        }
        const indexes = [];
        // Add indexes from entity definition
        if (entityDef.indexes) {
            for (const index of entityDef.indexes) {
                indexes.push({
                    name: index.name || `${entityDef.table}_${index.fields.join("_")}_idx`,
                    columns: index.fields.map((f) => {
                        const field = entityDef.fields[f];
                        return field?.dbColumn || f;
                    }),
                    unique: index.unique || false,
                });
            }
        }
        // Add indexes from field index: true
        for (const [fieldName, field] of Object.entries(entityDef.fields)) {
            if (field.index) {
                const dbColumnName = field.dbColumn || fieldName;
                indexes.push({
                    name: `${entityDef.table}_${dbColumnName}_idx`,
                    columns: [dbColumnName],
                    unique: false,
                });
            }
        }
        tables.set(entityDef.table, {
            name: entityDef.table,
            columns,
            indexes,
            foreignKeys: [], // Foreign keys not yet supported in entity definitions
        });
    }
    return {
        hash,
        entities,
        tables,
    };
}
export function compareModels(from, to) {
    return {
        fromHash: from.hash,
        toHash: to.hash,
        hasChanges: from.hash !== to.hash,
    };
}
//# sourceMappingURL=model.js.map