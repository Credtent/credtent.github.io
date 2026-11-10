// The credtent.org DNS step waits on legal hold item 11 (Cherryh 2026-11-10, section 5): the cutover replaces the
// live /lws page, so it may not happen until Cherryh files a dated clearance note in the Claudia repo's agents/cherryh/.
// Run before cutover runbook Step 7 (point credtent.org at Vercel). It reads files only and changes nothing.
//   node scripts/check-org-dns-ready.mjs [path to agents/cherryh]
// Exit 0: a clearance note exists. Exit 1: the DNS step stays blocked.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_CHERRYH_DIR = "/Users/ericburgess/claudia/agents/cherryh";
// The LWS capture is dated 2026-11-01; a clearance cannot predate it.
const EARLIEST = "2026-11-01";
const NAME = /^(\d{4}-\d{2}-\d{2})-.*item-?11.*clear.*\.md$/i;

export function clearanceNote(dir = DEFAULT_CHERRYH_DIR, now = new Date()) {
  if (!fs.existsSync(dir)) return { ok: false, reason: `${dir} not found` };
  const today = now.toISOString().slice(0, 10);
  for (const name of fs.readdirSync(dir).sort().reverse()) {
    const match = name.match(NAME);
    if (!match) continue;
    const date = match[1];
    if (date < EARLIEST || date > today) continue;
    const text = fs.readFileSync(path.join(dir, name), "utf8");
    if (!/item\s*11/i.test(text) || !/\bcleared\b/i.test(text) || /\bnot\s+cleared\b/i.test(text)) continue;
    return { ok: true, note: name, date };
  }
  return { ok: false, reason: `no dated item-11 clearance note (YYYY-MM-DD-...item-11...clear....md, dated ${EARLIEST} to today) in ${dir}` };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = clearanceNote(process.argv[2] || DEFAULT_CHERRYH_DIR);
  if (result.ok) {
    console.log(`legal hold item 11 cleared by ${result.note}; the credtent.org DNS step may proceed`);
  } else {
    console.error(`BLOCKED: credtent.org DNS stays on GitHub Pages: ${result.reason}`);
    process.exit(1);
  }
}
