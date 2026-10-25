# Astra Credtent redesign (Design Review 07, Sep 21 2026): SEO / AEO / GEO assessment
Niven, 2026-10-25. Read-only review. Nothing was published, pushed, deployed or changed, and no one was contacted.

## 0. What I read, and what was missing
- **Read:** credtent-design-review.pdf (21 pages; pdftotext -layout, 70 KB of text), credtent-website-analysis.md, revision06-brief.md, revision07-feedback-checklist.md, domain-switch-survey-2026-10-25.md, and partners-page-draft-2026-10-25.md (a sibling draft in /workspace/domain-switch/).
- **Live GETs (2026-10-25, about 11:15 AM PDT):**
  - credtent.com/: one redirect to https://credtent.org/ (200). A HEAD request returns 405.
  - credtent.com/about, /robots.txt, /llms.txt and /sitemap.xml: all 404.
  - credtent.org/, /about, /robots.txt, /llms.txt and /sitemap.xml: all 200. The sitemap has 17 URLs.
- **Missing:** astra-redesign/ contains no HTML, Astro source or repo. It holds only the static preview PDF and notes. That means I could not inspect the redesign's **titles, meta, H1s, JSON-LD, canonicals or link markup**: they don't exist yet. The design notes say "semantic discovery implementation" is remaining launch work. All on-page markup findings below come from the **live credtent.org** site, which the build would replace or migrate. All copy findings come from the PDF text.

## 1. SEO
### Information architecture
- The PDF covers eight page types, each in desktop and mobile:
  - Credtent.org (B2C)
  - Credtent.com (commercial)
  - Collaborithmic.com
  - Creative Consent
  - Citation licensing
  - Content valuation
  - AI training licensing
  - About
- .com nav: Content owners / AI companies / Services / About, plus Sign up. That is sound, with clear audience hubs. The separate training and citation pages are kept rather than merged, which is good for query targeting.
- .org nav: Opt-Out / Creative Consent / Resources / About, plus Free opt-out. Also sound.
- **Gap:** the footers on both sites carry the same link set: Free opt-out / Auditing / Creative Consent / Resources / Valuation / AI training / Citations / About / Contact / Sitemap. Nothing defines which host owns each path. The PDF footers on .com pages list hello@credtent.org. A URL ownership map (host + path for every page) has to exist before the build.
- **About page host is ambiguous:** the About preview uses the .org nav, but the new plan makes .com the corporate site. Decide which host holds the canonical About page, and with it the Person and Organization entity home.
- The planned /resources/auditing and opt-out limitations FAQ pages (analysis.md) are not in the previews.

### Titles and meta
- None are in the design, so they must be written.
- Live .org home title: "Credtent: Neutral Licensing Infrastructure for the AI Economy". It is fine, but the redesign has to decide which host gets this corporate title.
- Live /about title ends "(PBC)". Under the lock, change that to "Delaware Public Benefit Corporation" or drop it.
- Every new page needs a unique title and description: valuation, training, citation (GRR), Creative Consent, auditing.

### Headings
The design uses headline triplets ("Creative work. / Clear AI permissions. / Value for both."; "Your work. / Your choices. / Your terms."). These must ship as **one H1 text node**, not three H1s or images. Keep the eyebrows ("CONNECTING CREATIVITY AND AI", "HOW LICENSING WORKS") as styled text, not H1/H2.

### Internal links
- The .com links are clear: Explore content-owner options, Explore AI training licensing, Explore citation licensing, Request a valuation.
- Several link texts are generic: "Read the resource →" appears three times on .org. Use descriptive anchors.
- A cross-host link ("Sitemap" in the footer) needs one sitemap per host.

### Schema (live; the redesign has none yet)
- Live .org home has:
  - Organization `https://credtent.org/#organization` (sameAs LinkedIn and CB Insights, Glendora PostalAddress)
  - WebSite `#website`
  - FAQPage `#faq` with 5 Q&As
  - Person `https://credtent.org/about#eric-r-burgess`
