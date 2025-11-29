import type { GetAuthorHandlerContext, Author } from "@yama/gen";

export async function getAuthor(
  context: GetAuthorHandlerContext
): Promise<Author | { error: string; message: string }> {
  // context.params.id is already typed as string
  const { id } = context.params;
  const author = await context.entities.Author.findById(id);

  if (!author) {
    context.status(404);
    return {
      error: "Not found",
      message: `Author with id "${id}" not found`,
    };
  }

  return author;
}
