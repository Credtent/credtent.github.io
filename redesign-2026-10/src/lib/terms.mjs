// Terms of service at launch (EB decision cards, 2026-11-01 evening).
//
// Before the swap, /terms-of-service on both sites serves the CURRENT terms (effective May 27, 2025)
// verbatim from the repo's terms-of-service.html, which is the page live on credtent.org. Only link
// targets are rewritten for the new hosts; the text is not touched (no scrub). Cherryh's revised terms
// (EB-approved 2026-11-01) are served at /terms-of-service/upcoming: noindex, out of the sitemap and
// llms.txt, and linked from nowhere.
//
// The swap, on the effective date (30 days after the section 12 notice email): set
// REVISED_TERMS_EFFECTIVE to the date as it should read on the page (for example "December 15, 2026"),
// rebuild, run the checks, and deploy. The revised text then serves at /terms-of-service with that date,
// and /terms-of-service/upcoming 301s to it. scripts/check-launch.mjs enforces both states.

export const CURRENT_TERMS_FILE = "terms-of-service.html";
export const CURRENT_TERMS_EFFECTIVE = "May 27, 2025";
export const REVISED_TERMS_EFFECTIVE = "";
export const UPCOMING_TERMS_PATH = "/terms-of-service/upcoming";
export const DATE_PLACEHOLDER = "EFFECTIVE-DATE-PENDING (30 days after the section 12 notice email)";
export const VERBATIM_START = "<!--legal:" + "current-terms:start-->";
export const VERBATIM_END = "<!--legal:" + "current-terms:end-->";

// Cherryh's rulings 1a to 1d (EB-approved 2026-11-01), applied only to the revised terms.
// The old strings are split so the copy checks do not match the text being replaced.
export const REVISED_CHANGES = [
  ["Register your name and creative works to be excluded from AI training data usage. We submit opt-out requests to AI developers and track " + "compliance on your behalf. This service is free and always will be.",
    "Register your name and creative works to record your opt-out from AI training. Each quarter, Credtent delivers the opt-out notice to AI companies, records each response, and follows up at 30, 60 and 90 days. Credtent relays and records opt-outs. It does not enforce them or monitor whether any company complies. Credtent does not plan to charge for the free opt-out."],
  ["<h3>Premium Opt-Out</h3>", "<h3>Opt-Out Premium</h3>"],
  ["Enhanced tracking of opt-out requests with detailed reporting, auditing, and compliance " + "monitoring. Available on paid plans.",
    "Opt-Out Premium enrolls your works in Credtent's periodic AI model audits, and Credtent records the results. Audit results are not proof of dataset inclusion or infringement. Available with Opt-Out Premium and every tier above it."]
];

/** Apply the revised changes and the effective date to a terms body. Throws if any source text is missing. */
export function reviseTerms(body, effective = REVISED_TERMS_EFFECTIVE || DATE_PLACEHOLDER) {
  const changes = [[`Effective Date: ${CURRENT_TERMS_EFFECTIVE}`, `Effective Date: ${effective}`], ...REVISED_CHANGES];
  for (const [from, to] of changes) {
    if (!body.includes(from)) throw new Error(`terms-of-service: expected text not found: ${from.slice(0, 60)}`);
    body = body.replace(from, to);
  }
  return body;
}

/** Visible text of an HTML fragment as trimmed, non-empty lines (tags become line breaks). */
export function termsText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
