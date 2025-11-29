import type { UpdatePostHandlerContext, Post } from "@yama/gen";

export async function updatePost(
  context: UpdatePostHandlerContext
): Promise<Post | { error: string; message: string }> {
  // context.params.id is already typed as string
  const { id } = context.params;
  // context.body is already typed as UpdatePostInput
  const updated = await context.entities.Post.update(id, context.body);

  if (!updated) {
    context.status(404);
    return {
      error: "Not found",
      message: `Post with id "${id}" not found`,
    };
  }

  return updated;
}
