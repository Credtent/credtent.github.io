# BUILD-SPEC: credtent.com + credtent.org redesign (Design Review 07, Sep 21 2026)

Prepared 2026-10-25 by Tolkien for a Cursor cloud coding agent. Eric's instruction: "Have Tolkien build both sites from the redesign and Niven's list. No publishing."

## 0. Hard boundaries (do not violate)
- **Previews only.** No Production domains, no DNS, no GoDaddy, no Workspace/email changes, no merge to any live branch (`main`, `gh-pages`, `staging`). Draft PR only, if a PR is requested at all.
- Every preview build ships **noindex**: `<meta name="robots" content="noindex, nofollow">` on every page, `X-Robots-Tag: noindex` header where the host allows it, and `robots.txt` = `User-agent: *\nDisallow: /`. Production robots.txt/sitemap/llms.txt (section 6) are written as files but gated behind an env flag (`SITE_ENV=production`), which stays OFF.
- **Aegis stays at https://app.credtent.org.** Links only (Sign in, Sign up, Free opt-out flows). Never proxy, rewrite, or redirect `app.credtent.org`.
- Never print or commit secrets. No analytics keys, no forms that post anywhere live (forms render, `action` points to `#` with a TODO).
- Real photos only. **Do NOT use `bridge-illustration.png`** (generated, retired). Never ship original-size stock (generate AVIF/WebP srcset).

## 1. Stack recommendation
Astro (static output), one repo with two apps or one app with two build targets: `sites/com` and `sites/org`, sharing `packages/ui` (nav, footer, buttons, cards, valuation diagram as SVG/HTML, FAQ, JSON-LD helpers). Nav and footer are **server-rendered components** (no `components.js` placeholder injection). Deploy target later: two Vercel projects (corporate on .com, B2C on .org with 301s in `vercel.json`). For now Vercel **Preview deployments only**.

## 2. Page inventory
The PDF has 8 page types (pages 2–17, desktop then mobile). Mapping:

| # | Page type | PDF pages (desk/mob) | Host | Path |
|---|---|---|---|---|
| 1 | Credtent.org home (B2C) | 2 / 3 | .org | `/` |
| 2 | Credtent.com home (commercial) | 4 / 5 | .com | `/` |
| 3 | Collaborithmic (book) | 6 / 7 | **neither** (collaborithmic.com, separate repo). Only the book *feature section* on both homes is in scope. | — |
| 4 | Creative Consent | 8 / 9 | .org | `/creative-consent` |
| 5 | Citation licensing (GRR) | 10 / 11 | .com | `/citation-licensing` |
| 6 | Content valuation | 12 / 13 | .com | `/valuation` |
| 7 | AI training licensing | 14 / 15 | .com | `/ai-training` |
| 8 | About | 16 / 17 | .com canonical (`/about`); .org nav "About" links to `https://credtent.com/about` | `/about` |

Additional pages (not in mockups; build using the same components):
- **.com:** `/partners` (section 5), `/content-owners` (hub; reuse the content-owner block from .com home + links to valuation/citation/training), `/ai-companies` (hub; reuse AI-company block, include approved licensing sentence), `/services` (index of valuation, training, citation, auditing), `/contact`, `/privacy-policy`, `/terms-of-service`, `/faq`, `/pricing` (TODO stub, see 4.6), `/sitemap` (HTML).
- **.org:** `/opt-out` (link-out to the Aegis free opt-out flow on app.credtent.org; keep existing page content), `/resources` (index + three resource articles as TODO stubs: opt-out, platform terms, creative judgment), `/resources/auditing`, `/resources/opt-out-limitations` (FAQ), `/premium` (Opt-Out Premium US$49/yr, section from org home), `/badges/`, `/badge-builder`, `/certified-publisher`, `/standards`, `/wga`, `/blog`, `/guides/ai-training-data-licensing/`, `/privacy-policy`, `/terms-of-service`, `/sitemap`. Port content for existing pages from `Credtent/credtent.github.io` main, applying the copy rules.
- Nav (.com): Content owners / AI companies / Services / Partners / About + `Sign up` (orange). Nav (.org): Opt-Out / Creative Consent / Resources / About + `Free opt-out` (orange).
- Footers: Niven flagged identical link sets. Each footer link must use an **absolute URL to the owning host** (table in section 3). Footer tagline (both): "Credtent helps creatives and AI companies navigate consent, credit, and compensation." Add "Credtent, Inc. is a Delaware Public Benefit Corporation." and the visible postal address (Glendora, CA per live schema; TODO confirm street line). Contact email: .com pages use a .com address (TODO: Eric to confirm, e.g. hello@credtent.com); .org pages use hello@credtent.org.

## 3. URL ownership + one-for-one 301 map (old credtent.org → new)
Source: live `https://credtent.org/sitemap.xml` (17 URLs, fetched 2026-10-25) + `.html` variants. **No blanket .org redirect.** Never redirect to the .com home as a catch-all. Implement as `vercel.json` `redirects` (permanent: true) in the .org project; also redirect the extensionless and `.html` forms.

| Old URL (credtent.org) | New home | Type |
|---|---|---|
| `/` | `https://credtent.org/` (new B2C home) | stays |
| `/for-ai-companies.html`, `/for-ai-companies` | `https://credtent.com/ai-companies` | 301 |
| `/for-content-owners.html`, `/for-content-owners` | `https://credtent.com/content-owners` | 301 |
| `/pricing.html`, `/pricing` | `https://credtent.com/pricing` | 301 |
| `/about.html`, `/about` | `https://credtent.com/about` | 301 |
| `/faq.html`, `/faq` | `https://credtent.com/faq` (corporate FAQ; creative FAQ lives at `.org/resources/opt-out-limitations`) | 301 |
| `/privacy-policy.html` | `https://credtent.org/privacy-policy` (stays, extensionless; .com gets its own copy) | 301 (same host) |
| `/terms-of-service.html` | `https://credtent.org/terms-of-service` | 301 (same host) |
| `/opt-out` | stays on .org | stays |
| `/certified-publisher` | `https://credtent.com/certified-publisher` (publisher program is corporate) — **TODO Eric confirm** | 301 |
| `/badges/` | stays on .org | stays |
| `/badge-builder` | stays on .org | stays |
| `/blog` | stays on .org | stays |
| `/wga` | stays on .org | stays |
| `/standards` | `https://credtent.com/standards` — **TODO Eric confirm** | 301 |
| `/guides/ai-training-data-licensing/` | stays on .org (creative education) | stays |
| `/guides/ai-training-data-licensing-companies/` | `https://credtent.com/guides/ai-training-data-licensing-companies/` | 301 |

