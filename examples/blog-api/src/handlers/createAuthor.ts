import type { CreateAuthorHandlerContext, Author } from "@yama/gen";

export async function createAuthor(
  context: CreateAuthorHandlerContext
): Promise<Author> {
  // context.body is already typed as CreateAuthorInput
  const author = await context.entities.Author.create(context.body);

  return author;
}
