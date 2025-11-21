import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "../types.js";

// Mock drizzle-orm first
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column: any, value: any) => ({ column, value, type: "eq" })),
  and: vi.fn((...conditions: any[]) => ({ conditions, type: "and" })),
}));

// Mock the database module - need to return a default mock so db.ts initializes correctly
// Create a default mock db instance that will be used when module loads
const createMockDb = () => ({
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
});

// Create a default mock that will be used at module load time
const defaultMockDb = createMockDb();

vi.mock("@yama/db-postgres", () => ({
  postgresqlAdapter: {
    getClient: vi.fn(() => defaultMockDb),
  },
}));

// Mock the generated schema and mapper
vi.mock("../generated/db/schema.js", () => ({
  todos: {
    id: "id",
    title: "title",
    completed: "completed",
    createdAt: "createdAt",
  },
}));

vi.mock("../generated/db/mapper.js", () => ({
  mapTodoEntityToTodo: (entity: any) => ({
    id: entity.id,
    title: entity.title,
    completed: entity.completed ?? false,
    createdAt: entity.createdAt,
  }),
  mapTodoToTodoEntity: (todo: any) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed ?? false,
    createdAt: todo.createdAt,
  }),
}));

import { postgresqlAdapter } from "@yama/db-postgres";
import { todos } from "../generated/db/schema.js";

