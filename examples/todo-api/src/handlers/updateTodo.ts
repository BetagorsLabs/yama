import type { HttpRequest, HttpResponse } from "@yama/core";
import { todoRepository } from "../db.js";
import type { UpdateTodoInput } from "../types.js"; // Generated types!

export async function updateTodo(
  request: HttpRequest,
  reply: HttpResponse
) {
  const params = request.params as { id: string };
  const { id } = params;
  const updated = await todoRepository.update(id, request.body as UpdateTodoInput);

  if (!updated) {
    reply.status(404).send({
      error: "Not found",
      message: `Todo with id "${id}" not found`
    });
    return;
  }

  return updated;
}

