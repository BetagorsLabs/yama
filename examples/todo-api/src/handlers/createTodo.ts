import type { CreateTodoHandlerContext } from "@yama/gen/handler-contexts";
import type * as Types from "@yama/gen/types";

export async function createTodo(
  context: CreateTodoHandlerContext
): Promise<Types.Todo> {
  // context.body is already typed as CreateTodoInput - no need for type assertion!
  // entities are added at runtime, so we need a type assertion here
  const todo = await context.entities.Todo.create(context.body);
  
  return todo;
}
