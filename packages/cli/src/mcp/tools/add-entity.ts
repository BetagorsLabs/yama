import { z } from "zod";
import { addEntityCommand } from "../../commands/add-entity.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
});

export const yamaAddEntityTool = {
  name: "yama_add_entity",
  description: "Add a new entity to yama.yaml configuration (interactive - will prompt for entity details)",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => addEntityCommand({ config: args.config }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Entity added successfully\n\n${result.output}`
            : `❌ Failed to add entity\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
