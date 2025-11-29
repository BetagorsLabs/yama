# YAMA Schema Examples

Common schema patterns and examples for YAMA entity definitions.

## Basic Entity Examples

### Simple Todo Entity

```yaml
entities:
  Todo:
    table: todos
    crud:
      enabled: true
    fields:
      id: uuid!
      title: string!
      completed: boolean = false
      createdAt: timestamp
      updatedAt: timestamp
```

### User Entity with Validations

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique indexed
      name: string!
      passwordHash: string!
      role: enum[user, admin, moderator]
      createdAt: timestamp
      updatedAt: timestamp
    validations:
      email: [email]
      name: [minLength(2), maxLength(100)]
```

### Product Entity with Pricing

```yaml
entities:
  Product:
    table: products
    crud:
      enabled: true
    fields:
      id: uuid!
      name: string! indexed
      description: text?
      price: decimal! precision:10 scale:2
      stock: integer! min:0 default:0
      sku: string! unique indexed
      published: boolean = false
      createdAt: timestamp
      updatedAt: timestamp
```

## Relationship Examples

### One-to-Many: User and Posts

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique
      name: string!
      posts: Post[]              # hasMany

  Post:
    table: posts
    fields:
      id: uuid!
      title: string! indexed
      content: text!
      published: boolean = false
      author: User! cascade      # belongsTo - auto-generates authorId
      createdAt: timestamp
```

### Many-to-Many: Posts and Tags

```yaml
entities:
  Post:
    table: posts
    fields:
      id: uuid!
      title: string!
      content: text!
      tags: Tag[] through:post_tags  # manyToMany

  Tag:
    table: tags
    fields:
      id: uuid!
      name: string! unique
      slug: string! unique indexed
      posts: Post[]              # manyToMany (reverse)
```

### One-to-One: User and Profile

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique
      name: string!
      profile: Profile?          # hasOne (nullable)

  Profile:
    table: profiles
    fields:
      id: uuid!
      bio: text?
      website: string?
      avatarUrl: string?
      user: User!                 # belongsTo - auto-generates userId
```

### Complex Relationships: Blog System

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique
      name: string!
      posts: Post[]
      comments: Comment[]

  Post:
    table: posts
    fields:
      id: uuid!
      title: string! indexed
      content: text!
      excerpt: string?
      published: boolean = false
      publishedAt: timestamp?
      author: User! cascade
      comments: Comment[]
      tags: Tag[] through:post_tags
      createdAt: timestamp
      updatedAt: timestamp
    indexes:
      - [authorId, publishedAt]
      - published

  Comment:
    table: comments
    fields:
      id: uuid!
      content: text!
      author: User! cascade
      post: Post! cascade
      createdAt: timestamp
    indexes:
      - postId

  Tag:
    table: tags
    fields:
      id: uuid!
      name: string! unique
      slug: string! unique indexed
      posts: Post[]
```

## E-commerce Examples

### Order System

```yaml
entities:
  Customer:
    table: customers
    fields:
      id: uuid!
      email: string! unique
      name: string!
      orders: Order[]
      addresses: Address[]

  Order:
    table: orders
    fields:
      id: uuid!
      status: enum[pending, processing, shipped, delivered, cancelled]
      total: decimal! precision:10 scale:2
      customer: Customer! cascade
      items: OrderItem[]
      shippingAddress: Address?
      createdAt: timestamp
      updatedAt: timestamp
    indexes:
      - [customerId, createdAt]
      - status

  Product:
    table: products
    fields:
      id: uuid!
      name: string! indexed
      description: text?
      price: decimal! precision:10 scale:2
      stock: integer! min:0
      sku: string! unique indexed
      orderItems: OrderItem[]

  OrderItem:
    table: order_items
    fields:
      id: uuid!
      quantity: integer! min:1
      price: decimal! precision:10 scale:2
      order: Order! cascade
      product: Product! restrict
    indexes:
      - orderId

  Address:
    table: addresses
    fields:
      id: uuid!
      street: string!
      city: string!
      state: string!
      zipCode: string!
      country: string!
      customer: Customer! cascade
```

## Complex Entity Configurations

### Entity with Computed Fields

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      firstName: string!
      lastName: string!
      email: string! unique
    computed:
      fullName: "{firstName} {lastName}"
      initials: "upper(substring(firstName, 1, 1) + substring(lastName, 1, 1))"
      postCount: "count(posts)"
