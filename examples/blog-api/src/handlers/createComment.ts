import type { CreateCommentHandlerContext, Comment } from "@yama/gen";

export async function createComment(
  context: CreateCommentHandlerContext
): Promise<Comment> {
  // context.params.id is already typed as string
  const { id } = context.params;
  // context.body is already typed as CreateCommentInput
  const comment = await context.entities.Comment.create({
    ...context.body,
    postId: id,
  });

  return comment;
}
