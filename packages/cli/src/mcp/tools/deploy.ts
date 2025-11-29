import { z } from "zod";
import { deployCommand } from "../../commands/deploy.ts";
import { executeCommand } from "../utils/output-capture.ts";

const inputSchema = z.object({
  config: z.string().optional().describe("Path to yama.yaml configuration file"),
  env: z.string().describe("Environment name (e.g., production, staging)"),
  plan: z.boolean().optional().describe("Show deployment plan without deploying"),
  dryRun: z.boolean().optional().describe("Perform a dry run without making changes"),
  autoRollback: z.boolean().optional().describe("Automatically rollback on failure"),
});

export const yamaDeployTool = {
  name: "yama_deploy",
  description: "Deploy schema migrations to an environment",
  inputSchema,
  handler: async (args: z.infer<typeof inputSchema>) => {
    const result = await executeCommand(
      () => deployCommand({ 
        config: args.config,
        env: args.env,
        plan: args.plan,
        dryRun: args.dryRun,
        autoRollback: args.autoRollback,
      }),
      { suppressExit: true }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ Deployment successful\n\n${result.output}`
            : `❌ Deployment failed\n\n${result.output}\n${result.error || ""}`,
        },
      ],
    };
  },
};
