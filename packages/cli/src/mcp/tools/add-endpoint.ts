import { z } from "zod";
import { addEndpointCommand } from "../../commands/add-endpoint.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
});

export const yamaAddEndpointTool = {
  name: "yama_add_endpoint",
  description: "Add a new endpoint to yama.yaml configuration (interactive - will prompt for endpoint details)",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => addEndpointCommand({ config: args.config }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Endpoint added successfully\n\n${result.output}`
            : `❌ Failed to add endpoint\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
