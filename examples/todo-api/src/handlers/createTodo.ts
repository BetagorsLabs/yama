import type { HttpRequest, HttpResponse } from "@yama/core";
import { todoRepository } from "../db.js";
import type { CreateTodoInput } from "../types.js"; // Generated types!

export async function createTodo(
  request: HttpRequest,
  reply: HttpResponse
) {
  // Validation is now automatic! Just use the data
  const todo = await todoRepository.create(request.body as CreateTodoInput);

  reply.status(201);
  return todo;
}

