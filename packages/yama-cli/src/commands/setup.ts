import { existsSync } from "fs";
import { join } from "path";
import { readPackageJson, writePackageJson } from "../utils/file-utils.js";

interface SetupOptions {
  skipScripts?: boolean;
}

export async function setupCommand(options: SetupOptions): Promise<void> {
  const cwd = process.cwd();
  const packageJsonPath = join(cwd, "package.json");

  console.log("🔧 Setting up Yama in existing project...\n");

  if (!existsSync(packageJsonPath)) {
    console.error("❌ package.json not found. Run 'npm init' first.");
    process.exit(1);
  }

  try {
    const pkg = readPackageJson(packageJsonPath);
    
    // Add scripts
    if (!options.skipScripts) {
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      
      const scripts = pkg.scripts as Record<string, string>;
      scripts["yama:dev"] = "yama dev";
      scripts["yama:generate"] = "yama generate";
      scripts["yama:validate"] = "yama validate";
      
      writePackageJson(packageJsonPath, pkg);
      console.log("✅ Added scripts to package.json");
    }

    // Check for yama.yaml
    const yamaPath = join(cwd, "yama.yaml");
    if (!existsSync(yamaPath)) {
      console.log("⚠️  yama.yaml not found. Run 'yama init' to create one.");
    } else {
      console.log("✅ Found yama.yaml");
    }

    // Check for dependencies
    const deps = (pkg.dependencies || {}) as Record<string, string>;
    const devDeps = (pkg.devDependencies || {}) as Record<string, string>;
    
    const hasRuntime = "@yama/runtime-node" in deps || "@yama/runtime-node" in devDeps;
    
    if (!hasRuntime) {
      console.log("\n⚠️  @yama/runtime-node not found in dependencies.");
      console.log("   Install it with: npm install @yama/runtime-node");
    } else {
      console.log("✅ Found @yama/runtime-node");
    }

    console.log("\n✨ Setup complete!");
    console.log("\nAvailable commands:");
    console.log("  npm run yama:dev       - Start dev server");
    console.log("  npm run yama:generate  - Generate SDK/types");
    console.log("  npm run yama:validate  - Validate yama.yaml");
    
  } catch (error) {
    console.error("❌ Setup failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

