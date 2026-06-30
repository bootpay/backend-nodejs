const { copyFileSync, mkdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      console.error(
        `Unable to find ${command}. Run npm install before building.`,
      );
    }
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

rmSync(distDir, { recursive: true, force: true });
let tscBin;
try {
  tscBin = require.resolve("typescript/bin/tsc", { paths: [rootDir] });
} catch (error) {
  console.error("Unable to find typescript. Run npm install before building.");
  throw error;
}

run(process.execPath, [tscBin, "--p", "./tsconfig.json"]);
rmSync(join(distDir, "src"), { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
copyFileSync(join(rootDir, "README.md"), join(distDir, "README.md"));
