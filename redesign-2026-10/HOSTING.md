# Hosting plan

This is a plan only. No Vercel project, domain, or DNS record is created from the redesign branch. Eric handles DNS. Both marketing sites stay on draft previews until he publishes them.

## Where the sites live

Long term, credtent.com and credtent.org are two Vercel projects, not GitHub Pages. `app.credtent.org` stays the separate Aegis app. `registry.credtent.org` stays the registry. The marketing sites only link to those hosts.

Recommended shape: keep one repo and attach two Vercel projects.

| Project | Production domain | Root directory | Output |
|---|---|---|---|
| Corporate | credtent.com | `redesign-2026-10/sites/com` | Static files already in that folder |
| Creatives | credtent.org | `redesign-2026-10/sites/org` | Static files already in that folder |

Each folder has its own `vercel.json`. Set the framework preset to Other, leave the build command empty, and set the output directory to `.` because the HTML, CSS, fonts, and images are committed. A later change can build from `redesign-2026-10` in CI and deploy only the two output folders. Do not point either project at the repository root. That root is still the current GitHub Pages site.

Separate repos are possible later. They cost a second copy of the shared tokens and the generator. The monorepo is the smaller move while both sites are still drafts.

## How the domains fit together

- credtent.com serves the corporate pages: content owners, AI companies, services, about, pricing, FAQ, and Creative Origin for publishers. `/partners` is not one of those pages in this preview.
- credtent.org serves opt-out, Creative Consent, resources, badges, the standards catalog, the creative licensing guide, and `/creative-origin`.
- `sites/org/vercel.json` has one-for-one 301s (`statusCode: 301`, not a blanket rule) onto credtent.com for the corporate URLs that used to live on .org. Each moved path has its clean form, a trailing-slash form, and an `.html` form: `/for-ai-companies`, `/for-content-owners`, `/pricing`, `/about`, `/faq`, `/certified-publisher`, and `/guides/ai-training-data-licensing-companies` (including `index.html`). Nothing redirects to the .com home as a catch-all.
- `/partners`, `/partners/`, and `/partners.html` are temporary 302s to `/` on both hosts. The page, nav, footer, sitemap, and `llms.txt` do not mention it. Partner names are waiting on Eric's reconfirmation, and a 302 keeps the path free to come back.
- `/standards` stays on credtent.org for creatives. `/standards.html` 301s to `https://credtent.org/standards`. The clean `/standards` path is not a cross-host redirect. BUILD-SPEC still has an open note about moving it to credtent.com; that move is not in this file.
- `/creative-origin` stays a page on credtent.org. It is not redirected to `registry.credtent.org`. The page may link there. Whether to redirect later is Eric's call. `/creative-origin/index.html` 301s to `https://credtent.org/creative-origin` on the same host.
- Privacy and terms stay on both hosts. Old `.html` URLs 301 to the .org copies. Whether one host should own the legal pages is Eric's call.
- Nothing in either project should proxy or redirect `app.credtent.org` or `registry.credtent.org`. Signup, sign-in, and the free opt-out are links only.

Do not attach the .org production domain, and do not enable those 301s on a public host, until credtent.com answers 200 for every redirect target. Preview URLs can carry the redirect file. Production DNS cannot, yet.

## Cutover, when Eric is ready

1. Open two Vercel projects from this repo with the root directories above. Use preview deployments only.
2. Confirm both previews are noindex (`meta robots`, `X-Robots-Tag`, and `robots.txt` `Disallow: /`).
3. Click through .com and .org on desktop and a phone. Confirm the .org redirects land on real .com paths.
4. When the corporate pages are ready to take traffic, attach credtent.com in Vercel and point DNS at that project. Eric does this step.
5. Only after those .com URLs return 200, attach credtent.org and point its DNS at the second project. The 301s then move the old corporate paths.
6. Leave `app.credtent.org` and `registry.credtent.org` on their current hosts.
7. At publish time, rebuild with `SITE_ENV=production`. That build writes `robots.production.txt` to `robots.txt` and omits the sitewide noindex meta tag and `X-Robots-Tag`. Parked URLs and the three coming-soon resource pages stay noindex. The files committed on this branch are the preview build. Eric runs the production build. This branch does not deploy it.
8. Retire GitHub Pages only after DNS has moved and the previews have been accepted. Do not change `gh-pages` from this work.

## What this branch does not do

It does not create a Vercel project, assign a domain, change nameservers, or merge to `main`, `gh-pages`, or `staging`.
