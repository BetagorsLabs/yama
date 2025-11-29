import { z } from "zod";
import { initCommand } from "../../commands/init.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  name: z.string().optional().describe("Project name"),
  version: z.string().optional().describe("Project version (default: 1.0.0)"),
});

export const yamaInitTool = {
  name: "yama_init",
  description: "Initialize a new Yama project (interactive - will prompt for database plugin)",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => initCommand({ 
        name: args.name,
        version: args.version,
      }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Project initialized successfully\n\n${result.output}`
            : `❌ Failed to initialize project\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
