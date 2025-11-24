import { ErrorObject } from "ajv";
export interface SchemaField {
    type?: "string" | "number" | "boolean" | "integer" | "array" | "object";
    required?: boolean;
    default?: unknown;
    format?: string;
    items?: SchemaField;
    properties?: Record<string, SchemaField>;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: unknown[];
    $ref?: string;
}
export interface SchemaDefinition {
    fields: Record<string, SchemaField>;
}
export interface YamaSchemas {
    [schemaName: string]: SchemaDefinition;
}
export interface ValidationResult {
    valid: boolean;
    errors?: ErrorObject[];
    errorMessage?: string;
}
/**
 * Convert Yama schema field to JSON Schema property
 */
export declare function fieldToJsonSchema(field: SchemaField, fieldName: string, schemas?: YamaSchemas, visited?: Set<string>): Record<string, unknown>;
/**
 * Convert Yama schema definition to JSON Schema
 */
export declare function schemaToJsonSchema(schemaName: string, schemaDef: SchemaDefinition, schemas?: YamaSchemas, visited?: Set<string>): Record<string, unknown>;
/**
 * Schema validator class
 */
export declare class SchemaValidator {
    private ajv;
    private validators;
    constructor();
    /**
     * Register schemas and create validators
     */
    registerSchemas(schemas: YamaSchemas): void;
    /**
     * Validate data against a schema
     */
    validate(schemaName: string, data: unknown): ValidationResult;
    /**
     * Validate data against a JSON schema directly (without registering as a schema)
     */
    validateSchema(schema: Record<string, unknown>, data: unknown): ValidationResult;
    /**
     * Format validation errors into a readable message
     */
    formatErrors(errors: ErrorObject[]): string;
}
/**
 * Create a new schema validator instance
 */
export declare function createSchemaValidator(): SchemaValidator;
export type AuthProviderType = "jwt" | "api-key";
export interface JwtAuthProvider {
    type: "jwt";
    secret: string;
    algorithm?: string;
    issuer?: string;
    audience?: string;
}
export interface ApiKeyAuthProvider {
    type: "api-key";
    header: string;
    validate?: (apiKey: string) => Promise<boolean> | boolean;
}
export type AuthProvider = JwtAuthProvider | ApiKeyAuthProvider;
export interface AuthConfig {
    providers: AuthProvider[];
}
export interface EndpointAuth {
    required?: boolean;
    roles?: string[];
    provider?: string;
}
export interface AuthContext {
    authenticated: boolean;
    user?: {
        id?: string;
        email?: string;
        roles?: string[];
        [key: string]: unknown;
    };
    provider?: string;
    token?: string;
}
