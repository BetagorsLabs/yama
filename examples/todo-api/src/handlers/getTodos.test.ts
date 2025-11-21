import { describe, it, expect, beforeEach, vi } from "vitest";
import { getTodos } from "./getTodos.js";
import type { HttpRequest, HttpResponse } from "@yama/core";
import * as db from "../db.js";

// Mock the database module
vi.mock("../db.js", () => ({
  getAllTodos: vi.fn(),
}));

describe("getTodos Handler", () => {
  let mockRequest: Partial<HttpRequest>;
  let mockReply: Partial<HttpResponse>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      query: {},
    };

    mockReply = {};
  });

  it("should return all todos", async () => {
    const mockTodos = [
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

    vi.mocked(db.getAllTodos).mockResolvedValue(mockTodos);

    const result = await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(db.getAllTodos).toHaveBeenCalledWith(undefined, undefined, 0);
    expect(result).toEqual({ todos: mockTodos });
  });

  it("should filter by completed status", async () => {
    const mockTodos = [
      {
        id: "1",
        title: "Completed Todo",
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    mockRequest.query = { completed: true };
    vi.mocked(db.getAllTodos).mockResolvedValue(mockTodos);

    const result = await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(db.getAllTodos).toHaveBeenCalledWith(true, undefined, 0);
    expect(result.todos).toHaveLength(1);
    expect(result.todos![0].completed).toBe(true);
  });

  it("should filter by completed false", async () => {
    const mockTodos = [
      {
        id: "1",
        title: "Incomplete Todo",
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    mockRequest.query = { completed: false };
    vi.mocked(db.getAllTodos).mockResolvedValue(mockTodos);

    const result = await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(db.getAllTodos).toHaveBeenCalledWith(false, undefined, 0);
    expect(result.todos![0].completed).toBe(false);
  });

  it("should apply limit", async () => {
    const mockTodos = [
      {
        id: "1",
        title: "Todo 1",
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    mockRequest.query = { limit: 10 };
    vi.mocked(db.getAllTodos).mockResolvedValue(mockTodos);

    await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(db.getAllTodos).toHaveBeenCalledWith(undefined, 10, 0);
  });

  it("should apply offset", async () => {
    const mockTodos: any[] = [];

    mockRequest.query = { offset: 5 };
    vi.mocked(db.getAllTodos).mockResolvedValue(mockTodos);

    await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(db.getAllTodos).toHaveBeenCalledWith(undefined, undefined, 5);
  });

  it("should combine query parameters", async () => {
    const mockTodos: any[] = [];

    mockRequest.query = {
      completed: true,
      limit: 20,
      offset: 10,
    };
    vi.mocked(db.getAllTodos).mockResolvedValue(mockTodos);

    await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(db.getAllTodos).toHaveBeenCalledWith(true, 20, 10);
  });

  it("should return empty array when no todos exist", async () => {
    vi.mocked(db.getAllTodos).mockResolvedValue([]);

    const result = await getTodos(
      mockRequest as HttpRequest,
      mockReply as HttpResponse
    );

    expect(result).toEqual({ todos: [] });
  });

  it("should propagate database errors", async () => {
    const error = new Error("Database query failed");
    vi.mocked(db.getAllTodos).mockRejectedValue(error);

    await expect(
      getTodos(
        mockRequest as HttpRequest,
        mockReply as HttpResponse
      )
    ).rejects.toThrow("Database query failed");
  });
});

