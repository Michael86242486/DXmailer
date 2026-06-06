import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, "../api-zod/src/index.ts");
const content = readFileSync(file, "utf8");
const patched = content
  .split("\n")
  .filter((line) => !line.includes("./generated/types"))
  .join("\n")
  .replace(/\n{2,}/g, "\n");
writeFileSync(file, patched);
console.log("Patched api-zod/src/index.ts — removed ./generated/types export");
