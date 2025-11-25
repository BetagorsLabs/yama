# YAMA Roadmap

This document outlines planned features and improvements for YAMA.

## Backend-as-Config Enhancements

### Current State
- ✅ CRUD endpoints are fully config-based (no code required)
- ✅ Custom endpoints can be defined in YAML but require TypeScript handler files
- ⚠️ Default handlers only return placeholder messages

### Planned Features

#### 1. Database Access in Handler Context
**Priority: High**

Add database access to `HandlerContext` so handlers can use repositories without manual imports.

**Implementation:**
- Populate `context.db` with the database adapter
- Provide entity repositories through `context.repositories` or `context.entities`
- Allow handlers to access database operations directly from context

**Example:**
```typescript
export async function myHandler(context: HandlerContext) {
  const products = await context.entities.Product.findAll();
  return products;
}
```

**Benefits:**
- Reduces boilerplate in handlers
- Makes database access consistent across handlers
- Enables easier testing and mocking

---

#### 2. Smart Default Handlers for Entity Endpoints
**Priority: High**

Enable endpoints without handlers to automatically query entity repositories based on response type detection.

**Current State:**
- Endpoints without handlers use `createDefaultHandler` which returns placeholder messages
- No automatic database querying for entity-based endpoints

**Implementation:**
- Enhance `createDefaultHandler` to detect entity-based response types (e.g., `ProductArray`, `Product`)
- Dynamically load and use the appropriate repository based on entity name
- Support CRUD operations automatically:
  - `GET /path` with `ProductArray` response → calls `productRepository.findAll(query)`
  - `GET /path/:id` with `Product` response → calls `productRepository.findById(params.id)`
  - `POST /path` with `Product` response → calls `productRepository.create(body)`
  - `PUT/PATCH /path/:id` → calls `productRepository.update(params.id, body)`
  - `DELETE /path/:id` → calls `productRepository.delete(params.id)`
- Map query parameters to repository method options
- Support pagination, filtering, and sorting through query parameters

**Example:**
```yaml
endpoints:
  - path: /featured-products
    method: GET
    # No handler specified - auto-detects ProductArray and queries repository
    query:
      featured: { type: "boolean", required: false }
      limit: { type: "number", required: false }
      offset: { type: "number", required: false }
    response:
      type: ProductArray
```

The default handler would:
1. Detect `ProductArray` response type
2. Load `productRepository` dynamically
3. Query with `findAll({ featured: true, limit: 10, offset: 0 })` based on query params
4. Return results automatically

**Benefits:**
- No handler code needed for simple entity queries
- Declarative endpoint definitions
- Automatic repository integration
- Reduces boilerplate significantly

---

#### 3. Auto-Implemented Search in CRUD
**Priority: High**

Add configurable search functionality to CRUD endpoints that automatically implements search across specified fields.

**Current State:**
- CRUD GET list endpoints only support `limit` and `offset` query parameters
- No built-in search functionality
- Users must implement search manually in handlers

**Implementation:**
- Extend `CrudConfig` interface with search configuration:
  ```typescript
  export interface CrudConfig {
    // ... existing fields ...
    search?: {
      /**
       * Fields that can be searched (default: all string/text fields)
       * Can be array of field names or true to enable all searchable fields
       */
      fields?: string[] | true;
      
      /**
       * Search mode: "contains" (default), "starts", "ends", "exact"
       */
      mode?: "contains" | "starts" | "ends" | "exact";
      
      /**
       * Enable full-text search across multiple fields with a single query parameter
       */
      fullText?: boolean;
    };
  }
  ```
- Update `generateCrudEndpoints` to add `search` query parameter when search is enabled
- Enhance repository `findAll` method to support search across configured fields
- Support both individual field search and full-text search modes

**Example Configuration:**
```yaml
entities:
  Product:
    table: products
    crud:
      enabled: true
      search:
        fields: ["name", "description"]  # Only search these fields
        mode: "contains"  # Search mode: contains, starts, ends, or exact
        fullText: true    # Enable ?search=query parameter for multi-field search
    fields:
      id:
        type: uuid
        primary: true
        generated: true
      name:
        type: string
        required: true
      description:
        type: text
      price:
        type: number
```

**Generated Endpoints Would Support:**
- `GET /products?search=laptop` - Full-text search across name and description for "laptop"
- `GET /products?name=laptop` - Exact field matching (existing functionality)
- `GET /products?name=laptop&price=1000` - Multiple field filters (existing)
- `GET /products?limit=10&offset=0&search=laptop` - Combined search and pagination

**Search Modes:**
- `contains` (default): `ILIKE '%query%'` - matches anywhere in field
- `starts`: `ILIKE 'query%'` - matches at start of field
- `ends`: `ILIKE '%query'` - matches at end of field
- `exact`: `= 'query'` - exact match

