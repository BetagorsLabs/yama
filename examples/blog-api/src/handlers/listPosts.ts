import type { ListPostsHandlerContext, PostWithAuthor } from "@yama/gen";

export async function listPosts(
  context: ListPostsHandlerContext
): Promise<PostWithAuthor[]> {
  // context.query is already typed with published, authorId, limit, offset
  const { published, authorId, limit = 10, offset = 0 } = context.query;

  const posts = await context.entities.Post.findAll({
    published: published !== undefined ? (published === "true" || published === true) : undefined,
    authorId,
    limit: Number(limit),
    offset: Number(offset),
  });

  // Fetch authors for each post
  const authorIds = [...new Set(posts.map((p: any) => p.authorId))];
  const authors = await context.entities.Author.findAll({
    where: { id: { in: authorIds } },
  });

  const authorMap = new Map(authors.map((a: any) => [a.id, a]));

  return posts.map((post: any) => ({
    ...post,
    author: authorMap.get(post.authorId),
  }));
}
