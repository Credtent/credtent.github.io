import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sites = {
  "https://credtent.com": path.join(root, "sites/com"),
  "https://credtent.org": path.join(root, "sites/org")
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function fileFor(originDir, urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (clean === "/" || clean === "") return path.join(originDir, "index.html");
  const rel = clean.replace(/^\//, "").replace(/\/$/, "");
  const asFile = path.join(originDir, rel);
  const asIndex = path.join(originDir, rel, "index.html");
  if (fs.existsSync(asFile) && fs.statSync(asFile).isFile()) return asFile;
  if (fs.existsSync(asIndex)) return asIndex;
  return null;
}

const missing = [];
const pages = [];
for (const [origin, dir] of Object.entries(sites)) {
  for (const file of walk(dir)) pages.push({ origin, dir, file });
}

for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  const refs = [];
  for (const match of html.matchAll(/\b(?:href|src|srcset)=["']([^"']+)["']/g)) refs.push(match[1]);
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));
  for (const ref of refs) {
    if (ref.startsWith("data:") || ref.startsWith("mailto:") || ref.startsWith("tel:") || ref === "#") continue;
    const parts = ref.split(",").map((part) => part.trim().split(/\s+/)[0]);
    for (const raw of parts) {
      if (!raw || raw === "#") continue;
      let url;
      try {
        url = new URL(raw, page.origin + "/" + path.relative(page.dir, page.file).split(path.sep).join("/"));
      } catch {
        missing.push(`${page.file} bad url ${raw}`);
        continue;
      }
      const localDir = sites[url.origin];
      if (!localDir) continue;
      const found = fileFor(localDir, url.pathname);
      if (!found) missing.push(`${path.relative(root, page.file)} -> ${url.href}`);
      if (url.hash && found && path.resolve(found) === path.resolve(page.file)) {
        const id = url.hash.slice(1);
        if (id && !ids.has(id)) missing.push(`${path.relative(root, page.file)} missing #${id}`);
      }
    }
  }
}

if (missing.length) {
  console.error(missing.slice(0, 80).join("\n"));
  console.error(`\n${missing.length} link error(s).`);
  process.exit(1);
}
console.log(`link check passed (${pages.length} pages, internal links only)`);
