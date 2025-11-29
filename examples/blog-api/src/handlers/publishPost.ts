import type { PublishPostHandlerContext, Post } from "@yama/gen";

export async function publishPost(
  context: PublishPostHandlerContext
): Promise<Post | { error: string; message: string }> {
  // context.params.id is already typed as string
  const { id } = context.params;
  const updated = await context.entities.Post.update(id, {
    published: true,
    publishedAt: new Date().toISOString(),
  });

  if (!updated) {
    context.status(404);
    return {
      error: "Not found",
      message: `Post with id "${id}" not found`,
    };
  }

  return updated;
}
