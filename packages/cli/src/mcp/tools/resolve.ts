import { z } from "zod";
import { resolveCommand } from "../../commands/resolve.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
  base: z.string().optional().describe("Base snapshot hash for merge"),
  local: z.string().optional().describe("Local snapshot hash"),
  remote: z.string().optional().describe("Remote snapshot hash"),
});

export const yamaResolveTool = {
  name: "yama_resolve",
  description: "Resolve schema conflicts by merging migration schemas",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => resolveCommand({ 
        config: args.config,
        base: args.base,
        local: args.local,
        remote: args.remote,
      }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Schema conflicts resolved successfully\n\n${result.output}`
            : `❌ Failed to resolve conflicts\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
