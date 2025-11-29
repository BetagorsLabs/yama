/**
 * Helper function to conditionally run TUI or fallback to text output
 * This ensures CI compatibility by automatically detecting the environment
 */
export async function withTUI<T>(
  tuiRenderer: () => Promise<void> | void,
  textFallback: () => Promise<void> | void
): Promise<void> {
  const { shouldUseTUI } = await import('./tui-utils.ts');
  
  if (shouldUseTUI()) {
    try {
      await tuiRenderer();
    } catch (error) {
      // If TUI fails, fall back to text output
      // This can happen if stdout is redirected or TUI libraries fail to initialize
      if (error instanceof Error && (
        error.message.includes('stdout') ||
        error.message.includes('TTY') ||
        error.message.includes('isatty')
      )) {
        await textFallback();
      } else {
        throw error;
      }
    }
  } else {
    await textFallback();
  }
}
