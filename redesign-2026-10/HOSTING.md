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

- credtent.com serves the corporate pages: content owners, AI companies, services, partners, about, pricing, FAQ, and Creative Origin for publishers.
- credtent.org serves opt-out, Creative Consent, resources, badges, the standards catalog, and the creative licensing guide.
- `sites/org/vercel.json` has one-for-one permanent redirects onto credtent.com for the corporate URLs that used to live on .org, including `/about`, `/pricing`, `/faq`, `/certified-publisher`, and the company licensing guide. There is no blanket redirect and no catch-all to the .com home page.
- `/standards` stays on credtent.org for creatives. `/standards.html` 301s to `https://credtent.org/standards`, the same same-host `.html` normalization as `/opt-out.html` and `/blog.html`. The clean `/standards` path is not a cross-host redirect. BUILD-SPEC still has an open note about moving it to credtent.com; that move is not in this file.
- Nothing in either project should proxy or redirect `app.credtent.org` or `registry.credtent.org`. Signup, sign-in, and the free opt-out are links only.
- The creative-origin redirect on .org points at `https://registry.credtent.org/creative-origin`.

Do not attach the .org production domain, and do not enable those 301s on a public host, until credtent.com answers 200 for every redirect target. Preview URLs can carry the redirect file. Production DNS cannot, yet.

## Cutover, when Eric is ready

1. Open two Vercel projects from this repo with the root directories above. Use preview deployments only.
2. Confirm both previews are noindex (`meta robots`, `X-Robots-Tag`, and `robots.txt` `Disallow: /`).
3. Click through .com and .org on desktop and a phone. Confirm the .org redirects land on real .com paths.
4. When the corporate pages are ready to take traffic, attach credtent.com in Vercel and point DNS at that project. Eric does this step.
5. Only after those .com URLs return 200, attach credtent.org and point its DNS at the second project. The 301s then move the old corporate paths.
6. Leave `app.credtent.org` and `registry.credtent.org` on their current hosts.
7. At publish time, set `SITE_ENV=production`, replace `robots.txt` with `robots.production.txt`, and remove the noindex meta tag and the `X-Robots-Tag` header. That switch is not part of this branch.
8. Retire GitHub Pages only after DNS has moved and the previews have been accepted. Do not change `gh-pages` from this work.

## What this branch does not do

It does not create a Vercel project, assign a domain, change nameservers, or merge to `main`, `gh-pages`, or `staging`.