```

### Entity with Soft Deletes

```yaml
entities:
  Post:
    table: posts
    softDelete: true
    fields:
      id: uuid!
      title: string!
      content: text!
      author: User! cascade
      createdAt: timestamp
      updatedAt: timestamp
```

### Entity with Hooks

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique
      name: string!
      passwordHash: string!
    hooks:
      beforeCreate: ./hooks/user.beforeCreate.ts
      afterCreate: ./hooks/user.afterCreate.ts
      beforeUpdate: ./hooks/user.beforeUpdate.ts
```

### Entity with Advanced CRUD Configuration

```yaml
entities:
  Post:
    table: posts
    fields:
      id: uuid!
      title: string!
      content: text!
      published: boolean = false
      author: User! cascade
    crud:
      enabled: true
      path: /articles
      auth:
        required: true
        roles: [admin, editor]
      responseTypes:
        GET_LIST: PostSummary
        GET_ONE: PostDetail
      inputTypes:
        POST: CreatePostInput
        PATCH: UpdatePostInput
```

## Validation Examples

### Comprehensive Validation

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique indexed
      username: string! unique indexed
      passwordHash: string!
      age: integer?
      website: string?
    validations:
      email: [email]
      username: [minLength(3), maxLength(30), slug]
      age: [min(13), max(120)]
      website: [url]
```

### Field-Level Constraints

```yaml
entities:
  Product:
    table: products
    fields:
      id: uuid!
      name: string! min:5 max:200 indexed
      sku: string! unique indexed
      price: decimal! precision:10 scale:2 min:0
      stock: integer! min:0 default:0
      description: text? max:5000
```

## Index Examples

### Composite Indexes

```yaml
entities:
  Post:
    table: posts
    fields:
      id: uuid!
      authorId: uuid!
      published: boolean = false
      publishedAt: timestamp?
      title: string!
    indexes:
      - [authorId, publishedAt]      # Composite index
      - [published, publishedAt]     # Another composite
      - title                         # Single field
```

### Named Unique Indexes

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique
      username: string! unique
    indexes:
      - name: idx_user_email_username
        fields: [email, username]
        unique: true
```

## Multi-Entity System Example

### Social Media Platform

```yaml
entities:
  User:
    table: users
    fields:
      id: uuid!
      email: string! unique
      username: string! unique indexed
      name: string!
      bio: text?
      avatarUrl: string?
      posts: Post[]
      comments: Comment[]
      followers: User[] through:user_followers
      following: User[] through:user_followers
      createdAt: timestamp

  Post:
    table: posts
    fields:
      id: uuid!
      content: text!
      author: User! cascade
      likes: Like[]
      comments: Comment[]
      tags: Tag[] through:post_tags
      createdAt: timestamp
      updatedAt: timestamp
    softDelete: true
    indexes:
      - [authorId, createdAt]

  Comment:
    table: comments
    fields:
      id: uuid!
      content: text!
      author: User! cascade
      post: Post! cascade
      parentId: uuid?              # For nested comments
      likes: Like[]
      createdAt: timestamp
    indexes:
      - postId
      - parentId

  Like:
    table: likes
    fields:
      id: uuid!
      user: User! cascade
      post: Post? cascade
      comment: Comment? cascade
      createdAt: timestamp
    indexes:
      - [userId, postId]
      - [userId, commentId]

  Tag:
    table: tags
    fields:
      id: uuid!
      name: string! unique
      slug: string! unique indexed
      posts: Post[]
```

## Tips and Patterns

1. **Always use `uuid!` for primary keys** - Auto-generated UUIDs are recommended
2. **Add timestamps** - Include `createdAt` and `updatedAt` for audit trails
3. **Use inline relations** - They're cleaner and auto-generate foreign keys
4. **Index frequently queried fields** - Add `indexed` to fields used in WHERE clauses
5. **Use enums for status fields** - `enum[pending, active, completed]` is cleaner than strings
6. **Set defaults for boolean flags** - `published: boolean = false` is clearer
7. **Use cascade carefully** - Only cascade delete when it makes sense
8. **Add soft deletes for important data** - Use `softDelete: true` for audit trails