Map size: 17 source URLs; 8 move cross-host to .com (12 redirect rules counting `.html` + extensionless variants), 2 same-host `.html` normalizations, 7–9 stay. Also add 301s for any other `*.html` file that exists in credtent.github.io main (agent: enumerate and add, same rule: exact equivalent, never home). Self-canonical on every page of each host. Fix the old `/about` vs `about.html` canonical mismatch (new canonical is `https://credtent.com/about`).

**Precondition (Niven #2):** these 301s must not go live until credtent.com serves 200s. They are written now, deployed only to Preview.

## 4. Hard copy and content rules
### 4.1 "creators" → "creatives" (everywhere in copy)
Count in the mockup text (PDF): **40 instances** — creators 22, creator 6, Creators 4, creator-side 4, CREATORS 2, CREATOR 2 — including the .org header eyebrow "FOR CREATORS IN THE AGE OF AI", "CREATOR RESOURCES", and the site-wide footer tagline. Niven also counts ~12 on the live .org home and 3 on live /about; ported pages must be fixed too.
Replacements: creators→creatives, creator→creative, creator-side→creative-side, creator's→creative's (keep capitalization style). Example: "FOR CREATIVES IN THE AGE OF AI", "CREATIVE RESOURCES", "For creatives", "License content from creatives and subject-matter experts".
**Acceptance:** `grep -rniE "creator" dist/` returns only allowed exceptions.
**Allowed exceptions (do not change):** (a) Aegis URLs on app.credtent.org such as `/creator/protection` and other app routes; (b) third-party URLs/slugs; (c) the image filename `creator-photo.jpg` — rename it to `creative-photo.jpg` in the build (preferred) so no exception is needed; (d) code identifiers in third-party packages. Schema.org property `creator` (if ever used) is a vocabulary term, allowed. List any other exception in the PR description.
### 4.2 Locked brands
Never name **ISO** or **Sony** anywhere (copy, alt text, credits, URLs, file names, schema, comments). See 7.2 for the photo re-credit. Also never name AI buyers, volumes or deal terms.
### 4.3 Casing and entity
- "ABOUT Credtent" → "About Credtent" (or eyebrow "ABOUT" + H1 "Credtent"); never "ABOUT Credtent".
- Spell "Credtent". Legal: "Credtent, Inc., a Delaware Public Benefit Corporation". Drop "(PBC)" from titles (live /about og:title has it).
- Banned: "court-defendable", "indemnification included", "CaaS", "B Corp", "retroactive licensing", "C2PA" (say CAI if needed). Do not reintroduce certification, compliance, legal-risk-elimination or indemnity claims from old `ai-companies.astro`.
- Rename the About value tile "Neutral partnership" → "Neutral role".
- **No valuation figures anywhere** (rights holders never see valuation numbers). The valuation diagram shows five qualitative inputs (intended AI use, evidence of success, cultural significance, quality/expertise, rights/scope) → neutral assessment; no weights, scores, prices, guarantees.
### 4.4 Roster (About page)
Eric confirmed this roster on 2026-10-25. Render the team in this order. The roster summary paragraph names these people and nobody else.

1. **Eric R. Burgess** — Founder and CEO (photo: `team/eric-burgess.jpg` from credtent.github.io main; LinkedIn https://www.linkedin.com/in/erburgess). Person schema `@id https://credtent.com/about#eric-r-burgess`.
2. **Dr. Galen Buckwalter** — Co-founder and Chief Credibility Officer (photo: `assets/photos/galen.jpg`; LinkedIn https://www.linkedin.com/in/j-galen-buckwalter-04139510). Person schema `@id https://credtent.com/about#galen-buckwalter`.
3. **Edmond Almond** (E-D-M-O-N-D A-L-M-O-N-D) — Chief Partnerships Officer — placeholder headshot (neutral silhouette SVG with initials "EA", `data-placeholder="headshot"`). He is on the team, not on the advisor council.
4. **Abigail Cameron** — Engineering — placeholder headshot (initials "AC", `data-placeholder="headshot"`). Surname and role are set.
5. **Carmen Sinata** — Onboarding — photo `assets/team/carmen-sinata.jpg`.
6. **Freddy Mota** (F-R-E-D-D-Y) — Operations — photo `assets/team/freddy-mota.jpg`.
7. **Michael Thompson** — Revenue — confirmed and rendered. Photo `team/michael-thompson.jpg`.
8. **Raymond Jia** — Technology — confirmed and rendered. Photo `team/raymond-jia.jpg`.
9. **Jim Li** — Technology — confirmed and rendered. Photo `team/jim-li.jpg` from the current site.
10. **Colin Devenish** — Sales — confirmed and rendered. Photo `team/colin-devenish.jpg`.
- **Deborah Drake** stays removed (card, roster paragraph, alt text, credits, and image). Do not copy `deborah-drake.jpg`.
- **Jason Pitcock** is not on the team. Do not render a card, do not name him in the roster paragraph or alt text, do not list him in `credits.json` or on the credits page, and do not ship his portrait in the redesign sites.
- The advisor council is still unconfirmed. Do not render it. Leave `<!-- TODO(Eric): confirm advisors -->`.
### 4.5 Fonts (proposal for Eric)
Proposed pair (both SIL OFL 1.1, self-hosted woff2 from Google Fonts / fontsource): **Source Serif 4** (display headlines, weights 600/700) + **Inter** (UI and body, 400/600/700, variable). Rationale: mockup headlines are a high-contrast editorial display face over a clean grotesque; buttons in the mockup are 20px bold sans (Arial Bold) which Inter replaces cleanly.
- `@font-face { font-display: swap; }`, subset Latin, preload only Inter 400 + Source Serif 4 700.
- Metric-matched fallbacks (`size-adjust`/`ascent-override`) against Georgia and Arial to keep CLS ~0.
- Swappable: everything references `--font-display` and `--font-body` CSS variables in one `tokens.css`; changing the pair is a one-file edit. Include OFL license text in `/fonts/LICENSE-OFL.txt`.
### 4.6 Prices (confirmed)
Eric confirmed these published amounts on 2026-10-26. Keep the rendered strings exactly. Do not add `data-unverified`, a price TODO, or a "Pricing to be confirmed" note.
- Book: **$14.99** standard e-book, **$24.99** paperback, **$49** living e-book.
- Opt-Out Premium: **US$49** annually for individuals and **US$249+** annually for organizations.
These figures already appear on .com (the book block and `/pricing`) and on the .org pages that quote the same amounts. Leave them as built.
### 4.7 Brand
Orange `#EC5A00` stays the primary button color, with white bold labels at 20px or larger. Inline text links use purple `#290099` on both sites. Official shield left of wordmark, SVGs from `assets/svg/` (do not redraw, do not use 8× PNGs). White wordmark in footer.
The hero stays the current pale paper band with ink text. A full-width purple hero is still Eric's decision. Do not restyle it in this pass.

## 5. Partners page — `https://credtent.com/partners`
Follow `partners-page-draft-2026-10-25.md` layout and Niven §4, with these overrides:
- **Names are placeholders only**: "Partner A", "Partner B", "Partner C", "Partner D", "Partner E", each with a type-of-work line from the draft (medical education and clinical content; B2B trade journalism; sports statistics and history; children's music and educational audio; documentary and video production) and `href="#"`. `<!-- TODO(Eric): reconfirm before naming -->`. Do NOT put the real candidate names in the repo's built output, source, comments, or schema.
- Heading "The companies and creatives we represent". Small print: "Listing reflects a representation or licensing agreement with Credtent. It does not imply endorsement of Credtent or any specific AI company deal."
- Text cards only (no logos). "creatives", never "creators". No ISO/Sony, no AI-buyer names, no volumes.
- JSON-LD: `CollectionPage` (`@id https://credtent.com/partners#page`, `about` → `https://credtent.com/#organization`) with `mainEntity` `ItemList` of `Organization` items (name "Partner A (placeholder)", description "Catalog represented by Credtent"). No `member`, `memberOf`, `sponsor`, `parentOrganization`.
- Homepage strip on .com below the neutral-marketplace section: 4–6 placeholder names + "See who we represent →". No strip on .org; optional single footer line on .org resources.

## 6. SEO / AEO / GEO plumbing (per host)
- Unique `<title>` + meta description per page (agent drafts; no "(PBC)").
- Headline triplets ("Creative work. / Clear AI permissions. / Value for both.") are ONE `<h1>` with `<br>`/spans. Eyebrows are styled `<p>`, not headings.
- Answer-first capsule (2–3 sentences) at the top of every page + a visible FAQ on every page (FAQPage JSON-LD allowed). Use Niven's capsules verbatim as the starting text (see `niven-seo-aeo-geo-2026-10-25.md` §2 Structure).
- Approved licensing sentence **verbatim** on `/ai-companies`, `/ai-training`, and the AI-company block on .com home: "Licenses include the rights the contracting holders warranted, a named manifest, and a disclosure pack your counsel can use for EU AI Act Art. 53 and CA AB 2013 filings. Those statutes still bind the developer. Indemnity, if any, is only as written in the signed license."
- Schema: ONE Organization `@id https://credtent.com/#organization` (legalName "Credtent, Inc.", address, founder → Eric Person, sameAs LinkedIn + CB Insights, `url` both domains). .org pages reference it (no second Organization). WebSite per host. Person for Eric and Galen on .com/about. Service for training licensing, GRR citation licensing, valuation, and Opt-Out Premium. Offer markup may include the confirmed US$49 and US$249+ prices. BreadcrumbList on inner pages. Validate with schema.org validator in CI (e.g. `structured-data-testing` / `schema-dts` types).
- Per host (production-gated files): `robots.txt` with its own `Sitemap:` line; `sitemap.xml`; `llms.txt` (.com: licensing, valuation, GRR, AI companies; points to .org llms.txt for opt-out + Creative Consent). Keep the live .org AI-crawler allow rules and `/parking/` exclusion in the production .org robots.
- Descriptive anchors: replace "Read the resource →" with titles ("Read: how opt-out works").
- CWV: hero AVIF/WebP srcset, `<link rel=preload>` + `fetchpriority="high"` on hero, explicit width/height, lazy-load below fold. Valuation diagram in HTML/SVG. Targets: LCP < 2.5s, CLS < 0.1 on Lighthouse mobile.

## 7. Assets
All in this branch under `redesign-2026-10/inputs/assets/`.
### 7.1 Photos (`assets/photos/`), licenses from `source/asset-provenance.json`
| File | Slot (inferred from notes; verify vs PNGs) | Credit | License |
|---|---|---|---|
| com-bridge-landscape-v7.jpg | .com home hero (16:9) | Redd Francisco / Unsplash | Unsplash License |
| com-editor-v6.jpg | .com home content-owner card | Ron Lach / Pexels | Pexels License |
| com-ai-team.jpg | .com home AI-company card | ThisIsEngineering / Pexels | Pexels License |
| com-podcast-v6.jpg | .com home "Full-cycle licensing" section | cottonbro studio / Pexels | Pexels License |
| citation-reader-wide.jpg | Citation page hero | George Milton / Pexels | Pexels License |
| training-team.jpg | AI training page hero | ThisIsEngineering / Pexels | Pexels License |
| writer-photo.jpg | .org home photo band (writer) | Vitaly Gariev / Unsplash | Unsplash License |
| filmmaker-new.jpg | .org home photo band (filmmaker) | **Valdans Media / Pexels** (see 7.2) | Pexels License |
| creator-photo.jpg → rename `creative-photo.jpg` | .org home hero | Yuanzhe Ma / Unsplash | Unsplash License |
| resource-optout-v4.jpg | .org resources card 1 | KATRIN BOLOVTSOVA / Pexels | Pexels License |
| resource-terms-v4.jpg | .org resources card 2 | SHVETS production / Pexels | Pexels License |
| resource-judgment-v4.jpg | .org resources card 3 | Felicity Tai / Pexels | Pexels License |
| book-writer.jpg | Collaborithmic only — **not used** on .com/.org | RF._.studio / Pexels | Pexels License |
| galen.jpg | About: Galen | Official Credtent repository | Company portrait |
| com-bridge-professional-v6.jpg | **retired in rev07 — do not use** | Mizuno K / Pexels | Pexels License |

Not used: `bridge-illustration.png` (generated; banned), `com-bridge-real.jpg`, `com-owners.jpg` (retired; files not present).
### 7.2 Re-credit (locked brand)
`filmmaker-new.jpg`: the provenance source URL slug names a locked brand. Public credit must read **"Photo: Valdans Media / Pexels"** linking to **`https://www.pexels.com/photo/13377853/`** (ID-only URL, no slug) — or no link. Alt text: "Filmmaker recording with a video camera" (no brand). Do not copy the original slug into any file in the built site. Agent: when creating a public `credits` page/JSON, generate it from provenance with this override.
### 7.3 Team headshots (`assets/team/`)
carmen-sinata.jpg, freddy-mota.jpg (from live credtent.org/team/, existing company portraits). Eric: pull `team/eric-burgess.jpg` from credtent.github.io main. Also use the current-site portraits `team/michael-thompson.jpg`, `team/raymond-jia.jpg`, `team/jim-li.jpg`, and `team/colin-devenish.jpg`. Edmond Almond and Abigail Cameron: placeholder SVGs with initials EA and AC. Never include deborah-drake.jpg. Do not ship `team/jason-pitcock.jpg` in the redesign sites.
### 7.4 SVG (`assets/svg/`)
wordmark.svg, wordmark-white.svg, shield.svg, consent-full.svg, consent-optional.svg, consent-none.svg (Creative Consent badges: Full / Optional / No Protection).
### 7.5 Credits page
`/credits` on each host listing photo credits + license links (Pexels https://www.pexels.com/license/, Unsplash https://unsplash.com/license), applying 7.2.

## 8. Acceptance checklist
### Niven must-fix (binding)
- [ ] M1 Zero "creator/creators/creator-side" in rendered copy on both sites, footer tagline included (allowed exceptions only, listed in PR).
- [ ] M2 Redirects to .com are written but stay Preview-only until credtent.com serves 200 (Eric's DNS work). PR notes this dependency.
- [ ] M3 URL ownership map + 1:1 301 map (section 3) implemented incl. `.html` variants; no blanket .org redirect; nothing goes to .com home as catch-all.
- [ ] M4 Per-host self-canonicals (about mismatch fixed); separate robots.txt (own Sitemap line), sitemap.xml, llms.txt per host.
- [ ] M5 One Organization @id on .com; Person @id on .com/about; Service schema; JSON-LD validates.
- [ ] M6 Nav/footer server-rendered; hero srcset/preload/dimensions; self-hosted fonts with swap.
- [ ] M7 Answer-first capsule + visible FAQ on each page; "Delaware Public Benefit Corporation" stated (no "(PBC)"); approved licensing sentence verbatim on AI-company + training pages.
### Niven should-fix
- [ ] Descriptive anchors (no "Read the resource →").
- [ ] "About Credtent" casing.
- [x] Roster updated per 4.4. Eric confirmed it on 2026-10-25.
- [ ] Host-appropriate contact emails.
- [ ] Locked-brand photo slug removed / re-credited (7.2).
- [ ] Person schema for Galen.
- [ ] Visible address on About/Contact.
- [ ] "Neutral partnership" → "Neutral role".
- [ ] Valuation diagram in HTML/SVG.
- [ ] (Search Console + AI-answer baselines: Eric/human, out of scope for agent.)
### Eric's required changes
- [ ] No "ISO" or "Sony" anywhere: `grep -rniE "\bsony\b|\biso\b" dist/ src/` returns nothing.
- [x] Deborah Drake absent. Jason Pitcock absent from the redesign sites. Eric confirmed the rendered roster on 2026-10-25: Eric R. Burgess, Dr. Galen Buckwalter, Edmond Almond, Abigail Cameron (Engineering), Carmen Sinata, Freddy Mota, Michael Thompson (Revenue), Raymond Jia (Technology), Jim Li (Technology), Colin Devenish (Sales).
- [x] Published prices stay as built. Eric confirmed $14.99, $24.99, $49, and $249 (rendered US$249+) on 2026-10-26. No unverified flag.
- [ ] Partners page uses Partner A–E placeholders; none of the candidate real names appear in the repo diff.
- [ ] No valuation numbers in copy.
- [ ] Preview: meta noindex on every page + robots.txt `Disallow: /`.
- [ ] No `bridge-illustration.png`, no generated imagery.
- [ ] Lighthouse mobile ≥ 90 performance/SEO/accessibility on both homes (report numbers).
- [ ] Desktop and mobile layouts match the PNGs at 1440 and 390 widths (attach screenshots to PR).

## 9. Open items flagged for Eric (do not guess)
Advisor council still unconfirmed (do not render); partner names; font pick; .com contact address; whether `/certified-publisher` and `/standards` move to .com; About canonical host (.com assumed); whether the book feature appears on both homes; Edmond's email spelling in Slack invite ("allmond") vs "Almond" on site; which repo is the long-term home for each site; the hero treatment (the build keeps the pale paper hero until Eric decides). The team roster is closed: Eric confirmed it on 2026-10-25 (section 4.4). The published prices $14.99, $24.99, $49, and $249 are confirmed (section 4.6). Orange stays the primary button color (section 4.7).

## 10. Reference files in this folder
`design-review-text.txt` (full PDF text), `pages/` (page PNG/JPG renders; tall mobile/desktop pages split into `-partN` 5000px slices), `astra-redesign/*.md`, `source/*`, `niven-seo-aeo-geo-2026-10-25.md`, `partners-page-draft-2026-10-25.md`, `domain-switch-survey-2026-10-25.md`, `website-redesign-slack-find-2026-10-25.md`.
Note: `source/asset-provenance.json`, `design-review-text.txt` and `source/current-about.html` are **internal references** — they contain the locked-brand slug and old roster. Never copy them into the built site.

## 11. Per-page copy (from mockups, substitutions applied)
### ORG home (/) — host: credtent.org
Mockups: desktop `pages/page-02*.jpg`, mobile `pages/page-03*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                   Opt-Out       Creative Consent   Resources   About                                             Free opt-out
FOR CREATIVES IN THE AGE OF AI
Your work.
Your choices.
Your terms.
Tell AI companies not to train on your work. Understand
how platforms use your content and make informed choices
about your work.
       Get free opt-out
See how it works →
                                                                                                                  Keep creating.
                                                                                                            We’ll help you navigate AI.
FOR THE WORK YOU MAKE
Whatever you create, your choices matter.
Practical tools and resources to help you protect your creative work and understand your choices in the
age of AI.
For the words you write.                                                              For the stories you bring to life.
FREE                                                   QUARTERLY                                              OPTIONAL
Opt-out registration                                   Opt-out list distribution                              Monthly Premium auditing
A DOCUMENTED HISTORY
How your opt-out works
Credtent records your opt-out preferences and the notices we send to AI companies, building a
documented history over time. We cannot guarantee that every company will act on your request.
01                                                       02                                                       03
Register your preferences                                We send your request                                     Choose additional support
Identify the work you want included in your              Credtent distributes the opt-out list to AI              Optional Opt-Out Premium adds monthly
opt-out request.                                         companies each quarter. Sent notices are                 auditing of observable model responses.
                                                         distinct from confirmed receipt or action.
Registration does not automatically remove work from datasets.
OPT-OUT PREMIUM
Monthly audits.
A clearer record.                                                                                                    US$49 annually
Credtent audits observable model responses monthly and records the                                                   For individuals
results. These observations are not proof of dataset inclusion or
                                                                                                                     Early member pricing
infringement.
       Understand auditing
CREATIVE CONSENT
Know the terms. Keep the choice.
Understand how the platforms where you publish handle AI training, and what controls you have.
Full Protection                                          Optional Protection                                         No Protection
Protected by default. AI training requires               Protection depends on using an available,                   The assessed policy offers no effective choice
explicit opt-in. Creatives can still choose to            effective opt-out.                                          to prevent that use.
participate.
     Explore Creative Consent
CREATIVE RESOURCES
Understand more. Decide for yourself.
What an opt-out request can                             How to read a platform’s AI                              Use AI without giving up your
do.                                                     terms.                                                   judgment.
Read the resource →                                     Read the resource →                                      Read the resource →
THE COLLABORITHMIC AGE
Expand your creativity. Keep your judgment.
                         By E.R. Burgess, Credtent CEO and creative technologist
                         Drawing on years of content valuation and two and a half years developing full-cycle AI licensing, Burgess
                         explores how to use AI, understand the value of your work, and keep your creative skills and judgment strong.
                         Explore The Collaborithmic Age →
                                                                                           Free opt-out / Auditing
                                                                                           Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                           Valuation / AI training / Citations
credit, and compensation.
                                                                                           About / Contact / Sitemap
hello@credtent.org
```

### COM home (/) — host: credtent.com
Mockups: desktop `pages/page-04*.jpg`, mobile `pages/page-05*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                           Content owners       AI companies      Services     About                                                Sign up
CONNECTING CREATIVITY AND AI
Creative work.
Clear AI permissions.
Value for both.
Credtent bridges content owners and AI companies
through consent, licensing, and compensation.
          Sign up                         Contact us
TWO SIDES. SHARED OPPORTUNITY.
A neutral marketplace connecting content owners and
AI companies.
We help content owners and AI companies define permitted uses, assess value, and agree terms that reflect both sides’ needs.
   Content owners                                                                                 AI companies
   For authors, publishers, studios, archives, and data providers. Choose                         Find content for training and AI answers. Agree the rights,
   what to license, agree on terms, get paid.                                                     documentation, and compensation for its use.
   Explore content-owner options →                                                                Explore AI training licensing →
CONTENT VALUATION
Understand your content’s value. Explore your
licensing options.
Before a first agreement, after an initial deal, or when considering new opportunities: start with an informed assessment.
A baseline valuation comes when you add content. Optional paid custom valuation provides a deeper assessment. You can obtain a
valuation independently, then choose whether to seek help finding licensing partners.
THE CONTEXT BEHIND A VALUATION
  Intended AI use                       Evidence of                           Cultural                              Quality and                         Rights and scope
  Training, answers, or both            success                               significance                          expertise                           Permissions, limits, and
                                        Audience reception and                Context and distinctive               The work and its specialist         exclusivity
                                        awards                                contribution                          value
                                              A neutral assessment
                                              An informed starting point for what to charge.
Illustrative inputs, not a formula. Evidence, assumptions, and intended use inform the assessment; the parties agree the final price.
   Request a valuation
HOW LICENSING WORKS
Your work. New ways to earn.
   01                                              02                                             03                                              04
   Choose the rights.                              Understand your                                Agree on terms.                                 Get paid.
   Define which content, uses,                     value.                                         Set permitted use, attribution,                 Receive licensing payments
   and exclusions you want to                      Credtent helps assess your                     compensation, reporting, and                    and agreed reporting under
   offer.                                          content’s value alongside the                  renewal terms together.                         the contract.
                                                   intended AI use.
FULL-CYCLE LICENSING
Agree how AI can use your content.
We help content owners and AI companies agree what can be used, how it can be used, and how it is paid for.
                                                                                           AI training rights
                                                                                           License a defined corpus with documented origins and quality criteria.
                                                                                           Set training scope and compensation, with agreed access to new work
                                                                                           from creatives and subject-matter experts.
                                                                                           Explore training licensing →
                                                                                           Use in AI answers
                                                                                           Generative Results Referencing (GRR) sets excerpt limits, attribution,
                                                                                           source links, and compensation for licensed appearances, including
                                                                                           those without a click.
                                                                                           Explore citation licensing →
Training and display permissions are agreed separately. Source visits are a goal, not a guarantee.
THE COLLABORITHMIC AGE
Understand how creativity and AI can work together.
                            By E.R. Burgess, Credtent CEO and creative technologist
                            Drawing on years of content valuation and two and a half years developing full-cycle AI licensing, Burgess
                            explores how to use AI, understand the value of your work, and keep your creative skills and judgment strong.
                            Explore the book →
                                                                                                        Free opt-out / Auditing
                                                                                                        Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                                        Valuation / AI training / Citations
credit, and compensation.
                                                                                                        About / Contact / Sitemap
hello@credtent.org
```

### Collaborithmic book (reference only) — host: collaborithmic.com (NOT in scope)
Mockups: desktop `pages/page-06*.jpg`, mobile `pages/page-07*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
The Collaborithmic Age                                        The book   Read a sample     Editions   About Eric                         Explore editions
AN AI REALIST’S GUIDE
The
Collaborithmic
Age
E.R. Burgess
Creativity, Rights, and the Future of Human Expression in a Time of
Intelligent Machines.
   Read the introduction
Expected mid-October 2026
MEET E.R. BURGESS
A creative’s perspective. A technologist’s curiosity.
                                        A lifetime making things.
                                        A question about what comes next.
                                        Credtent CEO and creative technologist E.R. Burgess is a writer, novelist, and technology observer. His
                                        creative and technological work includes a long collaboration with Dr. Galen Buckwalter, a psychologist
                                        and data analytics expert.
   Seven years                                         Thirty years                                           Writer, novelist,
   as a Disney producer.                               building enterprise software.                          and technology observer.
CREATE WITH AI. KEEP YOUR JUDGMENT.
More capability. Still your creative voice.
How do we collaborate with algorithms without giving up our authorship, skills, or responsibility?
Explore a practical way to use these tools while continuing to exercise the imagination that makes the work yours.
What you’ll put into practice.
   Use the tools deliberately                          Understand rights and                                  Keep practicing your craft
   Keep human intent and judgment at the               value                                                  Recognize the difference between useful
   center of your process.                             Think clearly about consent, licensing,                assistance and creative atrophy.
                                                       attribution, and compensation.
EDITIONS
Read it your way.
A complete standalone edition, or the living e-book with quarterly updates.
   STANDARD E-BOOK                                     PAPERBACK                                              LIVING E-BOOK
   $14.99                                              $24.99                                                 $49
   A standalone digital edition. Quarterly             A standalone printed edition. Quarterly                The digital book with quarterly updates
   updates are not included.                           updates are not included.                              included.
   Explore e-book →                                    Explore paperback →                                    Explore living edition →
PAID PERSONAL SUBSTACK SUBSCRIBERS
Your living-edition access.
Paid subscribers to Eric’s personal Substack also receive living-edition access. Free subscribers are not included.
   Subscriber access
A FEW USEFUL ANSWERS
Before you choose.
   Want print and living access?                                                  Which editions get updates?
   Purchase the paperback and the living e-book separately. No                    The $49 living e-book includes quarterly updates. Standalone e-book
   discounted bundle is offered in this preview.                                  and print purchases do not. Paid personal Substack subscribers also
                                                                                  receive living-edition access.
Invite Eric to speak at your event
For speaking inquiries, contact hello@credtent.org.
The Collaborithmic Age                                                                 The book / Editions / Author / FAQ
Published by Credtent Press                                                            Contact / Sitemap
                                                                                       LinkedIn / Personal Substack
                                                                                       Medium / Credtent Substack
hello@credtent.org
```

### Creative Consent (/creative-consent) — host: credtent.org
Mockups: desktop `pages/page-08*.jpg`, mobile `pages/page-09*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                           Opt-Out      Creative Consent      Resources   About                                              Free opt-out
RESOURCES / CREATIVE CONSENT
Full Protection means consent comes first.
Protected by default. AI training is allowed only when the creative explicitly chooses to permit it.
                  Full Protection
                  Protected by default. AI training requires explicit opt-in. Creatives can still choose to participate.
                  Optional Protection
                  Protection depends on using an available, effective opt-out.
                  No Protection
                  The assessed policy offers no effective choice to prevent that use.
AN ASSESSMENT YOU CAN INSPECT
See the reason. See the source.
Each assessment makes the relevant terms, available choices, and scope easy to understand.
   01                                                             02                                                           03
   Policy and version                                             Available choices                                            Clarifications
   Original terms, policy links, review date,                     Training defaults, opt-in, opt-out, and                      Company responses and published policy
   affected region, and account scope.                            differences between account types.                           changes are reviewed before an
                                                                                                                               assessment is updated.
OPEN INFORMATION
View the platform list. Download the current guide.
Publicly available without an email address or account.
   View the platform list                 Download the guide
Guide preview v03 • Layout reviewed September 21, 2026. Named assessments and their policy sources are pending editorial review; no platform ratings are shown here.
REPRESENT A PLATFORM?
Help keep the record accurate.
Submit a clarification, correction, or updated policy for review. Include the policy URL, relevant passage, affected products, account types,
regions, and effective date.
Platform / organization
Supporting policy URL
Scope and requested correction
   Submit for review
Submissions are reviewed. They do not automatically change an assessment.
OPTIONAL EMAIL SUBSCRIPTION
Get Creative Consent updates.
Choose to receive relevant policy and assessment updates. You can unsubscribe at any time.
Email address
    Yes, send me Creative Consent updates.
   Subscribe to updates
The guide and platform list remain open whether or not you subscribe.
Creative Consent describes platform policies. Creative Origin describes a work’s disclosed origin.
                                                                                                     Free opt-out / Auditing
                                                                                                     Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                                     Valuation / AI training / Citations
credit, and compensation.
                                                                                                     About / Contact / Sitemap
hello@credtent.org
```

### Citation licensing / GRR (/citation-licensing) — host: credtent.com
Mockups: desktop `pages/page-10*.jpg`, mobile `pages/page-11*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                        Content owners          AI companies   Services      About                                                       Sign up
YOUR CONTENT IN AI ANSWERS
More control over your
content in AI answers.
Set excerpt limits. Support visits to the source. Get paid for
licensed use.
Your content creates value when it appears in AI answers. Credtent’s
Generative Results Referencing licenses help you agree how much is
shown, how people reach the source, and how you’re compensated
for its use.
   Explore citation licensing                       Contact us
   Support source visits.                                       Get paid for use.                                               Set the limits.
   Prominent attribution and source links                       Agree compensation for licensed                                 Define acceptable excerpts so an AI answer
   invite people to explore the original article,               appearances, including appearances that                         introduces the work without giving
   image, audio, or video.                                      do not lead to a click.                                         everything away.
Traffic is a goal, not a promised outcome. Compensation and display limits depend on the agreement.
TWO AUDIENCES. CLEAR EXPECTATIONS.
Make the relationship explicit.
   For creatives                                                                                For AI companies
   Explore citation licensing and communicate your preferences about AI                        Secure clear permissions, provide accurate attribution, agree
   use. Agree attribution, excerpts, and compensation.                                         compensation, and respond to creative notices.
   Explore your options →                                                                      Talk about citation licensing →
THREE ILLUSTRATIVE JOURNEYS
A useful answer. A visible source.
These examples do not depict a real provider, publisher, contract, or measured performance outcome.
   01 / THE CLASSIC SEARCH JOURNEY                              02 / THE OVERSHARING CONCERN                                    03 / THE BALANCE Credtent HELPS DEFINE
   Search and visit                                             An answer that may replace                                      A licensed path to the source
                                                                the visit
                                                                  ILLUSTRATIVE AI ANSWER                                          LICENSED SOURCE EXCERPT
     A relevant article
     A brief description helps you decide what to
                                                                                                                                  A short passage, within the agreed display
     open.                                                                                                                        limit.
     Visit the publisher →                                                                                                        Read the original →
                                                                  Source link
   The reader opens the source to explore the full              When an answer gives too much away, the                         An agreed excerpt, clear credit, and a prominent
   work.                                                        reason to visit can shrink.                                     invitation to keep reading.
FICTIONAL EXAMPLE
A short excerpt. An unmistakable source.
The agreement sets the display limit and unit. A 150-character cap is illustrative only, not a universal rule.
FICTIONAL SOURCE / ILLUSTRATIVE 150-CHARACTER CAP
The full report examines how independent studios develop new audiences
and sustain their creative work.
103 characters shown • Licensed source excerpt
Example Publisher / The Studio Report
   Read the original source
AI-GENERATED CONTEXT
Additional generated explanation appears separately from the publisher’s licensed words.
   Display and attribution                                      Payments and reporting                                          Training is a separate
   Specify excerpt limits, source naming,                       Agree compensation, usage records,                              right
   visible source links, and permitted media.                   responsibilities, and follow-up.                                Agree training scope explicitly. A source
                                                                                                                                link alone does not establish permission.
                                                                                                      Free opt-out / Auditing
                                                                                                      Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                                      Valuation / AI training / Citations
credit, and compensation.
                                                                                                      About / Contact / Sitemap
hello@credtent.org
```

### Content valuation (/valuation) — host: credtent.com
Mockups: desktop `pages/page-12*.jpg`, mobile `pages/page-13*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                           Content owners        AI companies     Services      About                                                  Sign up
SERVICES / CONTENT VALUATION
What is your content worth for AI licensing?
Understand your content’s value. Explore your licensing options.
   Request a valuation
   BEFORE A FIRST AGREEMENT                                        AFTER AN INITIAL DEAL                                           FOR NEW OPPORTUNITIES
   Start informed.                                                 Reassess the value.                                             Explore more options.
   Assess your work and intended use before                        Consider what has changed in your catalog,                      Evaluate additional licensing possibilities
   discussing pricing and permissions.                             audience, evidence, or the proposed AI use.                     and how they fit your existing agreements.
CHOOSE THE DEPTH YOU NEED
A baseline. A deeper assessment.
   Baseline valuation                                                                             Paid custom valuation
   Credtent provides a baseline valuation when content is added. It                               Optional deeper assessment considers your catalog, supported
   gives the licensing conversation an informed starting point.                                   evidence, intended AI use, and the questions you need answered.
                                                                                                  Discuss a custom assessment →
MORE THAN VOLUME OR TOKENS
The work, its context, and its use.
Assessment considers intended AI use alongside creative-side evidence. Different uses and rights can change the value discussion.
   Creative significance                                           Audience and recognition                                        Scope and intended use
   Cultural significance, subject-matter                           Audience reception, awards, and relevant                        The proposed AI use, rights requested,
   expertise, distinctive perspective, and other                   third-party evidence, with appropriate                          limitations, and the content available for
   supported indicators.                                           sources and context.                                            that agreement.
THE CONTEXT BEHIND A VALUATION
  Intended AI use                       Evidence of                            Cultural                             Quality and                            Rights and scope
  Training, answers, or both            success                                significance                         expertise                              Permissions, limits, and
                                        Audience reception and                 Context and distinctive              The work and its specialist            exclusivity
                                        awards                                 contribution                         value
                                              A neutral assessment
                                              An informed starting point for what to charge.
Illustrative inputs, not a formula. Evidence, assumptions, and intended use inform the assessment; the parties agree the final price.
METHODOLOGY AND LIMITS
An estimate supports a conversation.
The assessment should identify evidence, assumptions, scope, and uncertainty. An estimate is not a guaranteed transaction price or an
established industry standard. Final terms depend on the parties and their agreement.
Credtent’s proposed approach brings context and supported indicators into constructive pricing discussions. Third-party ratings and
evidence must be appropriately sourced; unsupported ratings are not part of this preview.
YOUR NEXT STEP IS YOUR CHOICE
Valuation can stand on its own.
You may already have a buyer or a licensing agreement. Obtain a valuation independently, then decide whether you want help finding
licensing partners or negotiating another opportunity.
   Request a valuation                  Discuss licensing options
                                                                                                         Free opt-out / Auditing
                                                                                                         Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                                         Valuation / AI training / Citations
credit, and compensation.
                                                                                                         About / Contact / Sitemap
hello@credtent.org
```

### AI training licensing (/ai-training) — host: credtent.com
Mockups: desktop `pages/page-14*.jpg`, mobile `pages/page-15*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                 Content owners     AI companies   Services      About                                         Sign up
SERVICES / FOR AI COMPANIES
Build on expertise. Keep it fresh.
License content from creatives and subject-matter experts, understand its origins, and build relationships that provide access to new work
over time.
   Discuss training licensing
FOR YOUR TRAINING AND ANSWER PRODUCTS
Know which works and rights your license covers.
   A defined content corpus                             Training and display                                      Rights you can review
   Tell us whether you need text, images,               rights                                                    Review a named list of works, the rights
   audio, video, or structured data. We help            We help scope training and Generative                     offered, and supporting provenance
   scope the works and formats for your use             Results Referencing separately. Agree                     documentation. Agree how new work and
   case.                                                excerpts, attribution, permitted uses, and                updates enter the license.
                                                        compensation.
FROM DISCOVERY TO ONGOING RELATIONSHIPS
Full-cycle support for content licensing.
   01                                     02                                       03                                         04
   Find relevant                          Assess the value                         Agree the license                          Keep the
   expertise                              Consider intended use                    Define scope, permitted uses,              relationship
   Discuss your use case, content         alongside the work, its                  compensation, exclusions, and              current
   needs, origin information, and         context, and supported                   responsibilities.                          Plan content updates, access
   selection criteria.                    creative-side evidence.                                                              to new work, reporting, and
                                                                                                                              agreed renewals.
FRESH WORK. LASTING RELATIONSHIPS.
Build with people who keep creating.
Ongoing relationships can provide access to new human-created and expert work. The agreement defines which updates, renewals, and
payments apply.
A training license does not automatically require recurring payments for every continued model use. Specific contracts define the scope,
duration, compensation, and renewal arrangements.
RESEARCH FOUNDATION
Origins and selection deserve care.
Research on recursive training highlights why the composition and handling of training data matter. Findings depend on the experimental
conditions.
   NATURE / 2024                                                                   RESEARCH / 2024
   Recursive replacement                                                           Retaining original data
   Shumailov and colleagues observed degradation when models were                  Gerstgrasser and colleagues found that retaining original real data
   recursively trained on generated data under the conditions they                 while accumulating synthetic data avoided collapse in their
   studied.                                                                        experiments.
   Read Shumailov et al. →                                                         Read Gerstgrasser et al. →
These studies support attention to data origins, diversity, and careful selection. They do not show that all synthetic data is harmful, that
human authorship alone guarantees quality, or that buying a license prevents model collapse.
Credtent’S PROPOSED VALUE
Permission, context, and partnership.
Our service focuses on connecting AI teams with content owners, assessing value, and agreeing clear terms. Research findings are distinct
from this proposed service value.
   Need a valuation?                                                               Showing content in AI answers?
   Start with an assessment before discussing a new agreement.                     Agree excerpts, attribution, source links, and compensation.
   Explore content valuation →                                                     Explore citation licensing →
   Contact our team
                                                                                        Free opt-out / Auditing
                                                                                        Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                        Valuation / AI training / Citations
credit, and compensation.
                                                                                        About / Contact / Sitemap
hello@credtent.org
```

### About (/about) — host: credtent.com (canonical; .org links to it)
Mockups: desktop `pages/page-16*.jpg`, mobile `pages/page-17*.jpg`. Copy below is the desktop PDF text with the required substitutions ALREADY applied (creators→creatives, ABOUT→About). Layout follows the PNG; text wins over PNG where they differ.

```text
                                                  Opt-Out    Creative Consent   Resources     About                                             Free opt-out
About Credtent
More choice. Wider participation.
We help creatives and AI companies find constructive ways to work together through choice, consent, credit, and compensation.
   Human judgment                                       Neutral partnership                                         Shared opportunity
   Use AI with curiosity while keeping creative         Help content owners and AI companies                        Make room for more people to participate in
   skills, agency, and responsibility strong.           understand each other’s needs and agree                     the AI economy and the value their work
                                                        clear terms.                                                creates.
THE PEOPLE BEHIND THE WORK
Meet the founders.
   Eric R. Burgess                                                                 Dr. Galen Buckwalter
   Founder and CEO. Creative technologist, writer, novelist, and                   Co-founder and Chief Credibility Officer. Psychologist and data
   technology observer.                                                            analytics expert.
   Eric on LinkedIn →                                                              Galen on LinkedIn →
WRITING AND IDEAS
Keep the conversation going.
Explore writing on human creativity, judgment, and the choices that shape AI. Visit the publications for the latest entries.
   FROM THE CURRENT WRITING INDEX                                                  FROM THE CURRENT WRITING INDEX
   The Creative Fatalism Trap in the Age of AI                                     Human-Composed: Why AI Creation and
   Read on Medium →                                                                Human Creativity Remain Fundamentally
                                                                                   Different
                                                                                   Read on Credtent’s Substack →
   Credtent’s publication                                                          Eric’s personal Substack
   Company perspectives on consent, creativity, and the AI economy.                Burgessing on Content, Board Games and Other Things.
   Visit Credtent’s Substack →                                                     Visit Eric’s personal Substack →
START A CONVERSATION
How can we help?
For questions about opt-out, auditing, valuation, or licensing, contact hello@credtent.org.
   Contact Credtent
                                                                                        Free opt-out / Auditing
                                                                                        Creative Consent / Resources
Credtent helps creatives and AI companies navigate consent,
                                                                                        Valuation / AI training / Citations
credit, and compensation.
                                                                                        About / Contact / Sitemap
hello@credtent.org
```
