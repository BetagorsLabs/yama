import { ErrorObject } from "ajv";
export interface ModelField {
    type?: "string" | "number" | "boolean" | "integer" | "array" | "object";
    required?: boolean;
    default?: unknown;
    format?: string;
    items?: ModelField;
    properties?: Record<string, ModelField>;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: unknown[];
    $ref?: string;
}
export interface ModelDefinition {
    fields: Record<string, ModelField>;
}
export interface YamaModels {
    [modelName: string]: ModelDefinition;
}
export interface ValidationResult {
    valid: boolean;
    errors?: ErrorObject[];
    errorMessage?: string;
}
/**
 * Convert Yama model field to JSON Schema property
 */
export declare function fieldToJsonSchema(field: ModelField, fieldName: string, models?: YamaModels, visited?: Set<string>): Record<string, unknown>;
/**
 * Convert Yama model definition to JSON Schema
 */
export declare function modelToJsonSchema(modelName: string, modelDef: ModelDefinition, models?: YamaModels, visited?: Set<string>): Record<string, unknown>;
/**
 * Model validator class
 */
export declare class ModelValidator {
    private ajv;
    private validators;
    constructor();
    /**
     * Register models and create validators
     */
    registerModels(models: YamaModels): void;
    /**
     * Validate data against a model
     */
    validate(modelName: string, data: unknown): ValidationResult;
    /**
     * Validate data against a JSON schema directly (without registering as a model)
     */
    validateSchema(schema: Record<string, unknown>, data: unknown): ValidationResult;
    /**
     * Format validation errors into a readable message
     */
    formatErrors(errors: ErrorObject[]): string;
}
/**
 * Create a new model validator instance
 */
export declare function createModelValidator(): ModelValidator;
