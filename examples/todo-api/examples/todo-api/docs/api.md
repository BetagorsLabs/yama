# todo-api

**Version:** 1.0.0

---

## /todos

### `GET` Get all todos

Get all todos

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| completed | query | No | boolean | Query parameter: completed |
| limit | query | No | integer | Query parameter: limit |
| offset | query | No | integer | Query parameter: offset |

**Responses:**

- `200`: Success (`TodoList`)
- `400`: Bad Request
- `500`: Internal Server Error

---

### `POST` Create a new todo

Create a new todo

**Request Body:** `CreateTodoInput`

**Responses:**

- `200`: Success (`Todo`)
- `400`: Bad Request
- `500`: Internal Server Error

---

## /todos/{id}

### `GET` Get a single todo by ID

Get a single todo by ID

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string | Path parameter: id |

**Responses:**

- `200`: Success (`Todo`)
- `400`: Bad Request
- `500`: Internal Server Error

---

### `PUT` Update a todo

Update a todo

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string | Path parameter: id |

**Request Body:** `UpdateTodoInput`

**Responses:**

- `200`: Success (`Todo`)
- `400`: Bad Request
- `500`: Internal Server Error

---

### `DELETE` Delete a todo

Delete a todo

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string | Path parameter: id |

**Responses:**

- `204`: No Content
- `400`: Bad Request
- `500`: Internal Server Error

---

## Models

### Todo

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | Yes | |
| title | string | Yes | |
| completed | boolean | No | |
| createdAt | string (date-time) | No | |

### CreateTodoInput

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| title | string | Yes | |
| completed | boolean | No | |

### UpdateTodoInput

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| title | string | No | |
| completed | boolean | No | |

### TodoList

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| todos | array<object> | No | |

