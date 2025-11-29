import { z } from "zod";
import { schemaCheckCommand } from "../../commands/schema-check.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
  diff: z.boolean().optional().describe("Show detailed diff of differences"),
  ci: z.boolean().optional().describe("CI mode (exit with code 1 if schema is out of sync)"),
  env: z.string().optional().describe("Environment name (default: development)"),
});

export const yamaSchemaCheckTool = {
  name: "yama_schema_check",
  description: "Check if the database schema is in sync with yama.yaml",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => schemaCheckCommand({ 
        config: args.config,
        diff: args.diff,
        ci: args.ci,
        env: args.env,
      }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Schema check completed\n\n${result.output}`
            : `❌ Schema check failed\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
