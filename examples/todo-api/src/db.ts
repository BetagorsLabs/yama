// Database helper - uses generated code
import { getDatabase } from "@yama/db-postgres";
import { todos } from "../generated/db/schema.js";
import { mapTodoEntityToTodo, mapTodoToTodoEntity } from "../generated/db/mapper.js";
import { eq, and } from "drizzle-orm";
import type { Todo } from "../types.js";
import type { CreateTodoInput, UpdateTodoInput } from "../types.js";

let db: ReturnType<typeof getDatabase> | null = null;

try {
  db = getDatabase();
} catch (error) {
  console.warn("Database not initialized - handlers will fail without DB connection");
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  if (!db) throw new Error("Database not initialized");
  const entityData = mapTodoToTodoEntity(input as any);
  const [entity] = await db.insert(todos).values(entityData).returning();
  return mapTodoEntityToTodo(entity);
}

export async function getTodoById(id: string): Promise<Todo | null> {
  if (!db) throw new Error("Database not initialized");
  const [entity] = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  if (!entity) return null;
  return mapTodoEntityToTodo(entity);
}

export async function getAllTodos(completed?: boolean, limit?: number, offset?: number): Promise<Todo[]> {
  if (!db) throw new Error("Database not initialized");
  let query = db.select().from(todos);
  
  if (completed !== undefined) {
    query = query.where(eq(todos.completed, completed)) as any;
  }
  
  if (limit !== undefined) {
    query = query.limit(limit) as any;
  }
  
  if (offset !== undefined) {
    query = query.offset(offset) as any;
  }
  
  const entities = await query;
  return entities.map(mapTodoEntityToTodo);
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo | null> {
  if (!db) throw new Error("Database not initialized");
  const entityData = mapTodoToTodoEntity(input as any);
  const [entity] = await db.update(todos)
    .set(entityData)
    .where(eq(todos.id, id))
    .returning();
  
  if (!entity) return null;
  return mapTodoEntityToTodo(entity);
}

export async function deleteTodo(id: string): Promise<boolean> {
  if (!db) throw new Error("Database not initialized");
  const result = await db.delete(todos).where(eq(todos.id, id)).returning();
  return result.length > 0;
}

