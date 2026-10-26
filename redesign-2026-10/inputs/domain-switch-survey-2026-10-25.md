# Credtent domain switch — read-only survey & plan (2026-10-25, ~10:55 AM PT)
Nothing was changed. No secrets were read.

## 0. Timeline of prior work (both sides: Grok side = Cook→LeGuin, Tolkien; Claude side = Claudia, Clarke, Tiptree)
Eric worked on this with BOTH sides. The Grok-side lead was Cook, who renamed itself LeGuin on Oct 19. Clarke on the Claude side built the code pieces.
- 2025-03: the old Webflow site was on credtent.org, with DNS at GoDaddy (Raymond Jia, #engineering_credtent).
- 2026-07-10 / 08-11: planning docs in Drive: "2026-07-10-credtent-com-redesign-analysis.md" and "2026-08-11-credtent-org-launch-plan.md". Copies were re-synced as recently as today. I did not read them in depth.
- 2026-09-06/07 (Cook + Clarke): the credtent.com apex was connected to Vercel Production. GoDaddy A record set to 76.76.21.21, www CNAME to Vercel, GoDaddy forwarding killed. At that point / 301'd to www.credtent.org.
- 2026-09-21: Eric decided primary email moves from .org to .com (shared journal via LeGuin).
- 2026-09-26: Eric's plan: credtent.com becomes the company site at the Aegis launch, and credtent.org becomes the resources/opt-out/creative-education site.
- 2026-09-28: decision "option C", later revised. Aegis serves the credtent.com root and passes a fixed list of marketing paths through to the marketing site, which moves from GitHub Pages to its own Vercel project. credtent.org becomes a Vercel project serving the consent/opt-out page plus page-by-page 301s to .com. No MX/NS moves. Clarke drafted flag-off PRs #86–#90 and a credtent-org-redirect project, which existed only on Eric's Mac (~/Code/credtent-org-redirect).
- 2026-09-29: Eric OK'd pushing the marketing-site branch and the redirect repo to GitHub (Tolkien, repos only). Planned hybrid: .com moves to Aegis Wednesday, .org redirects Thu/Fri after the Oct 1–2 showcase, with a 14-day fallback.
- 2026-09-30: Vercel project `credtent-site` created. It has only credtent-site.vercel.app attached, no custom domain.
- 2026-10-01: GoDaddy nameserver split diagnosed for credtent.com. ns21 served the Sept 7 Vercel zone and ns22 the June 30 zone (15.197.225.128 / 3.33.251.168). The fix was to republish the Sept 7 zone in the GoDaddy editor. That republish was blocked by GoDaddy sign-in and an unusual-browser warning. Clarke's PR #12 "trim … on the credtent.com cutover" and draft PR #13 (staging) were opened in Credtent/credtent.github.io.
- 2026-10-05/06: AI-visibility work (llms.txt, sitemap, entity graph) and a guides pillar were merged into credtent.github.io and are live on credtent.org.
- 2026-10-18 (Claudia, #agent_chat): credtent.com has no DKIM or DMARC. Someone edited the credtent.com zone (serial 2026101801), and the web records moved from Vercel to GoDaddy forwarding, so .com deep links return 404. Eric approved restoring the Vercel records Monday 10/19 at 1:00, plus adding DKIM/DMARC. An Aegis admin allowlist edit on .com was set for Tue 10/20 at 9:00.
- 2026-10-19 (LeGuin): the Grok side did not make the edit, and its GoDaddy browser sign-in was blocked. Eric was to check GoDaddy's activity log.
- **Where it left off:** today's DNS shows the 10/19 restore and the DKIM/DMARC adds never happened (see §1). The marketing site is still on GitHub Pages at credtent.org. Cutover PRs #8 and #12 are still open.

## 1. DNS (via dns.google DoH; dig isn't installed; UDP to the authoritative servers timed out)
Registrar and DNS host for both domains: GoDaddy (domaincontrol.com NS). RDAP lookups failed, so the registrar comes from NS records and Slack history.
**credtent.com** (ns21/ns22.domaincontrol.com)
- Apex A 15.197.225.128, 3.33.251.168 (GoDaddy forwarding/parking IPs). www A is the same.
- Live HTTP: `/` returns 302 to https://credtent.org/, and `/about` returns 404. **credtent.com is not on Vercel today.**
- MX: Google Workspace (aspmx + alt1–4). Live, do not touch.
- SPF: `v=spf1 include:dc-aa8e722993._spfm.credtent.com ~all`, which resolves to include:_spf.google.com (GoDaddy SPF macro). One record, valid.
- google-site-verification present.
- DKIM: resend._domainkey present. **google._domainkey missing.**
- **DMARC: missing.**
- send.credtent.com: MX feedback-smtp.us-east-1.amazonses.com plus SPF (Resend sending subdomain), so Resend for .com looks set up.
- No app.credtent.com.
- I could not check each nameserver separately, so I don't know whether the ns21/ns22 split still exists.
**credtent.org** (ns19/ns20.domaincontrol.com)
- Apex A 185.199.108–111.153 (GitHub Pages). www CNAME credtent.github.io, which 301s to the apex. The site title is "Credtent: Neutral Licensing Infrastructure for the AI Economy", canonical https://credtent.org/.
- app.credtent.org CNAME cname.vercel-dns.com, which is Aegis (credtent-one), 307 to /login.
- MX: Google Workspace. Live.
- **SPF is broken: three separate v=spf1 records** (icloud, sendgrid, GoDaddy/Google macro). That is a PermError, so receivers treat SPF as failing for @credtent.org mail. Fix this now, independent of the switch.
- DMARC p=none, rua=dmarc-reports@credtent.org. Three google-site-verification records plus an apple-domain record.
- DKIM: resend._domainkey present, **google._domainkey missing**. send.credtent.org is set up for Resend/SES.

## 2. Vercel (team erburgess-projects)
- credtent-one (Aegis): domains are app.credtent.org, credtent-one.vercel.app, and credtent-one-staging.vercel.app (custom env). **No credtent.com domain is attached now.**
- credtent-site (created 9/30): only credtent-site.vercel.app. This is presumably the marketing site prepared for Vercel. No custom domain.
- Other related projects: credtent-staging, credtent-homepage-preview, website, dist, credtent-investor. I didn't check their deployments.
- I couldn't see which project, if any, still holds credtent.com/.org: get_domain_project_domains returned 403 on both apexes, so the domains are not owned by this team's account. I didn't check the latest deployment, branch, or Prod state for credtent-site.

## 3. GitHub
- Credtent/credtent.github.io (live credtent.org site, GitHub Pages). Last main commit is 15efa75 on 10/06 (guides pillar).
  - Open PRs: #8 "Guides release and credtent.com cutover" (draft, 9/28), #12 "trim … on the credtent.com cutover" (9/30), #13 "staging trims, do not merge" (draft), #18 "Homepage creatives wording + CAI line" (10/23).
  - **This repo is the "new B2C/resources" candidate.** Its content is the full site, but it is still framed as the corporate site. Eric needs to confirm whether the B2C/resources version is this repo, a branch of it, or something else (see unknowns).
- Others: Credtent/credtent-homepage (4/17), Credtent/credtent-marketing-keystatic-site (6/22), erburgess/credtent.org- (2/16), and a "credtent-com" repo referenced by Claudia on 10/18 (badges in public/assets/badges). I couldn't locate that last one in search.
- Code search for "credtent.org" in erburgess/credtent-one and Credtent/credtent-sales-assistant returned 0 hits (index incomplete), so hardcoded-domain auditing is **not done**. It needs a local clone and grep.
- I didn't find the credtent-org-redirect repo in search.

## 4. Email (not fully surveyed)
- Evidence: Eric's Slack identity, CrediGO inbound and Raymond all use @credtent.org. Eric's Vercel primary email was set to eric@credtent.com on 10/01, so .com addresses receive mail. Slack invited edmond.allmond@credtent.org on 10/24 (spelled allmond, with .org). Both domains have Google MX, which suggests .com is already an alias or secondary domain in the same Workspace.
- I didn't check the Gmail connectors for send-as/alias settings. I ran out of time before that step, and doing it needs the Workspace admin anyway.

## 5. Other dependencies (to audit)
Aegis AUTH_URL and magic-link/OAuth callbacks (app.credtent.org), Resend from-addresses (both domains already have Resend DKIM), sales@/eric@ notify addresses, CORS, canonical tags (credtent.org canonical is self), Search Console (both domains have verification records), sitemap/llms.txt, and marketing and signature links. I couldn't see Slack, Stripe, HubSpot or Publer settings.

## 6. Plan (sequenced; every step needs Eric's yes)
0. **Decide scope.** Earlier plan (9/28): .org becomes a redirect shell. Today's goal: .org hosts the full B2C/resources site. Eric picks which repo/branch is the B2C site and which is the corporate .com site, and the path split between them.
1. **Email auth hardening (no MX change).** Human, in GoDaddy: merge credtent.org's three SPF records into one (`v=spf1 include:_spf.google.com include:amazonses.com [include:sendgrid.net if still used] ~all`). Generate Google DKIM for both domains in Workspace Admin and publish google._domainkey. Add DMARC p=none with rua to credtent.com. Rollback: restore the old TXT values, low risk. Wait 1–2 weeks of DMARC reports before going stricter.
2. **Resolve the GoDaddy zone.** Eric signs in to GoDaddy, checks the activity log (who made serial 2026101801), confirms ns21/ns22 agree, and deletes any domain forwarding on .com. Needs a human because the browser sign-in is blocked for the bot.
3. **Corporate site on credtent.com.** Attach credtent.com + www to the chosen Vercel project (Aegis root with pass-through, or credtent-site) in Preview first, QA, then set A 76.76.21.21 / www CNAME cname.vercel-dns.com. Rollback: re-enable GoDaddy forwarding to .org. The current state is already degraded (404s), so the risk is low.
4. **B2C/resources site on credtent.org.** Deploy it to a Vercel project (or keep it on GitHub Pages), with a 301 map from old corporate URLs to credtent.com, canonical tags per domain, and an updated sitemap/llms.txt. Cut the A/CNAME over last, after .com is serving. Rollback: point A back to GitHub Pages IPs (keep the repo's CNAME file). The SEO risk is duplicate content and lost rankings, so submit a Search Console change-of-address only for the pages that moved.
5. **Aegis.** Keep app.credtent.org for now (it's working). A later move to app.credtent.com needs: domain added in Vercel, AUTH_URL/NEXTAUTH_URL, OAuth redirect URIs, magic-link domain, Resend from-address, CORS, cookies (users get logged out), and a 301 from app.credtent.org. Do it after the email switch.
6. **Email migration (Workspace admin, human).** Make credtent.com the primary domain in Google Workspace (Admin → Domains: switching the primary domain is supported, and .org becomes a secondary/alias domain). Rename users to @credtent.com, keeping @credtent.org as aliases so .org mail keeps arriving with no MX change. Set default send-as to .com. Update Slack, Vercel, GitHub, Stripe and HubSpot logins, CrediGO inbox watchers (which match eric@credtent.org), and signatures. Rollback: rename back, since aliases keep both addresses working. Risks: OAuth/SSO identities tied to .org, the CrediGO reply detection, and third-party "Sign in with Google" accounts.
7. **Later:** DMARC to quarantine on both domains once reports are clean.

## 7. Needs a human/login
GoDaddy (DNS, forwarding, activity log), Google Workspace super-admin (DKIM, primary domain, user renames), Vercel domain ownership (the 403 on both apexes suggests they're registered in another scope or account), Search Console owner.

## 8. Unknowns
Which repo/branch is "the new B2C/resources site". Whether the ns21/ns22 split persists. Who made the 10/18 zone edit. Which Vercel account owns the credtent.com/.org domain objects. Workspace primary/alias config and existing send-as entries. Hardcoded domains in credtent-one and CrediGO (search index failed). Contents of the two Drive plans and of credtent-site's deployments. Whether SendGrid is still used.
