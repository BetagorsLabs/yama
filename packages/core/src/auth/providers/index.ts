// Import all built-in providers to trigger registration
import jwtHandler from "./jwt";
import apiKeyHandler from "./api-key";
import basicHandler from "./basic";
import { registerAuthProvider } from "../registry";

// Register all built-in providers
registerAuthProvider("jwt", jwtHandler);
registerAuthProvider("api-key", apiKeyHandler);
registerAuthProvider("basic", basicHandler);

// Export handlers for testing
export { jwtHandler, apiKeyHandler, basicHandler };

