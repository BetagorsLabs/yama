export function helloYamaCore() {
  return "Yama core online";
}

// Export model validation
export {
  ModelValidator,
  createModelValidator,
  modelToJsonSchema,
  fieldToJsonSchema,
  type ModelField,
  type ModelDefinition,
  type YamaModels,
  type ValidationResult
} from "./models.js";

// Export auth types from models
export {
  type AuthProvider,
  type AuthConfig,
  type EndpointAuth,
  type AuthContext,
  type AuthProviderType,
  type JwtAuthProvider,
  type ApiKeyAuthProvider,
} from "./models.js";

// Export auth functions
export {
  authenticateRequest,
  authorizeRequest,
  authenticateAndAuthorize,
} from "./auth.js";

// Export type generation
export { generateTypes } from "./typegen.js";

