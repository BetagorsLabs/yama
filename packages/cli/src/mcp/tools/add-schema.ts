import { z } from "zod";
import { addSchemaCommand } from "../../commands/add-schema.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
});

export const yamaAddSchemaTool = {
  name: "yama_add_schema",
  description: "Add a new schema to yama.yaml configuration (interactive - will prompt for schema details)",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => addSchemaCommand({ config: args.config }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Schema added successfully\n\n${result.output}`
            : `❌ Failed to add schema\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
