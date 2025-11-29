import type { CreatePostHandlerContext, Post } from "@yama/gen";

export async function createPost(
  context: CreatePostHandlerContext
): Promise<Post> {
  // context.body is already typed as CreatePostInput
  const post = await context.entities.Post.create(context.body);

  return post;
}
