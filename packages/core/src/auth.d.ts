import { type AuthConfig, type EndpointAuth, type AuthContext } from "./schemas";
/**
 * Authenticate request using configured providers
 */
export declare function authenticateRequest(headers: Record<string, string | undefined>, authConfig: AuthConfig): Promise<{
    context: AuthContext;
    error?: string;
}>;
/**
 * Authorize request based on endpoint auth requirements
 */
export declare function authorizeRequest(authContext: AuthContext, endpointAuth: EndpointAuth): {
    authorized: boolean;
    error?: string;
};
/**
 * Combined authenticate and authorize function
 */
export declare function authenticateAndAuthorize(headers: Record<string, string | undefined>, authConfig: AuthConfig | undefined, endpointAuth: EndpointAuth | undefined): Promise<{
    context: AuthContext;
    authorized: boolean;
    error?: string;
}>;
