import type { GetPostCommentsHandlerContext, Comment } from "@yama/gen";

export async function getPostComments(
  context: GetPostCommentsHandlerContext
): Promise<Comment[]> {
  // context.params.id is already typed as string
  const { id } = context.params;

  const comments = await context.entities.Comment.findAll({
    where: { postId: id },
  });

  return comments;
}
