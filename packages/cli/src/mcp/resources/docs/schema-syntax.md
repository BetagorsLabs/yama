# YAMA Schema Syntax Reference

Complete syntax reference for defining entities, fields, relationships, and constraints in YAMA YAML configuration files.

## Entity Definition

Entities are defined in the `entities:` section of your `yama.yaml` file. Each entity represents a database table.

### Basic Structure

```yaml
entities:
  EntityName:
    table: table_name          # Database table name
    fields:
      fieldName: type [constraints]
    relations:
      # Advanced relationship config (optional)
```

## Field Types

YAMA supports the following field types:

- `string` - Variable length text
- `text` - Long text content (TEXT in PostgreSQL)
- `integer` - Whole numbers
- `decimal` - Decimal numbers (with precision/scale)
- `boolean` - True/false values
- `uuid` - UUID identifier
- `timestamp` - Date and time
- `date` - Date only
- `json` or `jsonb` - JSON data

## Field Syntax

### Shorthand Syntax (Recommended)

YAMA supports concise shorthand syntax for field definitions:

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!                      # ! = required (NOT NULL)
      email: string!                 # Required string
      name: string?                  # ? = nullable
      age: integer = 0               # Default value
      role: enum[user, admin]        # Enum with values
      createdAt: timestamp           # Auto-populated
      published: boolean = false     # Boolean with default
```

### Field Modifiers

- `type!` - Required field (NOT NULL), e.g., `string!`, `uuid!`
- `type?` - Nullable field, e.g., `string?`, `integer?`
- `enum[val1, val2, ...]` - Enum type with comma-separated values
- `type = value` - Default value, e.g., `boolean = false`, `integer = 0`

## Field Constraints (Inline)

You can add constraints directly in field definitions using inline syntax:

```yaml
entities:
  User:
    table: users
    fields:
      email: string! unique          # Required, unique constraint
      slug: string! unique indexed   # Required, unique, indexed
      name: string! indexed          # Required, indexed
      age: integer min:18 max:120    # Min/max constraints
      bio: text?                     # Nullable text
      status: string default:active  # Default value
```

### Supported Inline Constraints

- `!` - Required (NOT NULL)
- `unique` - Unique constraint (database-level)
- `indexed` or `index` - Create index on this field
- `default:value` - Default value
- `min:N` - Minimum value (for numbers) or length (for strings)
- `max:N` - Maximum value (for numbers) or length (for strings)

**Examples:**

```yaml
email: string! unique indexed
age: integer min:18 max:120
bio: text?
status: string default:active
title: string! min:5 max:200 indexed
```

### Full Object Syntax

For advanced configuration, use the full object syntax:

```yaml
entities:
  User:
    table: users
    fields:
      id:
        type: uuid
        primary: true
        generated: true              # Auto-generate UUID
      email:
        type: string
        required: true
        unique: true                 # Unique constraint
        index: true                  # Create index
      name:
        type: string
        nullable: true               # Allow NULL
      age:
        type: integer
        default: 0
        min: 0
        max: 150
      createdAt:
        type: timestamp
        default: now                 # Current timestamp
```

## Relationships

YAMA supports two ways to define relationships: **inline relations** (recommended) and **explicit relations** (for advanced control).

### Inline Relations (Recommended)

Define relations directly in the `fields:` section. Foreign keys are automatically generated:

```yaml
entities:
  Post:
    table: posts
    fields:
      id: uuid!
      title: string!
      # Inline relation - auto-generates authorId: uuid!
      author: User! cascade         # belongsTo with cascade delete
      comments: Comment[]           # hasMany
      tags: Tag[] through:post_tags # manyToMany with junction table

  Comment:
    table: comments
    fields:
      id: uuid!
      content: text!
      # Inline relations - auto-generate foreign keys
      post: Post! cascade          # belongsTo - auto-generates postId
      user: User!                  # belongsTo - auto-generates userId
```

### Inline Relation Syntax

- `Entity!` - belongsTo relationship (required, auto-generates `entityId` foreign key)
- `Entity?` - hasOne relationship (nullable)
- `Entity[]` - hasMany or manyToMany relationship
  - If `through:table` is specified → manyToMany
  - Otherwise → hasMany

### Inline Relation Modifiers

- `cascade` - CASCADE on delete (for belongsTo: `onDelete: cascade`)
- `setNull` - SET NULL on delete
- `restrict` - RESTRICT delete (default)
- `indexed` - Create index on foreign key
- `through:tableName` - Custom join table name for manyToMany

**Examples:**

```yaml
author: User! cascade indexed
tags: Tag[] through:post_tags
manager: User? setNull
posts: Post[]                    # hasMany (no through = hasMany)
followers: User[] through:user_followers  # manyToMany
```

### Relationship Types

**One-to-Many:**

```yaml
User:
  posts: Post[]

Post:
  author: User!
```

→ Creates `author_id` foreign key in posts table

**Many-to-Many:**

```yaml
Post:
  tags: Tag[]

Tag:
  posts: Post[]
```

→ Auto-creates `post_tags` join table (or use `through:custom_table`)

**One-to-One:**

```yaml
User:
  profile: Profile?

Profile:
  user: User!
