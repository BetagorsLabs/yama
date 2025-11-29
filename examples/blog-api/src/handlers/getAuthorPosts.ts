import type { GetAuthorPostsHandlerContext, Post } from "@yama/gen";

export async function getAuthorPosts(
  context: GetAuthorPostsHandlerContext
): Promise<Post[]> {
  // context.params.id is already typed as string
  const { id } = context.params;

  const posts = await context.entities.Post.findAll({
    where: { authorId: id },
  });

  return posts;
}
