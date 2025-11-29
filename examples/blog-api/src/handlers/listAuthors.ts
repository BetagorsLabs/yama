import type { ListAuthorsHandlerContext, Author } from "@yama/gen";

export async function listAuthors(
  context: ListAuthorsHandlerContext
): Promise<Author[]> {
  const authors = await context.entities.Author.findAll();

  return authors;
}