- Live /about has Organization, Person and BreadcrumbList.
- The /about canonical is `https://credtent.org/about.html` while the page is served at /about. That mismatch should be fixed in the migration regardless.

### .com/.org migration and redirect risk (HIGH)
Today, credtent.com is a forward to .org, and all .com paths 404. Everything canonical points to .org:
- canonicals
- robots `Sitemap: https://credtent.org/sitemap.xml`
- the 17 sitemap URLs
- the schema @ids
- llms.txt
- the "same-as" identity

Moving the corporate canonical to .com needs:
1. **A 301 map** for each old .org corporate URL. Include .html variants such as /for-ai-companies.html and /about.html, mapped to the exact .com equivalent. Never send them to the .com home. Don't redirect the whole of .org: .org stays the B2C/resources site, which is a partial migration.
2. Self-canonicals on each host. No cross-host duplicates. Today .com/ serves .org content after a redirect, and that must end.
3. A separate robots.txt, sitemap.xml and llms.txt on each host. Each robots Sitemap line must point to its own host.
4. **Schema @id migration.** Pick one permanent Organization @id, e.g. `https://credtent.com/#organization`. Reference it from .org rather than declaring a second organization. Move the Person @id to the canonical About host. Add sameAs/`url` links so the two domains read as one entity.
5. Search Console: Domain properties for both apexes. Use Change of Address only if the move is whole-site. Since this one is partial, rely on 301s plus sitemaps, and monitor coverage.
6. Keep app.credtent.org (Aegis) out of the redirects. Check that robots has noindex or disallow rules for app routes.
7. Fix .com DNS/hosting (the GoDaddy forward and the 404s) **before** any 301 points at .com. Otherwise the redirects land on errors.

### Core Web Vitals risks visible in the design
- **LCP:** a full-bleed 16:9 photo hero on .com and photo heroes on every page. Serve AVIF/WebP with responsive srcset, preload the hero, `fetchpriority=high`, and set explicit width/height. The 24 MB PDF suggests large source images, so don't ship originals.
- **CLS:** the live site injects nav and footer via `components.js` into `#nav-placeholder` / `#footer-placeholder`. That causes layout shift, and crawlers that don't run JS see no nav links. Render the nav and footer server-side (Astro components) in the redesign.
- **Fonts:** the multi-weight display headlines imply webfonts. Self-host them with `font-display: swap` or `optional`, and preload one weight with metric-matched fallbacks.
- The valuation diagram (5 inputs → assessment) should be HTML/SVG text, not a raster, so it is crawlable and accessible.
- Logos export at 8× PNG (checklist). Prefer the SVG originals.

## 2. AEO / GEO (Visibility = Structure × Clarity × Trust × Access)
Because the model multiplies, a zero in any factor zeroes visibility. Right now **Access** on .com is zero: everything 404s or forwards.

### Structure
- No FAQ blocks and no answer-first capsules appear in the previews.
- Add a 2–3 sentence answer-first summary at the top of every page, plus a visible FAQ on every page. FAQPage schema can describe it; rich results are not the goal (the analysis notes Google ended FAQ rich results).
- Keep the live 5-Q&A FAQ and move it to whichever host it belongs on.

Suggested capsules:
- **.com home:** "Credtent is a neutral marketplace that helps content owners and AI companies agree permitted AI uses, value content, and license it for training and for use in AI answers."
- **Training:** "Credtent licenses a defined corpus with documented origins and quality criteria for AI training, with scope, compensation and access to new work agreed in the license."
- **Citation (GRR):** "Generative Results Referencing (GRR) is Credtent's licensing for use in AI answers: excerpt limits, attribution, source links and compensation, including appearances without a click."
- **Valuation:** "A baseline valuation comes when you add content; optional paid custom valuation goes deeper. It is an informed starting point, not a guaranteed price."
- **.org home:** "Credtent's free opt-out records your AI-training preferences and sends them to AI companies each quarter; it cannot guarantee every company acts on them."
- **Creative Consent:** "Creative Consent rates how platforms handle AI training: Full, Optional or No Protection."
- **About:** "Credtent, Inc. is a Delaware Public Benefit Corporation founded by Eric R. Burgess (CEO) and Dr. Galen Buckwalter."

