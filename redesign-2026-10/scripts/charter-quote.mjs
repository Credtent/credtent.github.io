import { decodeAll } from "./private-names.mjs";

// The new sites say "creatives". The one exception is the PBC charter's public benefit, quoted as the exact
// phrase below (Cherryh, EB-approved 2026-11-01). Nothing else is allowed: not a URL, not another phrase.
const AUDIENCE = new RegExp("\\b" + "creat" + "ors?" + "\\b", "i");
const CHARTER_PHRASE = new RegExp("\\b" + "creat" + "ors of original works" + "\\b", "g");

export function audienceWordOutsideCharter(line) {
  return [line, decodeAll(line)].some((text) => AUDIENCE.test(text.replace(CHARTER_PHRASE, "")));
}
