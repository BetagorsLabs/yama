import Ajv from "ajv";
import addFormats from "ajv-formats";
/**
 * Convert Yama schema field to JSON Schema property
 */
export function fieldToJsonSchema(field, fieldName, schemas, visited = new Set()) {
    // Handle schema references
    if (field.$ref) {
        if (visited.has(field.$ref)) {
            throw new Error(`Circular reference detected: ${field.$ref}`);
        }
        if (!schemas || !schemas[field.$ref]) {
            throw new Error(`Schema reference "${field.$ref}" not found`);
        }
        // Recursively convert the referenced schema
        visited.add(field.$ref);
        const referencedSchema = schemas[field.$ref];
        const schema = schemaToJsonSchema(field.$ref, referencedSchema, schemas, visited);
        visited.delete(field.$ref);
        return schema;
    }
    // Type is required if $ref is not present
    if (!field.type) {
        throw new Error(`Field "${fieldName}" must have either a type or $ref`);
    }
    const schema = {
        type: field.type === "integer" ? "integer" : field.type
    };
    // Add format if specified
    if (field.format) {
        schema.format = field.format;
    }
    // Add enum if specified
    if (field.enum) {
        schema.enum = field.enum;
    }
    // Add pattern for strings
    if (field.pattern) {
        schema.pattern = field.pattern;
    }
    // Add min/max for numbers
    if (field.min !== undefined) {
        schema.minimum = field.min;
    }
    if (field.max !== undefined) {
        schema.maximum = field.max;
    }
    // Handle array types
    if (field.type === "array" && field.items) {
        schema.items = fieldToJsonSchema(field.items, "item", schemas, visited);
    }
    // Handle object types
    if (field.type === "object" && field.properties) {
        const properties = {};
        const required = [];
        for (const [propName, propField] of Object.entries(field.properties)) {
            properties[propName] = fieldToJsonSchema(propField, propName, schemas, visited);
            if (propField.required) {
                required.push(propName);
            }
        }
        schema.properties = properties;
        schema.required = required;
    }
    return schema;
}
/**
 * Convert Yama schema definition to JSON Schema
 */
export function schemaToJsonSchema(schemaName, schemaDef, schemas, visited = new Set()) {
    const properties = {};
    const required = [];
    for (const [fieldName, field] of Object.entries(schemaDef.fields)) {
        properties[fieldName] = fieldToJsonSchema(field, fieldName, schemas, visited);
        if (field.required) {
            required.push(fieldName);
        }
    }
    const schema = {
        type: "object",
        properties,
        required
    };
    return schema;
}
/**
 * Schema validator class
 */
export class SchemaValidator {
    constructor() {
        this.validators = new Map();
        this.ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(this.ajv);
    }
    /**
     * Register schemas and create validators
     */
    registerSchemas(schemas) {
        this.validators.clear();
        for (const [schemaName, schemaDef] of Object.entries(schemas)) {
            const schema = schemaToJsonSchema(schemaName, schemaDef, schemas);
            const validator = this.ajv.compile(schema);
            this.validators.set(schemaName, validator);
        }
    }
    /**
     * Validate data against a schema
     */
    validate(schemaName, data) {
        const validator = this.validators.get(schemaName);
        if (!validator) {
            return {
                valid: false,
                errorMessage: `Schema "${schemaName}" not found`
            };
        }
        const valid = validator(data);
        if (!valid) {
            return {
                valid: false,
                errors: validator.errors || []
            };
        }
        return { valid: true };
    }
    /**
     * Validate data against a JSON schema directly (without registering as a schema)
     */
    validateSchema(schema, data) {
        try {
            const validator = this.ajv.compile(schema);
            const valid = validator(data);
            if (!valid) {
                return {
                    valid: false,
                    errors: validator.errors || []
                };
            }
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Format validation errors into a readable message
     */
    formatErrors(errors) {
        return errors
            .map((error) => {
            const path = error.instancePath || error.schemaPath;
            const message = error.message;
            return `${path}: ${message}`;
        })
            .join(", ");
    }
}
/**
 * Create a new schema validator instance
 */
export function createSchemaValidator() {
    return new SchemaValidator();
}
//# sourceMappingURL=schemas.js.map