### Clarity (entity)
- The design's entity statement is consistent and quotable: "A neutral marketplace connecting content owners and AI companies".
- The design never states the legal entity. The live llms.txt correctly says "Delaware Public Benefit Corporation". Put it on About and in the footer as well.
- Define GRR on first use. It already is, which is good.

### Trust (E-E-A-T)
- **Strengths:** the design states its limits honestly:
  - "We cannot guarantee that every company will act on your request."
  - "Source visits are a goal, not a guarantee."
  - "not a guaranteed transaction price"
  - "observations are not proof of dataset inclusion"
  
  These are good, quotable trust signals. The design also adds no customer, certification or legal claims, and the founders are named with LinkedIn links.
- **Gaps:**
  - The team roster is stale, per the checklist.
  - There is no Person schema for Galen.
  - There is no dated, attributed review on policy content.
  - The approved licensing sentence is absent from the AI-company and training pages. Add it verbatim: "Licenses include the rights the contracting holders warranted, a named manifest, and a disclosure pack your counsel can use for EU AI Act Art. 53 and CA AB 2013 filings. Those statutes still bind the developer. Indemnity, if any, is only as written in the signed license."
  - The address appears in the schema but not in the visible design.

### Access
- .org: robots allows named AI crawlers with a /parking/ exclusion, and llms.txt is live. Good.
- .com: nothing is served yet. It needs its own llms.txt (corporate: licensing, valuation, GRR, AI companies) and must point to .org's llms.txt for the opt-out and Creative Consent material.

### Organization / Product schema
- **Organization** (one @id, on .com): legalName "Credtent, Inc.", description, address, founder (Person), sameAs, plus `url` for both domains.
- **Service** or Product+Offer: Opt-Out Premium (US$49/yr, shown in the design), and Service entries for training licensing, GRR citation licensing and valuation. Don't put prices on anything without a published price.

### Copy lock check (PDF preview text)
| Lock | Finding |
|---|---|
| "creatives", not "creators" | **VIOLATION, widespread (roughly 40+ hits).** Examples: "FOR CREATORS IN THE AGE OF AI" (.org hero eyebrow), "CREATOR RESOURCES", the site-wide footer "Credtent helps creators and AI companies navigate consent, credit, and compensation.", "Creators can still choose to participate", "For creators" (citation page), "creator-side evidence" (valuation), "License content from creators and subject-matter experts" (training), "A creator's perspective" (book), About "We help creators and AI companies…". The live .org also has creator/creators about 12 times on the home page and 3 on /about. |
| Never name the two locked brands | **Flag:** the PDF photo-credit appendix lists a Pexels source URL containing (slug "woman-using-a-[brand]-video-camera", Pexels 13377853) naming a locked brand. It isn't page copy, but keep that slug out of public credits and alt text, or choose another photo. The other locked name does not appear. |
| Spelling Credtent | OK. One heading reads "ABOUT Credtent". Fix the case. |
| Low-confidence sizes vague | OK. The preview has no corpus counts or volumes. "two and a half years developing full-cycle AI licensing" (book blurb) and "seven Disney years, thirty years" (checklist bio) are biographical. Confirm them with Eric. |
| Banned terms (court-defendable, indemnification included, CaaS, B Corp, retroactive licensing) | None in the preview copy. "B Corp" appears only in the internal analysis.md recommendation. The checklist says the old ai-companies.astro source has indemnification and compliance claims. Make sure they are not reintroduced at build time. |
| Delaware Public Benefit Corporation only | Not stated in the preview. Live /about title uses "(PBC)". Fix it. |
| CAI, not C2PA | Neither appears. OK. |
| WGA as "partnership" | WGA doesn't appear. About has a "Neutral partnership" value tile; that is not about the WGA, but consider "Neutral role" to avoid confusion. "Permission, context, and partnership." (training page) is generic. OK. |

## 3. Verdict: NOT ready to publish
It is a static design proposal with no HTML or schema yet. Its own notes say semantic discovery implementation, team confirmation and the resource articles are outstanding. The design direction is good, though.