describe("Database Functions", () => {
  let mockDb: any;
  let dbModule: typeof import("./db.js");

  beforeEach(async () => {
    // Create a fresh mock database instance for each test
    mockDb = createMockDb();

    // Update the mock to return our fresh instance
    vi.mocked(postgresqlAdapter.getClient).mockReturnValue(mockDb as any);
    
    // Reset modules to reload db.ts with the new mock
    vi.resetModules();
    
    // Re-import the module after mock is set up
    dbModule = await import("./db.js");
    
    // Clear call history but keep the return value
    vi.clearAllMocks();
    // Restore the return value after clearing
    vi.mocked(postgresqlAdapter.getClient).mockReturnValue(mockDb as any);
  });

  describe("createTodo", () => {
    it("should create a todo successfully", async () => {
      const input: CreateTodoInput = {
        title: "Test Todo",
        completed: false,
      };

      const mockEntity = {
        id: "123",
        title: "Test Todo",
        completed: false,
        createdAt: new Date().toISOString(),
      };

      mockDb.values.mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockEntity]),
      });

      const result = await dbModule.createTodo(input);

      expect(result).toMatchObject({
        id: "123",
        title: "Test Todo",
        completed: false,
      });
      expect(result.id).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalledWith(todos);
      expect(mockDb.values).toHaveBeenCalled();
    });

    it("should throw error when database is not initialized", async () => {
      // Make getClient throw error and reload module
      vi.mocked(postgresqlAdapter.getClient).mockImplementation(() => {
        throw new Error("Database not initialized");
      });
      vi.resetModules();
      const freshModule = await import("./db.js");
      
      await expect(freshModule.createTodo({ title: "Test" })).rejects.toThrow(
        "Database not initialized"
      );
    });
  });

  describe("getTodoById", () => {
    it("should return a todo when found", async () => {
      const mockEntity = {
        id: "123",
        title: "Test Todo",
        completed: true,
        createdAt: new Date().toISOString(),
      };

      mockDb.where.mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockEntity]),
      });

      const result = await dbModule.getTodoById("123");

      expect(result).toMatchObject({
        id: "123",
        title: "Test Todo",
        completed: true,
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(todos);
    });

    it("should return null when todo not found", async () => {
      mockDb.where.mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await dbModule.getTodoById("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error when database is not initialized", async () => {
      vi.mocked(postgresqlAdapter.getClient).mockImplementation(() => {
        throw new Error("Database not initialized");
      });
      vi.resetModules();
      const freshModule = await import("./db.js");
      
      await expect(freshModule.getTodoById("123")).rejects.toThrow(
        "Database not initialized"
      );
    });
  });

  describe("getAllTodos", () => {
    it("should return all todos without filters", async () => {
      const mockEntities = [
        {
          id: "1",
          title: "Todo 1",
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Todo 2",
          completed: true,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockEntities),
      });

      const result = await dbModule.getAllTodos();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Todo 1");
      expect(result[1].title).toBe("Todo 2");
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(todos);
    });

    it("should filter by completed status", async () => {
      const mockEntities = [
        {
          id: "1",
          title: "Todo 1",
          completed: true,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDb.where.mockResolvedValue(mockEntities);

      const result = await dbModule.getAllTodos(true);

      expect(result).toHaveLength(1);
      expect(result[0].completed).toBe(true);
    });

    it("should apply limit", async () => {
      const mockEntities = [
        {
          id: "1",
          title: "Todo 1",
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDb.limit.mockResolvedValue(mockEntities);

      const result = await dbModule.getAllTodos(undefined, 1);

      expect(result).toHaveLength(1);
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should apply offset", async () => {
      const mockEntities = [
        {
          id: "2",
          title: "Todo 2",
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEntities);

      const result = await dbModule.getAllTodos(undefined, undefined, 1);

      expect(result).toHaveLength(1);
      expect(mockDb.offset).toHaveBeenCalledWith(1);
    });

    it("should combine filters correctly", async () => {
      const mockEntities: any[] = [];

      mockDb.where.mockReturnValue({
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(mockEntities),
        }),
      });

      await dbModule.getAllTodos(false, 10, 5);

      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should throw error when database is not initialized", async () => {
      vi.mocked(postgresqlAdapter.getClient).mockImplementation(() => {
        throw new Error("Database not initialized");
      });
      vi.resetModules();
      const freshModule = await import("./db.js");
      
      await expect(freshModule.getAllTodos()).rejects.toThrow("Database not initialized");
    });
  });

  describe("updateTodo", () => {
    it("should update a todo successfully", async () => {
      const input: UpdateTodoInput = {
        title: "Updated Todo",
        completed: true,
      };

      const mockEntity = {
        id: "123",
        title: "Updated Todo",
        completed: true,
        createdAt: new Date().toISOString(),
      };

      mockDb.set.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEntity]),
        }),
      });

      const result = await dbModule.updateTodo("123", input);

      expect(result).toMatchObject({
        id: "123",
        title: "Updated Todo",
        completed: true,
      });
      expect(mockDb.update).toHaveBeenCalledWith(todos);
      expect(mockDb.set).toHaveBeenCalled();
    });

    it("should return null when todo not found", async () => {
      mockDb.set.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await dbModule.updateTodo("nonexistent", { title: "New" });

      expect(result).toBeNull();
    });

    it("should throw error when database is not initialized", async () => {
      vi.mocked(postgresqlAdapter.getClient).mockImplementation(() => {
        throw new Error("Database not initialized");
      });
      vi.resetModules();
      const freshModule = await import("./db.js");
      
      await expect(freshModule.updateTodo("123", {})).rejects.toThrow(
        "Database not initialized"
      );
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo successfully", async () => {
      const mockEntity = {
        id: "123",
        title: "Test Todo",
        completed: false,
        createdAt: new Date().toISOString(),
      };

      mockDb.where.mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockEntity]),
      });

      const result = await dbModule.deleteTodo("123");

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalledWith(todos);
      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should return false when todo not found", async () => {
      mockDb.where.mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      });

      const result = await dbModule.deleteTodo("nonexistent");

      expect(result).toBe(false);
    });

    it("should throw error when database is not initialized", async () => {
      vi.mocked(postgresqlAdapter.getClient).mockImplementation(() => {
        throw new Error("Database not initialized");
      });
      vi.resetModules();
      const freshModule = await import("./db.js");
      
      await expect(freshModule.deleteTodo("123")).rejects.toThrow(
        "Database not initialized"
      );
    });
  });
});

