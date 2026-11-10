// Privacy policy launch edits (Cherryh 2026-11-10, section 7; EB card "Apply both sets", 2026-11-10).
// The "Last Updated" date is the launch date, which nobody knows yet. Until PRIVACY_LAST_UPDATED is set
// (written as it should read on the page, for example "December 7, 2026"), both privacy pages show the
// placeholder below, and check-launch fails in production mode and warns in preview mode.
export const PRIVACY_LAST_UPDATED = "";
export const PRIVACY_DATE_PLACEHOLDER = "LAUNCH-DATE-PENDING";

export function privacyDate() {
  return PRIVACY_LAST_UPDATED || PRIVACY_DATE_PLACEHOLDER;
}

// Section 3, "Service Providers". Tally is named only where a Tally form is live: credtent.com/contact embeds
// form BzbXK7; the credtent.org forms have no Tally id yet (TALLY_FORM_IDS in render.mjs), so .org drops it.
export const SERVICE_PROVIDERS = {
  com: "We use trusted third-party service providers to operate our platform, including Vercel to host our websites, Google Analytics for usage analytics if you accept analytics cookies, and Tally to receive messages you send through our contact form. These providers access your information only to perform services on our behalf.",
  org: "We use trusted third-party service providers to operate our platform, including Vercel to host our websites and Google Analytics for usage analytics if you accept analytics cookies. These providers access your information only to perform services on our behalf."
};