### Must-fix before publishing
1. Replace every "creator/creators/creator-side" with "creatives" or "creative" in all previews and in the live .org copy, footer tagline included.
2. Get credtent.com serving 200s (end GoDaddy forwarding) before any 301 points at it.
3. Write and implement a URL ownership map and a 1:1 301 map from old .org corporate URLs (including the .html variants) to .com. No blanket .org redirect.
4. Migrate the SEO plumbing per host: self-canonicals (and fix the /about vs about.html mismatch), separate robots.txt with its own Sitemap line, sitemap.xml and llms.txt on each host.
5. Consolidate entity schema under one Organization @id on .com, move the Person @id to the canonical About host, and add Service/Offer schema. Validate it.
6. Server-render the nav and footer (no `components.js` placeholders), optimize the hero images (srcset, preload, dimensions) and self-host fonts with swap.
7. Add an answer-first capsule and a visible FAQ to each page, state "Delaware Public Benefit Corporation" (drop "(PBC)"), and add the approved licensing sentence verbatim to the AI-company and training pages.

### Should-fix
- Use descriptive anchors instead of "Read the resource →".
- Fix "ABOUT Credtent" casing.
- Update the stale team roster (checklist item 1).
- Use contact emails that match each host's role on .com pages.
- Swap the photo whose credit slug names a brand on the lock list.
- Add Person schema for Dr. Galen Buckwalter.
- Show the address visibly on About or Contact.
- Set up Search Console Domain properties for both apexes and dated baseline AI-answer queries.
- Rename the "Neutral partnership" tile.
- Make the valuation diagram HTML/SVG.

## 4. Partner-names page
- **URL:** `https://credtent.com/partners`. Put it in the .com nav ("Partners") and footer (Company), with a homepage strip of 4–6 names linking to it (as in partners-page-draft).
- **Schema:** a `CollectionPage` whose `mainEntity` is an `ItemList` of `Organization` entries, each with name, url and description of the type of work. Link back to `https://credtent.com/#organization`.
  - Why ItemList: it states "a list of companies on this page" without asserting a corporate relationship.
  - Avoid `member`/`memberOf`, `parentOrganization` or `sponsor`. They imply membership or affiliation that Credtent doesn't have: these are represented catalogs, not members.
  - If a relation is wanted, a plain-text `description` ("Catalog represented by Credtent") is safer than any schema property that implies endorsement.
- **Copy pattern:**
  - Heading: "The companies and creatives we represent."
  - Group by content type, using text cards: name, one line on the type of work, and a link to the partner's site. No logos without written logo permission.
  - Small print: "Listing reflects a representation or licensing agreement with Credtent. It does not imply endorsement of Credtent or any specific AI company deal."
  - **List only partners with written consent to be named.** Eric must reconfirm every name before publishing. The draft's "cleared" list dates from Jun–Aug and is flagged unverified.
  - No AI-buyer names, volumes or deal terms.

Example JSON-LD. **All names and URLs below are PLACEHOLDER EXAMPLES, not real partners:**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://credtent.com/partners#page",
  "url": "https://credtent.com/partners",
  "name": "The companies and creatives Credtent represents",
  "isPartOf": {"@id": "https://credtent.com/#website"},
  "about": {"@id": "https://credtent.com/#organization"},
  "mainEntity": {
    "@type": "ItemList",
    "name": "Catalogs represented by Credtent",
    "itemListOrder": "https://schema.org/ItemListUnordered",
    "itemListElement": [
      {"@type": "ListItem", "position": 1,
       "item": {"@type": "Organization", "name": "EXAMPLE Publisher A (placeholder)",
                "url": "https://example.com/", "description": "EXAMPLE: trade journalism catalog represented by Credtent"}},
      {"@type": "ListItem", "position": 2,
       "item": {"@type": "Organization", "name": "EXAMPLE Media Company B (placeholder)",
                "url": "https://example.org/", "description": "EXAMPLE: educational audio catalog represented by Credtent"}}
    ]
  }
}
```
