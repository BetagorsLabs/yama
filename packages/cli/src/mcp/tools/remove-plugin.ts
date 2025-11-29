import { z } from "zod";
import { removePluginCommand } from "../../commands/remove-plugin.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
  name: z.string().describe("Plugin package name to remove"),
  keepPackage: z.boolean().optional().describe("Keep the npm package, only remove from yama.yaml"),
});

export const yamaRemovePluginTool = {
  name: "yama_remove_plugin",
  description: "Remove a plugin from yama.yaml and optionally uninstall the package",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => removePluginCommand({ 
        config: args.config,
        name: args.name,
        keepPackage: args.keepPackage,
      }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Plugin removed successfully\n\n${result.output}`
            : `❌ Failed to remove plugin\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
