/**
 * Normalized HTTP request interface
 */
export interface HttpRequest {
    method: string;
    url: string;
    path: string;
    query: Record<string, unknown>;
    params: Record<string, unknown>;
    body: unknown;
    headers: Record<string, string | undefined>;
    [key: string]: unknown;
}
/**
 * Normalized HTTP response interface
 */
export interface HttpResponse {
    status(code: number): HttpResponse;
    send(data: unknown): void;
    type(contentType: string): HttpResponse;
    [key: string]: unknown;
}
/**
 * Route handler function type
 */
export type RouteHandler = (request: HttpRequest, reply: HttpResponse) => Promise<unknown> | unknown;
/**
 * HTTP server instance (engine-specific)
 */
export type HttpServerInstance = unknown;
/**
 * HTTP server adapter interface - unified API for all HTTP engines
 */
export interface HttpServerAdapter {
    /**
     * Create a new HTTP server instance
     */
    createServer(options?: Record<string, unknown>): HttpServerInstance;
    /**
     * Register a route on the server
     */
    registerRoute(server: HttpServerInstance, method: string, path: string, handler: RouteHandler): void;
    /**
     * Start the server
     */
    start(server: HttpServerInstance, port: number, host?: string): Promise<void>;
    /**
     * Stop the server
     */
    stop(server: HttpServerInstance): Promise<void>;
    /**
     * Get request adapter to normalize engine-specific request
     */
    getRequestAdapter(request: unknown): HttpRequest;
    /**
     * Get response adapter to normalize engine-specific response
     */
    getResponseAdapter(reply: unknown): HttpResponse;
}
/**
 * HTTP server adapter factory function type
 */
export type HttpServerAdapterFactory = (options?: Record<string, unknown>) => HttpServerAdapter;
/**
 * Register an HTTP server adapter for a specific engine
 */
export declare function registerHttpServerAdapter(engine: string, factory: HttpServerAdapterFactory): void;
/**
 * Create an HTTP server adapter for the given engine
 */
export declare function createHttpServerAdapter(engine?: string, options?: Record<string, unknown>): HttpServerAdapter;
