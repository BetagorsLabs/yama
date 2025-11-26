import type { HandlerContext } from "@betagors/yama-core";
import type { TodoList } from "@yama/types";

export async function getTodos(
  context: HandlerContext
): Promise<TodoList> {
  const query = context.query as {
    completed?: boolean;
    limit?: number;
    offset?: number;
  };
  const { completed, limit, offset = 0 } = query;
  
  const todos = await (context.entities?.Todo as any).findAll({
    completed,
    limit,
    offset
  });
  
  return {
    todos
  };
}