**Benefits:**
- Zero-code search implementation
- Configurable search fields per entity
- Multiple search modes for flexibility
- Full-text search across multiple fields
- Consistent search patterns across all entities

---

#### 4. Inline Handler Definitions in YAML
**Priority: Medium**

Support built-in handler types that can be configured directly in YAML without writing code.

**Handler Types:**

##### Query Handler
Execute database queries directly from config:
```yaml
endpoints:
  - path: /products/search
    method: GET
    handler:
      type: query
      entity: Product
      filters:
        - field: name
          operator: ilike
          param: search
        - field: price
          operator: lte
          param: maxPrice
      pagination:
        limit: query.limit
        offset: query.offset
      orderBy:
        field: created_at
        direction: desc
    query:
      search:
        type: string
        required: false
      maxPrice:
        type: number
        required: false
    response:
      type: ProductArray
```

##### Relation Handler
Access related entities:
```yaml
endpoints:
  - path: /products/:id/reviews
    method: GET
    handler:
      type: relation
      entity: Product
      relation: reviews
      parentId: params.id
    params:
      id:
        type: string
        required: true
    response:
      type: ReviewArray
```

##### Aggregate Handler
Perform aggregations:
```yaml
endpoints:
  - path: /products/stats
    method: GET
    handler:
      type: aggregate
      entity: Product
      operations:
        - type: count
          alias: total
        - type: avg
          field: price
          alias: avgPrice
        - type: sum
          field: stock
          alias: totalStock
    response:
      type: ProductStats
```

**Benefits:**
- No code required for common operations
- Faster development for simple endpoints
- Consistent query patterns

---

#### 3. Handler Templates/Presets
**Priority: Medium**

Support configurable handler templates for common patterns.

**Template Types:**

##### CRUD Override Templates
Override specific CRUD operations with custom logic:
```yaml
entities:
  Product:
    table: products
    crud: true
    crudOverrides:
      POST:
        handler:
          type: template
          template: create-with-validation
          validate:
            - field: price
              min: 0
            - field: stock
              min: 0
```

##### Custom Templates
Define reusable handler templates:
```yaml
handlerTemplates:
  searchWithFilters:
    type: query
    filters: ${filters}
    pagination: true
    orderBy: ${orderBy}

endpoints:
  - path: /products/search
    method: GET
    handler:
      type: template
      template: searchWithFilters
      filters:
        - field: name
          operator: ilike
          param: q
      orderBy:
        field: created_at
        direction: desc
```

**Benefits:**
- Reusable handler patterns
- Consistent implementation across endpoints
- Easier maintenance

---

#### 4. Expression-Based Handlers
**Priority: Low**

Support SQL-like expressions or JavaScript expressions for simple transformations.

**SQL Expression Handler:**
```yaml
endpoints:
  - path: /stats
    method: GET
    handler:
      type: sql
      query: |
        SELECT 
          COUNT(*) as total_products,
          AVG(price) as avg_price,
          SUM(stock) as total_stock
        FROM products
        WHERE created_at > NOW() - INTERVAL '7 days'
    response:
      type: Stats
```

**JavaScript Expression Handler:**
```yaml
endpoints:
  - path: /products/:id/price-formatted
    method: GET
    handler:
      type: expression
      entity: Product
      expression: |
        const product = await context.entities.Product.findById(params.id);
        return {
          ...product,
          priceFormatted: `$${product.price.toFixed(2)}`
        };
    response:
      type: ProductWithFormattedPrice
```

**Benefits:**
- Quick transformations without full handler files
- SQL queries for complex aggregations
- JavaScript for simple data manipulation

---

## Implementation Priority

1. **Phase 1 (High Priority)**
   - Database access in handler context
   - Smart default handlers for entity endpoints
   - Auto-implemented search in CRUD
   - Basic query handler type

2. **Phase 2 (Medium Priority)**
   - Relation handler type
   - Aggregate handler type
   - Handler templates

3. **Phase 3 (Low Priority)**
   - Expression-based handlers
   - SQL expression handler
   - Advanced template features

## Related Features

### Schema Enhancements
- Support for computed fields in schemas
- Virtual fields that are calculated at runtime
- Field-level validation rules

### Validation Enhancements
- Custom validation functions in config
- Cross-field validation
- Conditional validation rules

### Documentation
- Auto-generate handler documentation from config
- Examples for each handler type
- Migration guide from code-based to config-based handlers

## Notes

- All features should maintain backward compatibility with existing TypeScript handlers
- Custom handlers will always be supported for complex business logic
- Config-based handlers should be optional, not required
- Performance should be considered for all new handler types