```

→ Creates `user_id` foreign key in profiles table

### Advanced Relations Block

For complex scenarios, use the `relations:` section:

```yaml
Post:
  relations:
    comments:
      type: hasMany
      target: Comment
      foreignKey: postId
      onDelete: cascade
      where: { deleted: false }
      orderBy: createdAt desc
    
    tags:
      type: manyToMany
      target: Tag
      through: post_tags
      fields:
        order: integer
        isPrimary: boolean
        addedAt: timestamp!
```

### Explicit Relations Syntax

You can also use shorthand in the `relations:` section:

```yaml
entities:
  User:
    relations:
      posts: hasMany(Post)           # One-to-many
      profile: hasOne(Profile)        # One-to-one

  Post:
    relations:
      author: belongsTo(User)         # Many-to-one
      comments: hasMany(Comment)       # One-to-many
      tags: manyToMany(Tag)           # Many-to-many
```

## Complete Examples

### Blog System

```yaml
entities:
  User:
    fields:
      id: uuid!
      email: string! unique
      name: string
      createdAt: timestamp
    
    posts: Post[]
    comments: Comment[]

  Post:
    fields:
      id: uuid!
      title: string! indexed
      content: text
      publishedAt: timestamp?
    
    author: User! cascade
    tags: Tag[] through:post_tags
    comments: Comment[]

  Tag:
    fields:
      id: uuid!
      name: string! unique
    
    posts: Post[]

  Comment:
    fields:
      id: uuid!
      content: text!
      createdAt: timestamp
    
    author: User! cascade
    post: Post! cascade
```

### E-commerce System

```yaml
entities:
  Customer:
    fields:
      id: uuid!
      email: string! unique
      name: string!
    
    orders: Order[]
    addresses: Address[]

  Order:
    fields:
      id: uuid!
      status: string! default:pending
      total: decimal! precision:10 scale:2
      createdAt: timestamp
    
    customer: Customer! cascade
    items: OrderItem[]

  Product:
    fields:
      id: uuid!
      name: string!
      price: decimal! precision:10 scale:2
      stock: integer! min:0
    
    orderItems: OrderItem[]

  OrderItem:
    fields:
      id: uuid!
      quantity: integer! min:1
      price: decimal!
    
    order: Order! cascade
    product: Product! restrict
```

## Validations

Define field validations declaratively:

```yaml
entities:
  User:
    table: users
    fields:
      email: string! unique          # Inline constraint: unique
      name: string!
    validations:
      email: [email]                 # Email format (unique already in field)
      name: [minLength(2), maxLength(100)]  # Length validation
```

### Validation Rules

- `email` - Email format validation
- `unique` - Unique constraint
- `minLength(n)` - Minimum length
- `maxLength(n)` - Maximum length
- `min(n)` - Minimum numeric value
- `max(n)` - Maximum numeric value
- `url` - URL format validation
- `slug` - Slug format validation

## Computed Fields

Define virtual fields calculated from other fields:

```yaml
entities:
  User:
    fields:
      firstName: string!
      lastName: string!
    computed:
      fullName: "{firstName} {lastName}"        # String concatenation
      postCount: "count(posts)"                  # Count related records
```

## Hooks

Define lifecycle hooks for custom logic:

```yaml
entities:
  User:
    hooks:
      beforeCreate: ./hooks/user.beforeCreate.ts
      afterCreate: ./hooks/user.afterCreate.ts
      beforeUpdate: ./hooks/user.beforeUpdate.ts
      afterDelete: ./hooks/user.afterDelete.ts
```

Available hooks:
- `beforeCreate`, `afterCreate`
- `beforeUpdate`, `afterUpdate`
- `beforeDelete`, `afterDelete`
- `beforeSave`, `afterSave`

## CRUD Configuration

Enable automatic CRUD endpoint generation:

```yaml
entities:
  Todo:
    table: todos
    crud:
      enabled: true                 # Enable all CRUD endpoints
      # OR
      enabled: [GET, POST, PUT, DELETE]  # Specific methods
      path: /todos                  # Custom base path
      auth:
        required: true
        roles: [admin]
```

## Soft Deletes

Enable soft deletes to mark records as deleted:

```yaml
entities:
  Post:
    table: posts
    softDelete: true                 # Adds deletedAt timestamp
    fields:
      id: uuid!
      title: string!
```

## Indexes

Define database indexes:

```yaml
entities:
  Post:
    indexes:
      - [authorId, publishedAt]      # Composite index
      - published                    # Single field index
      - name: idx_title_published    # Named index
        fields: [title, published]
        unique: true
```

## Best Practices

1. **Use inline syntax for simple relationships:**
   ```yaml
   author: User! cascade
   ```

2. **Use relations block for complex cases:**
   ```yaml
   relations:
     followers:
       type: manyToMany
       through: user_followers
   ```

3. **Add timestamps for audit trails:**
   ```yaml
   createdAt: timestamp
   updatedAt: timestamp
   ```

4. **Use meaningful foreign key cascades:**
   - `cascade` - Delete related records
   - `setNull` - Keep records but nullify relationship
   - `restrict` - Prevent deletion if related records exist

5. **Use shorthand syntax when possible** - It's cleaner and more readable

6. **Add indexes on frequently queried fields:**
   ```yaml
   email: string! unique indexed
   ```
