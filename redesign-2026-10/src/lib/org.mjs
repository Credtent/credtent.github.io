import { ADDRESS_HTML, BOOK, CAPSULE, OPT_OUT_FLOW, SIGN_IN, price } from "./copy.mjs";
import { ORG_ID, bcorpBadge, figure, inquiryForm, picture } from "./render.mjs";

function editions() {
  return `<ul class="editions">
    <li><p class="kicker">Standard e-book</p><p>${price("$14.99")}</p><p>A standalone digital edition.</p></li>
    <li><p class="kicker">Paperback</p><p>${price("$24.99")}</p><p>A standalone printed edition.</p></li>
    <li><p class="kicker">Living e-book</p><p>${price("$49")}</p><p>Quarterly updates included.</p></li>
  </ul>`;
}

export function orgPages(images) {
  const shot = (key, opts = {}) => figure(images[key], opts);
  const preload = (key, sizes) => `<link rel="preload" as="image" href="${images[key].base}-${images[key].widths.at(-1)}.avif" type="image/avif" imagesrcset="${images[key].widths.map((w) => `${images[key].base}-${w}.avif ${w}w`).join(", ")}" imagesizes="${sizes}" fetchpriority="high">`;

  return [
    {
      path: "/",
      title: "Credtent for creatives | Opt out, consent, and resources",
      description: "Tell AI companies not to train on your work. Understand how platforms use your content and make informed choices.",
      eyebrow: "For creatives in the age of AI",
      h1: "Your work.<br>Your choices.<br>Your terms.",
      capsule: CAPSULE.orgHome,
      lede: "Tell AI companies not to train on your work. Understand how platforms use your content and make informed choices about your work.",
      actions: `<div class="btn-row"><a class="btn" href="${OPT_OUT_FLOW}">Get free opt-out</a><a class="btn btn-ghost" href="/opt-out">See how it works</a></div>`,
      media: `<figure class="hero-media">${shot("creative", { priority: true, sizes: "(min-width: 1000px) 520px, 100vw" }).replace(/^<figure class="shot">/, "").replace(/<\/figure>$/, "")}<div class="caption-panel"><strong>Keep creating.</strong><span>We'll help you navigate AI.</span></div></figure>`,
      preload: preload("creative", "(min-width: 1000px) 520px, 100vw"),
      faq: [
        { q: "What does the free opt-out do?", a: CAPSULE.orgHome },
        { q: "Does registration remove work from datasets?", a: "No. Registration does not automatically remove work from datasets. Credtent records preferences and the notices it sends." },
        { q: "What is Opt-Out Premium?", a: "Optional monthly auditing of observable model responses. It is US$49 a year for individuals and US$249+ a year for organizations. The observations are not proof of dataset inclusion." }
      ],
      main: `<section class="section">
        <div class="wrap">
          <p class="eyebrow">For the work you make</p>
          <h2>Whatever you create, your choices matter.</h2>
          <p class="lede">Practical tools and resources to help you protect your creative work and understand your choices in the age of AI.</p>
          <div class="photo-band">
            <figure>${shot("writer", { sizes: "(min-width: 1000px) 50vw, 100vw" }).replace(/^<figure class="shot">|<\/figure>/g, "")}<figcaption>For the words you write.</figcaption></figure>
            <figure>${shot("filmmaker", { sizes: "(min-width: 1000px) 50vw, 100vw" }).replace(/^<figure class="shot">|<\/figure>/g, "")}<figcaption>For the stories you bring to life.</figcaption></figure>
          </div>
          <hr class="rule">
          <div class="facts">
            <article class="fact"><p class="kicker">Free</p><h3>Opt-out registration</h3><p>Tell AI companies not to train on the work you identify.</p></article>
            <article class="fact"><p class="kicker">Quarterly</p><h3>Opt-out list distribution</h3><p>Credtent sends the list on a quarterly cadence.</p></article>
            <article class="fact"><p class="kicker">Optional</p><h3>Monthly Premium auditing</h3><p>Add observation of model responses if you want a clearer record.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">A documented history</p>
          <h2>How your opt-out works</h2>
          <p class="lede">Credtent records your opt-out preferences and the notices we send to AI companies, building a documented history over time. We cannot guarantee that every company will act on your request.</p>
          <div class="steps" style="margin-top:24px">
            <article class="step"><p class="kicker">01</p><h3>Register your preferences</h3><p>Identify the work you want included in your opt-out request.</p></article>
            <article class="step"><p class="kicker">02</p><h3>We send your request</h3><p>Credtent distributes the opt-out list to AI companies each quarter. Sent notices are distinct from confirmed receipt or action.</p></article>
            <article class="step"><p class="kicker">03</p><h3>Choose additional support</h3><p>Optional Opt-Out Premium adds monthly auditing of observable model responses.</p></article>
          </div>
          <p class="fine">Registration does not automatically remove work from datasets.</p>
        </div>
      </section>
      <section class="section" id="premium">
        <div class="wrap premium">
          <div>
            <p class="eyebrow">Opt-Out Premium</p>
            <h2>Monthly audits. A clearer record.</h2>
            <p class="lede">Credtent audits observable model responses monthly and records the results. These observations are not proof of dataset inclusion or infringement.</p>
            <div class="btn-row"><a class="btn" href="/resources/auditing">Understand auditing</a></div>
          </div>
          <div class="price-stack">
            <p>${price("US$49")}</p>
            <span class="price-meta">annually for individuals</span>
            <p>${price("US$249+")}</p>
            <span class="price-meta">annually for organizations</span>
          </div>
        </div>
      </section>
      <section class="section section-tint">
        <div class="wrap">
          <p class="eyebrow">Creative Consent</p>
          <h2>Know the terms. Keep the choice.</h2>
          <p class="lede">Understand how the platforms where you publish handle AI training, and what controls you have.</p>
          <div class="consent-badges" style="margin-top:24px">
            <article class="card"><img src="/brand/consent-full.svg" width="96" height="96" alt=""><h3>Full Protection</h3><p>Protected by default. AI training requires explicit opt-in. Creatives can still choose to participate.</p></article>
            <article class="card"><img src="/brand/consent-optional.svg" width="96" height="96" alt=""><h3>Optional Protection</h3><p>Protection depends on using an available, effective opt-out.</p></article>
            <article class="card"><img src="/brand/consent-none.svg" width="96" height="96" alt=""><h3>No Protection</h3><p>The assessed policy offers no effective choice to prevent that use.</p></article>
          </div>
          <div class="btn-row"><a class="btn" href="/creative-consent">Explore Creative Consent</a></div>
        </div>
      </section>
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">Creative resources</p>
          <h2>Understand more. Decide for yourself.</h2>
          <div class="grid-3" style="margin-top:24px">
            <article class="card resource-card">${shot("resourceOptout", { sizes: "(min-width: 1000px) 340px, 100vw" })}<div><h3>What an opt-out request can do.</h3><p>Coming soon.</p></div></article>
            <article class="card resource-card">${shot("resourceTerms", { sizes: "(min-width: 1000px) 340px, 100vw" })}<div><h3>How to read a platform's AI terms.</h3><p>Coming soon.</p></div></article>
            <article class="card resource-card">${shot("resourceJudgment", { sizes: "(min-width: 1000px) 340px, 100vw" })}<div><h3>Use AI without giving up your judgment.</h3><p>Coming soon.</p></div></article>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <p class="eyebrow">The Collaborithmic Age</p>
          <h2>Expand your creativity. Keep your judgment.</h2>
          <p class="lede">By E.R. Burgess, Credtent CEO and creative technologist. Drawing on years of content valuation and two and a half years developing full-cycle AI licensing, Burgess explores how to use AI, understand the value of your work, and keep your creative skills and judgment strong.</p>
          <div class="btn-row"><a class="btn" href="${BOOK}">Explore The Collaborithmic Age</a></div>
          ${editions()}
        </div>
      </section>
      <section class="section section-white" id="who">
        <div class="wrap">
          <p class="eyebrow">Who Credtent is</p>
          <h2>Eric Burgess and Dr. Galen Buckwalter.</h2>
          <p class="lede">Eric R. Burgess is Founder and CEO. Dr. Galen Buckwalter is Co-Founder and Chief Science Officer. Credtent, Inc. is a Delaware Public Benefit Corporation and a certified B Corp.</p>
          ${bcorpBadge()}
          <div class="team" style="margin-top:24px">
            <article class="person">${picture(images.eric, { sizes: "240px" })}<h3>Eric R. Burgess</h3><p class="role">Founder and CEO</p></article>
            <article class="person">${picture(images.galen, { sizes: "240px" })}<h3>Dr. Galen Buckwalter</h3><p class="role">Co-Founder and Chief Science Officer</p></article>
          </div>
          <div class="btn-row"><a class="btn" href="https://credtent.com/about">Read About Credtent</a></div>
        </div>
      </section>`
    },
    {
      path: "/creative-consent",
      title: "Creative Consent | Credtent",
      description: "Full Protection means consent comes first. See how Credtent describes Full, Optional, and No Protection.",
      eyebrow: "Resources / Creative Consent",
      h1: "Full Protection means consent comes first.",
      capsule: CAPSULE.consent,
      lede: "Protected by default. AI training is allowed only when the creative explicitly chooses to permit it.",
      crumbs: [{ name: "Resources", href: "https://credtent.org/resources" }, { name: "Creative Consent", href: "https://credtent.org/creative-consent" }],
      faq: [
        { q: "What does Creative Consent rate?", a: CAPSULE.consent },
        { q: "Does a submission change an assessment immediately?", a: "No. Submissions are reviewed. They do not automatically change an assessment." },
        { q: "Do I need an account to read the guide?", a: "No. The guide and platform list are meant to stay open, with or without an email subscription." }
      ],
      main: `<section class="section section-tint"><div class="wrap grid-3">
        <article class="card"><img src="/brand/consent-full.svg" width="96" height="96" alt=""><h3>Full Protection</h3><p>Protected by default. AI training requires explicit opt-in. Creatives can still choose to participate.</p></article>
        <article class="card"><img src="/brand/consent-optional.svg" width="96" height="96" alt=""><h3>Optional Protection</h3><p>Protection depends on using an available, effective opt-out.</p></article>
        <article class="card"><img src="/brand/consent-none.svg" width="96" height="96" alt=""><h3>No Protection</h3><p>The assessed policy offers no effective choice to prevent that use.</p></article>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <p class="eyebrow">An assessment you can inspect</p>
        <h2>See the reason. See the source.</h2>
        <p class="lede">Each assessment makes the relevant terms, available choices, and scope easy to understand.</p>
        <div class="steps" style="margin-top:22px">
          <article class="step"><p class="kicker">01</p><h3>Policy and version</h3><p>Original terms, policy links, review date, affected region, and account scope.</p></article>
          <article class="step"><p class="kicker">02</p><h3>Available choices</h3><p>Training defaults, opt-in, opt-out, and differences between account types.</p></article>
          <article class="step"><p class="kicker">03</p><h3>Clarifications</h3><p>Company responses and published policy changes are reviewed before an assessment is updated.</p></article>
        </div>
      </div></section>
      <section class="section" id="guide-preview"><div class="wrap prose">
        <h2>View the platform list. Download the current guide.</h2>
        <p>Publicly available without an email address or account.</p>
        <div class="btn-row"><a class="btn" href="/creative-consent/platforms">View the platform list</a><a class="btn btn-ghost" href="/creative-consent/guide">Download the guide</a></div>
        <p class="small">Guide preview v03. Layout reviewed September 21, 2026. Named assessments and their policy sources are pending editorial review; no platform ratings are shown here.</p>
        <p>Creative Consent describes platform policies. Creative Origin describes a work's disclosed origin.</p>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>Represent a platform?</h2>
        <p class="lede">Help keep the record accurate. Submit a clarification, correction, or updated policy for review.</p>
        ${inquiryForm({
          subject: "Creative Consent platform clarification",
          submitLabel: "Submit for review",
          style: "margin-top:18px",
          note: "Submissions are reviewed. They do not automatically change an assessment. Sending opens an email to sales@credtent.com.",
          fields: `<label>Platform / organization <input name="platform" type="text" required></label>
          <label>Supporting policy URL <input name="policy" type="url" required></label>
          <label>Scope and requested correction <textarea name="scope" required></textarea></label>`
        })}
      </div></section>
      <section class="section"><div class="wrap">
        <h2>Get Creative Consent updates.</h2>
        <p class="lede">Choose to receive relevant policy and assessment updates. You can unsubscribe at any time.</p>
        ${inquiryForm({
          subject: "Creative Consent updates",
          submitLabel: "Subscribe to updates",
          style: "margin-top:18px",
          note: "The guide and platform list remain open whether or not you subscribe. Sending opens an email to sales@credtent.com.",
          fields: `<label>Email address <input name="email" type="email" autocomplete="email" required></label>
          <label><span><input name="consent" type="checkbox"> Yes, send me Creative Consent updates.</span></label>`
        })}
      </div></section>`
    },
    {
      path: "/creative-consent/platforms",
      title: "Creative Consent platform list | Credtent",
      description: "Named platform assessments are pending editorial review. No ratings are shown on this preview.",
      eyebrow: "Creative Consent",
      h1: "Platform list pending review.",
      capsule: "The public platform list will show the policy, the choices, and the Creative Consent label. Named assessments are not ready for this preview.",
      crumbs: [{ name: "Creative Consent", href: "https://credtent.org/creative-consent" }, { name: "Platform list", href: "https://credtent.org/creative-consent/platforms" }],
      faq: [
        { q: "Why are there no ratings?", a: "Named assessments and their policy sources are pending editorial review." }
      ],
      main: `<section class="section"><div class="wrap prose"><p>TODO(Eric): publish the reviewed platform list. Nothing on this page is a rating.</p><p><a href="/creative-consent">Back to Creative Consent</a></p></div></section>`
    },
    {
      path: "/creative-consent/guide",
      title: "Creative Consent guide preview | Credtent",
      description: "Guide preview v03. The downloadable file is not published yet.",
      eyebrow: "Creative Consent",
      h1: "Guide preview v03.",
      capsule: "The September 21, 2026 layout is the public summary. A downloadable file is still an editorial task.",
      crumbs: [{ name: "Creative Consent", href: "https://credtent.org/creative-consent" }, { name: "Guide", href: "https://credtent.org/creative-consent/guide" }],
      faq: [
        { q: "Can I download the guide?", a: "Not yet. TODO(Eric): attach the reviewed file. The on-page summary stays open without an email address." }
      ],
      main: `<section class="section"><div class="wrap prose"><p>Layout reviewed September 21, 2026. Use the three labels on the <a href="/creative-consent">Creative Consent page</a> as the preview: Full Protection, Optional Protection, and No Protection.</p></div></section>`
    },
    {
      path: "/opt-out",
      title: "Free AI training opt-out | Credtent",
      description: "Register preferences once. Credtent records the reservation and sends notices to AI companies. Free, and not a guarantee.",
      eyebrow: "Opt-out",
      h1: "Opt out of AI training. Free.",
      capsule: CAPSULE.orgHome,
      lede: "Register your work once. Credtent records your reservation and delivers the notice to AI companies. No fee to decline AI use of your work.",
      actions: `<div class="btn-row"><a class="btn" href="${OPT_OUT_FLOW}">Start your free opt-out</a></div>`,
      crumbs: [{ name: "Opt-out", href: "https://credtent.org/opt-out" }],
      faq: [
        { q: "Will every company act on the notice?", a: "No. We cannot guarantee that every company will act on your request. Sent notices are distinct from confirmed receipt or action." },
        { q: "Does this remove work from existing datasets?", a: "Registration does not automatically remove work from datasets." },
        { q: "Can I change my mind?", a: "You can update preferences later. Opting out and licensing are separate choices." }
      ],
      main: `<section class="section section-white"><div class="wrap steps">
        <article class="step"><p class="kicker">01</p><h3>Create a free account</h3><p>The opt-out account is free and stays free. There is no charge to decline AI use of your work.</p></article>
        <article class="step"><p class="kicker">02</p><h3>Register your works</h3><p>Add text, audio, video, image, or data and mark what you want in the opt-out request.</p></article>
        <article class="step"><p class="kicker">03</p><h3>Credtent sends the notice</h3><p>Credtent keeps a dated record of when each notice went out.</p></article>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>What you can count on</h2>
        <p>It is free, and the free path is not a trial. Credtent, Inc. is a Delaware Public Benefit Corporation. The record is evidence of notice, not proof that a company complied. Opt-Out Premium adds access to auditing and does not include licensing.</p>
        <p>Questions about limits live in the <a href="/resources/opt-out-limitations">opt-out limitations FAQ</a>. Companies can read <a href="https://credtent.com/ai-companies">how AI companies work with Credtent</a>.</p>
      </div></section>`
    },
    {
      path: "/premium",
      title: "Opt-Out Premium | Credtent",
      description: "Monthly audits of observable model responses. US$49 annually for individuals and US$249+ for organizations.",
      eyebrow: "Opt-Out Premium",
      h1: "Monthly audits. A clearer record.",
      capsule: "Opt-Out Premium adds monthly auditing of observable model responses for individuals. Observations are not proof of dataset inclusion or infringement.",
      actions: `<div class="btn-row"><a class="btn" href="/resources/auditing">Understand auditing</a></div>`,
      crumbs: [{ name: "Opt-Out Premium", href: "https://credtent.org/premium" }],
      extraLd: [{
        "@type": "Service",
        "@id": "https://credtent.org/premium#service",
        name: "Opt-Out Premium",
        provider: { "@id": ORG_ID },
        description: "Monthly auditing of observable model responses for individuals. Observations are not proof of dataset inclusion or infringement.",
        offers: [
          {
            "@type": "Offer",
            "@id": "https://credtent.org/premium#individuals",
            name: "Opt-Out Premium for individuals",
            price: "49",
            priceCurrency: "USD",
            description: "US$49 annually for individuals.",
            url: "https://credtent.org/premium"
          },
          {
            "@type": "Offer",
            "@id": "https://credtent.org/premium#organizations",
            name: "Opt-Out Premium for organizations",
            priceCurrency: "USD",
            description: "US$249+ annually for organizations.",
            url: "https://credtent.org/premium",
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: "249",
              priceCurrency: "USD",
              description: "US$249 or more annually for organizations."
            }
          }
        ]
      }],
      faq: [
        { q: "What does the audit prove?", a: "Nothing about dataset inclusion or infringement. It records observable model responses." },
        { q: "What does Opt-Out Premium cost?", a: "US$49 annually for individuals and US$249+ annually for organizations." }
      ],
      main: `<section class="section"><div class="wrap premium">
        <div><p>For individuals. Early member pricing. The free opt-out remains available without this add-on.</p><p><a href="${OPT_OUT_FLOW}">Get the free opt-out</a></p></div>
        <div class="price-stack"><p>${price("US$49")}</p><span class="price-meta">annually for individuals</span><p>${price("US$249+")}</p><span class="price-meta">annually for organizations</span></div>
      </div></section>`
    },
    {
      path: "/resources",
      title: "Creative resources | Credtent",
      description: "Guides for creatives on opt-out limits, platform terms, and keeping judgment when using AI.",
      eyebrow: "Resources",
      h1: "Understand more. Decide for yourself.",
      capsule: "These resources explain what an opt-out can do, how to read a platform's AI terms, and how to use AI without handing over judgment.",
      crumbs: [{ name: "Resources", href: "https://credtent.org/resources" }],
      faq: [
        { q: "Are the longer articles published?", a: "Three of them are coming soon. Auditing, opt-out limitations, and the licensing guide are available now." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><h3>Auditing</h3><p><a href="/resources/auditing">Read: how auditing works</a></p></article>
        <article class="card"><h3>Opt-out limitations</h3><p><a href="/resources/opt-out-limitations">Read: opt-out limitations</a></p></article>
        <article class="card"><h3>Guides</h3><p><a href="/guides/">Read: AI training data licensing for creatives</a></p></article>
      </div>
      </section>`
    },
    stub("/resources/what-an-opt-out-can-do", "What an opt-out request can do", "An opt-out records your preference and a notice. It does not, by itself, delete work from a dataset or force every company to comply."),
    stub("/resources/how-to-read-platform-terms", "How to read a platform's AI terms", "Look for the training default, whether opt-out is real, who it covers, and which products and regions it applies to."),
    stub("/resources/use-ai-without-giving-up-judgment", "Use AI without giving up your judgment", "Use tools on purpose. Keep the decisions, the taste, and the responsibility for the work."),
    {
      path: "/resources/auditing",
      title: "How opt-out auditing works | Credtent",
      description: "Monthly audits record observable model responses. They are not proof of dataset inclusion.",
      eyebrow: "Auditing",
      h1: "What an audit can show.",
      capsule: "Credtent audits observable model responses monthly and records the results. These observations are not proof of dataset inclusion or infringement.",
      crumbs: [{ name: "Resources", href: "https://credtent.org/resources" }, { name: "Auditing", href: "https://credtent.org/resources/auditing" }],
      faq: [
        { q: "Is an audit proof my work was in a training set?", a: "No. It is an observation of a model response, not a dataset inventory." },
        { q: "Who is it for?", a: "Individuals pay US$49 a year. Organizations pay US$249+ a year." }
      ],
      main: `<section class="section"><div class="wrap prose"><p>Auditing is optional. The free opt-out still records preferences and notices without it. Read <a href="/premium">Opt-Out Premium</a>.</p><p>Opt-Out Premium is ${price("US$49")} a year for individuals and ${price("US$249+")} a year for organizations.</p></div></section>`
    },
    {
      path: "/resources/opt-out-limitations",
      title: "Opt-out limitations | Credtent",
      description: "What Credtent's free opt-out does not do: it cannot force every company to act, and it does not erase datasets.",
      eyebrow: "FAQ",
      h1: "What an opt-out does not do.",
      capsule: CAPSULE.orgHome,
      crumbs: [{ name: "Resources", href: "https://credtent.org/resources" }, { name: "Opt-out limitations", href: "https://credtent.org/resources/opt-out-limitations" }],
      faq: [
        { q: "Does Credtent guarantee compliance?", a: "No. We cannot guarantee that every company will act on your request." },
        { q: "Does registration delete prior copies?", a: "No. Registration does not automatically remove work from datasets." },
        { q: "Are notices the same as confirmation?", a: "No. Sent notices are distinct from confirmed receipt or action." },
        { q: "Does Premium prove infringement?", a: "No. Monthly observations are not proof of dataset inclusion or infringement." }
      ],
      main: `<section class="section"><div class="wrap prose"><p>Corporate licensing questions are answered on <a href="https://credtent.com/faq">credtent.com/faq</a>.</p></div></section>`
    },
    {
      path: "/badges/",
      trailingSlash: true,
      title: "Badge systems | Credtent",
      description: "Creative Origin, Creative Consent, and Commercial Safety. Certification is about works and processes.",
      eyebrow: "Badges",
      h1: "The badge systems",
      capsule: "Three badge systems, one for each side of the rights economy. Certification looks at works and organizational processes.",
      crumbs: [{ name: "Badges", href: "https://credtent.org/badges/" }],
      faq: [
        { q: "Is a free badge a certification?", a: "No. The badge builder makes a self-declared disclosure. Expert review is a separate step." }
      ],
      main: `<section class="section section-white"><div class="wrap">
        <h2>Creative Origin</h2>
        <p class="lede">Signals the role of AI in a specific creative work, for creatives and publishers who want the audience to know how a work was made.</p>
        <div class="grid-3" style="margin-top:16px">
          <figure class="card badge-card badge-hc"><span class="certified-ribbon">Certified</span><img src="/brand/badges/creative-origin-human-composed.png" width="512" height="512" alt="Human Composed badge, HC"><figcaption><span class="badge-label">Human Composed</span><span class="badge-code">HC</span></figcaption></figure>
          <figure class="card badge-card badge-aa"><span class="certified-ribbon">Certified</span><img src="/brand/badges/creative-origin-ai-assisted.png" width="512" height="512" alt="AI-Assisted badge, AA"><figcaption><span class="badge-label">AI-Assisted</span><span class="badge-code">AA</span></figcaption></figure>
          <figure class="card badge-card badge-ag"><img src="/brand/badges/creative-origin-ai-generated.png" width="512" height="512" alt="AI-Generated badge, AG"><figcaption><span class="badge-label">AI-Generated</span><span class="badge-code">AG</span></figcaption></figure>
        </div>
        <p class="fine">Only Human Composed and AI-Assisted are offered as certified, with a corner ribbon. AI-Generated is not a certified tier.</p>
        <div class="btn-row"><a class="btn" href="/badge-builder">Build your free badge</a><a class="btn btn-ghost" href="https://credtent.com/certified-publisher">See certification</a></div>
        <h2 style="margin-top:36px">Creative Consent</h2>
        <p>How a platform treats training: Full Protection, Optional Protection, or No Protection. <a href="/creative-consent">Read Creative Consent</a>.</p>
        <h2 style="margin-top:36px">Commercial Safety</h2>
        <p>A badge for AI companies, with Full, Guardrail, and Provisional levels. Inquiry: <a href="https://credtent.com/contact#other">contact Credtent</a>.</p>
        <p class="fine">Disclosure badges are free to use. Expert-led certification is paid because review is labor. <a href="/standards">Browse the standards catalog</a>.</p>
      </div></section>`
    },
    {
      path: "/badge-builder",
      title: "Free Creative Origin badge builder | Credtent",
      description: "Make a self-declared Creative Origin badge in about a minute. It is a disclosure, not a certification.",
      eyebrow: "Free badge builder",
      h1: "Make your badge in about a minute.",
      capsule: "Pick a label, generate the badge, and download it. You do not need an account. The result is a self-declared disclosure, not a Credtent certification.",
      crumbs: [{ name: "Badge builder", href: "https://credtent.org/badge-builder" }],
      faq: [
        { q: "Is this badge certified?", a: "No. Certified review is a separate process described on the Creative Origin page." }
      ],
      main: `<section class="section"><div class="wrap">
        <div class="maker-card">
          <div>
            <p class="kicker">Step 1</p>
            <h2>Choose how your work was made</h2>
            <div class="tier-group" id="tier-group" role="radiogroup" aria-label="Choose how your work was made">
              <button class="tier-row is-selected" type="button" role="radio" aria-checked="true" data-tier="hcc"><span><span class="tier-name">Human Composed</span><span class="tier-blurb">Made by a person, without generative AI composing the work.</span></span></button>
              <button class="tier-row" type="button" role="radio" aria-checked="false" data-tier="aac"><span><span class="tier-name">AI-assisted</span><span class="tier-blurb">A person made it with help from AI tools.</span></span></button>
              <button class="tier-row" type="button" role="radio" aria-checked="false" data-tier="acc"><span><span class="tier-name">AI-Generated</span><span class="tier-blurb">Generated by AI.</span></span></button>
            </div>
          </div>
          <div>
            <p class="kicker">Step 2</p>
            <h2>Generate your badge</h2>
            <button class="generate-btn" id="generate-btn" type="button">Generate badge</button>
            <p class="small">The free path is self declared. No sign-in, no cost.</p>
          </div>
          <div id="result-step" hidden>
            <p class="kicker">Step 3</p>
            <h2>Your badge is ready</h2>
            <div class="result-grid">
              <div id="result-preview"></div>
              <div>
                <p id="result-class"></p>
                <p id="status-pill"></p>
                <a class="download-btn" id="download-svg" download="creative-origin-badge.svg">Download SVG</a>
                <a class="download-btn" id="download-png-large" download="creative-origin-badge.png">PNG Large (1000)</a>
                <a class="download-btn" id="download-png-medium" download="creative-origin-badge.png">PNG Medium (400)</a>
                <a class="download-btn" id="download-png-small" download="creative-origin-badge.png">PNG Small (200)</a>
              </div>
            </div>
          </div>
        </div>
        <p class="fine">The badge builder produces a free disclosure badge. It is not a Credtent certification. <a href="https://credtent.com/certified-publisher">Learn about certification</a>. Works in more than one format can use the <a href="https://registry.credtent.org/creative-origin">multi-format Creative Origin composer</a>.</p>
        <div class="gate-overlay" id="email-gate" role="dialog" aria-modal="true" aria-labelledby="email-gate-title">
          <div class="gate-card">
            <h2 id="email-gate-title">Before you download</h2>
            <p>Optional. Or skip straight to your download. No form is wired on this preview.</p>
            <iframe id="email-gate-frame" title="Badge builder email capture" hidden></iframe>
            <button type="button" id="email-gate-skip">Skip and download</button>
          </div>
        </div>
      </div></section>
      <script src="/badge-builder.js" defer></script>
      <script src="/badge-builder-ui.js" defer></script>`
    },
    {
      path: "/blog",
      title: "Credtent blog",
      description: "Writing on AI, creative rights, and copyright, published on Substack and Medium.",
      eyebrow: "Blog",
      h1: "The Credtent blog",
      capsule: "Credtent publishes on Medium and Substack. This page points at those pieces. It does not republish them.",
      crumbs: [{ name: "Blog", href: "https://credtent.org/blog" }],
      faq: [
        { q: "Where is the full text?", a: "On Medium or Substack, linked from each card." }
      ],
      main: `<section class="section"><div class="wrap blog-list">
        <article class="blog-card"><p class="kicker">Medium · Mar 24, 2026</p><h2>The Creative Fatalism Trap in the Age of AI</h2><p>Why treating scraping as inevitable is a weak position, and what a more deliberate move looks like.</p><p><a href="https://medium.com/credtent-on-content/the-creative-fatalism-trap-in-the-age-of-ai-e486ba739818">Read on Medium</a></p></article>
        <article class="blog-card"><p class="kicker">Medium · Mar 24, 2026</p><h2>The UK's AI Copyright Update Is Newtonian. Style Protection Requires Einstein.</h2><p><a href="https://medium.com/credtent-on-content/the-uks-ai-copyright-update-is-newtonian-style-protection-requires-einstein-512bf1cf9ab5">Read on Medium</a></p></article>
        <article class="blog-card"><p class="kicker">Medium · Dec 23, 2025</p><h2>A large copyright settlement, and the law firms recruiting writers</h2><p>The original headline names a settlement figure and a company. This preview uses a descriptive link instead.</p><p><a href="https://medium.com/credtent-on-content/anthropics-1-5b-payout-are-opt-out-law-firms-taking-writers-for-a-ride-4558db806176">Read on Medium</a></p></article>
        <article class="blog-card"><p class="kicker">Substack · Jun 24, 2025</p><h2>Human-Composed: Why AI Creation and Human Creativity Remain Fundamentally Different</h2><p><a href="https://credtent.substack.com/p/human-composed-why-ai-creation-and">Read on Credtent's Substack</a></p></article>
        <article class="blog-card"><p class="kicker">Substack · Apr 1, 2025</p><h2>Unfair Use: Denormalizing AI Theft</h2><p><a href="https://credtent.substack.com/p/unfair-use-denormalizing-ai-theft">Read on Credtent's Substack</a></p></article>
        <article class="blog-card"><p class="kicker">Substack · Mar 29, 2025</p><h2>HollywoodGPT: AI Controversy and the Oscars</h2><p><a href="https://credtent.substack.com/p/hollywoodgpt-ai-controversy-and-the-85e">Read on Credtent's Substack</a></p></article>
      </div></section>`
    },
    {
      path: "/wga",
      title: "Writers Guild of America and Credtent",
      description: "Screenplay certification reviewed and accepted by the Writers Guild of America. Member pricing on this preview is unconfirmed.",
      eyebrow: "Writers Guild of America",
      h1: "Certified Human Composed for screenwriters.",
      capsule: "The Writers Guild of America reviewed Credtent's screenplay certification process and accepted it. The badge is a record of review, not a promise about copyright registration.",
      crumbs: [{ name: "WGA", href: "https://credtent.org/wga" }],
      faq: [
        { q: "Is this called a partnership?", a: "No. The accurate public line is that the Guild reviewed the process and accepted it." },
        { q: "What does it cost?", a: "The previous public page showed a member price and a regular price. Both are unconfirmed on this preview, so the numbers are omitted until Eric confirms them." }
      ],
      main: `<section class="section section-white"><div class="wrap prose">
        <img src="/badges/human-composed-creation-badge.svg" width="160" height="160" alt="Certified Human Composed badge">
        <p>Submit a screenplay and a short authorship survey. Analysis runs in a closed environment and the work is not used for training. A professional auditor reviews the record and can issue a Certified Human Composed badge.</p>
        <p>The badge is meant for end-credit treatment and a documentation packet. It does not guarantee a copyright registration.</p>
        <p>Member and regular prices are not published on this page.</p>
        <!-- TODO(Eric): confirm WGA member and regular prices before publishing either number. -->
        <div class="btn-row"><a class="btn" href="https://registry.credtent.org/auth/sign-in?next=/script-ai-analyzer">Continue to the registry</a></div>
      </div></section>`
    },
    {
      path: "/guides/",
      trailingSlash: true,
      title: "Guides | Credtent",
      description: "Creative education on AI training data licensing, plus a pointer to the company map on credtent.com.",
      eyebrow: "Guides",
      h1: "Guides",
      capsule: "The creative guide explains how AI training data licensing works. The company map now lives on the corporate site.",
      crumbs: [{ name: "Guides", href: "https://credtent.org/guides/" }],
      faq: [
        { q: "Which guide stays here?", a: "How AI training data licensing works, for creatives and rights holders." }
      ],
      main: `<section class="section"><div class="wrap prose">
        <p><a href="/guides/ai-training-data-licensing/">Read: how AI training data licensing works</a></p>
        <p><a href="https://credtent.com/guides/ai-training-data-licensing-companies/">Read: the company map on credtent.com</a></p>
      </div></section>`
    },
    {
      path: "/guides/ai-training-data-licensing/",
      trailingSlash: true,
      title: "How AI training data licensing works | Credtent",
      description: "What a training license grants, what it does not grant, and how rights holders keep the choice to opt out.",
      eyebrow: "Guide",
      h1: "How AI training data licensing works.",
      capsule: "AI training data licensing is a written agreement in which the owner of text, images, audio, video, or data grants permission to use specific works to train a model, on defined terms.",
      crumbs: [{ name: "Guides", href: "https://credtent.org/guides/" }, { name: "AI training data licensing", href: "https://credtent.org/guides/ai-training-data-licensing/" }],
      faq: [
        { q: "Does a training license include answers and excerpts?", a: "Not automatically. Inference, grounding, and display need their own written terms." },
        { q: "Can a license fix past training for everyone?", a: "No. A covenant not to sue reaches only the rights holders who sign, and only the named works. It is not a regulator cure." }
      ],
      main: `<section class="section"><div class="wrap prose">
        <p>Updated October 2026. Published by Credtent, a Delaware Public Benefit Corporation.</p>
        <h2>What rights does a training license grant?</h2>
        <p>A training license grants permission to use named works to train or fine-tune a model, within the scope the contract states. It does not automatically cover use in AI answers, and it does not transfer copyright.</p>
        <p>A license also conveys only the rights its signatories hold. That is why a careful license comes with a manifest.</p>
        <p>Our corporate page states the boundary in these words: "Licenses include the rights the contracting holders warranted, a named manifest, and a disclosure pack your counsel can use for EU AI Act Art. 53 and CA AB 2013 filings. Those statutes still bind the developer. Indemnity, if any, is only as written in the signed license."</p>
        <h2>Who can offer a license?</h2>
        <p>Individual creatives, publishers and other catalog owners, marketplaces, and collective programs. They differ in scale and in how payment is arranged. Credtent does not publish a rate card on this preview.</p>
        <h2>What records do developers need?</h2>
        <p>Developers of general-purpose AI models in the EU must publish a sufficiently detailed summary of training content and keep a copyright policy that honors rights reservations, under Article 53 of the EU AI Act. California's AB 2013 requires developers to post training-data documentation. A developer's filings remain the developer's responsibility.</p>
        <h2>How can a rights holder participate?</h2>
        <p>Document ownership, list the works, set which uses you will accept, and approve each agreement. You can also choose the <a href="/opt-out">free opt-out</a> instead. Opt-Out Premium is ${price("US$49")} a year for individuals and ${price("US$249+")} a year for organizations. It adds auditing and does not include licensing.</p>
        <p>The company map is on <a href="https://credtent.com/guides/ai-training-data-licensing-companies/">credtent.com</a>.</p>
      </div></section>`
    },
    {
      path: "/lws",
      title: "London Writers' Salon | Credtent",
      description: "London Writers' Salon members can use Credtent's free opt-out. Member commercial terms are not confirmed on this preview.",
      eyebrow: "London Writers' Salon",
      h1: "A path for London Writers' Salon members.",
      capsule: "Members can register a free opt-out. Any member-only commercial terms are unconfirmed and are not priced on this preview.",
      crumbs: [{ name: "London Writers' Salon", href: "https://credtent.org/lws" }],
      faq: [
        { q: "Is opt-out free for members?", a: "Yes. The free opt-out is available with no charge to decline AI use." }
      ],
      main: `<section class="section"><div class="wrap prose">
        <p>This page replaces an older member offer that quoted valuation discounts. Those figures are omitted.</p>
        <div class="btn-row"><a class="btn" href="${SIGN_IN}">Sign in</a><a class="btn btn-ghost" href="/opt-out">Read about opt-out</a></div>
      </div></section>`
    },
    {
      path: "/creative-origin",
      title: "Creative Origin | Credtent",
      description: "The multi-format Creative Origin composer lives on the Credtent registry.",
      eyebrow: "Creative Origin",
      h1: "The composer lives on the registry.",
      capsule: "The multi-format Creative Origin tool is on the registry. This page only points there.",
      crumbs: [{ name: "Creative Origin", href: "https://credtent.org/creative-origin" }],
      faq: [
        { q: "Is this the free badge builder?", a: "No. The free one-label builder is on this site. The multi-format composer is on the registry." }
      ],
      main: `<section class="section"><div class="wrap prose"><p><a href="https://registry.credtent.org/creative-origin">Continue to registry.credtent.org/creative-origin</a></p></div></section>`
    },
    {
      path: "/contact",
      title: "Contact | Credtent",
      description: "Contact Credtent about opt-out, Creative Consent, and resources.",
      eyebrow: "Contact",
      h1: "Contact Credtent.",
      capsule: "Creatives can write to hello@credtent.org. Sending opens an email to sales@credtent.com.",
      crumbs: [{ name: "Contact", href: "https://credtent.org/contact" }],
      faq: [
        { q: "Which email should I use?", a: "Write to hello@credtent.org. The office is 1822 E. Route 66, Suite A353, Glendora, California 91740." }
      ],
      main: `<section class="section"><div class="wrap grid-2">
        ${inquiryForm({
          subject: "Credtent inquiry",
          submitLabel: "Send",
          note: "Sending opens an email to sales@credtent.com.",
          fields: `<label>Name <input name="name" type="text" autocomplete="name" required></label>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Message <textarea name="message" required></textarea></label>`
        })}
        <div>
          <p><a href="mailto:hello@credtent.org">hello@credtent.org</a></p>
          ${ADDRESS_HTML}
        </div>
      </div></section>`
    }
  ];
}

function stub(path, title, capsule) {
  return {
    path,
    noindex: true,
    title: `${title} | Credtent`,
    description: capsule,
    eyebrow: "Resource",
    h1: title,
    capsule,
    crumbs: [{ name: "Resources", href: "https://credtent.org/resources" }, { name: title, href: "https://credtent.org" + path }],
    faq: [
      { q: "Is this the full article?", a: "No. The full article is not published yet." }
    ],
    main: `<section class="section"><div class="wrap prose"><p>Coming soon.</p><p><a href="/resources">Back to resources</a></p></div></section>`
  };
}
