import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const jar = process.env.VNU_JAR || "/tmp/vnu.jar";
const result = spawnSync("java", [
  "-jar", jar,
  "--errors-only",
  "--skip-non-html",
  path.join(root, "sites/com"),
  path.join(root, "sites/org")
], { encoding: "utf8" });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
if (output) console.log(output);
if (result.status !== 0) process.exit(result.status || 1);
console.log("vnu HTML check passed");
