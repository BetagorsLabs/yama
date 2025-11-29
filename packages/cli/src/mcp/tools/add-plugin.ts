import { z } from "zod";
import { addPluginCommand } from "../../commands/add-plugin.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
  name: z.string().describe("Plugin package name (e.g., @betagors/yama-postgres)"),
  configOnly: z.boolean().optional().describe("Only add to yama.yaml, don't install the package"),
});

export const yamaAddPluginTool = {
  name: "yama_add_plugin",
  description: "Add a plugin to yama.yaml and optionally install it",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => addPluginCommand({ 
        config: args.config,
        name: args.name,
        configOnly: args.configOnly,
      }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Plugin added successfully\n\n${result.output}`
            : `❌ Failed to add plugin\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
