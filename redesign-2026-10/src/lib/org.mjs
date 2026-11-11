import { ADDRESS_HTML, BOOK, CAPSULE, OPT_OUT_FLOW, SIGN_IN, price } from "./copy.mjs";
import { ORG_ID, TALLY_FORM_IDS, bcorpBadge, figure, formSlot, picture } from "./render.mjs";
import { CREATIVE_SENTENCE, ORG_HERO_SIZES, STEP_ARROWS, orgHero } from "./heroes.mjs";

function editions() {
  return `<ul class="editions">
    <li><p class="kicker">E-book</p><p>${price("$9.99")}</p><p>Launch pricing through 2026 (regular $14.99). A standalone digital edition.</p></li>
    <li><p class="kicker">Paperback</p><p>${price("$19.99")}</p><p>Preorder, launch pricing through 2026 (regular $24.99). A standalone printed edition.</p></li>
    <li><p class="kicker">Living Book</p><p>${price("$49")}</p><p>The digital book with updates each quarter through 2027 and 2028.</p></li>
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
      heroBand: true,
      lede: "Tell AI companies not to train on your work. Understand how platforms use your content and make informed choices about your work.",
      actions: `<div class="btn-row"><a class="btn" href="${OPT_OUT_FLOW}">Get free opt-out</a><a class="btn btn-ghost" href="/opt-out">See how it works</a></div>`,
      // Brackett round three: the tilted-card collage hero and the creative strip (src/lib/heroes.mjs).
      heroHtml: orgHero(images, {
        eyebrow: "For creatives in the age of AI",
        capsule: CAPSULE.orgHome,
        lede: "Tell AI companies not to train on your work. Understand how platforms use your content and make informed choices about your work.",
        actions: `<a class="btn" href="${OPT_OUT_FLOW}">Get free opt-out</a><a class="btn btn-ghost" href="/opt-out">See how it works</a>`
      }),
      preload: preload("editor", ORG_HERO_SIZES),
      faq: [
        { q: "What does the free opt-out do?", a: CAPSULE.orgHome },
        { q: "Does registration remove work from datasets?", a: "No. Registration does not automatically remove work from datasets. Credtent records preferences and the notices it sends." },
        { q: "What is Opt-Out Premium?", a: "Opt-Out Premium for rights holders enrolls their works in Credtent's periodic AI model audits, from US$299 a year. Individual creatives get the same audits with licensing, at US$49 a year for sign-ups through December 31, 2026. Audit results are not proof of dataset inclusion." }
      ],
      main: `<section class="section">
        <div class="wrap">
          <p class="eyebrow">For the work you make</p>
          <h2>Whatever you create, your choices matter.</h2>
          <p>${CREATIVE_SENTENCE}</p>
          <p class="lede">Practical tools and resources to help you protect your creative work and understand your choices in the age of AI.</p>
          <div class="photo-band">
            <figure>${shot("writer", { sizes: "(min-width: 1000px) 50vw, 100vw" }).replace(/^<figure class="shot">|<\/figure>/g, "")}<figcaption>For the words you write.</figcaption></figure>
            <figure>${shot("filmmaker", { sizes: "(min-width: 1000px) 50vw, 100vw" }).replace(/^<figure class="shot">|<\/figure>/g, "")}<figcaption>For the stories you bring to life.</figcaption></figure>
          </div>
          <hr class="rule">
          <div class="facts">
            <article class="fact"><p class="kicker">Free</p><h3>Opt-out registration</h3><p>Tell AI companies not to train on the work you identify.</p></article>
            <article class="fact"><p class="kicker">Quarterly</p><h3>Opt-out list distribution</h3><p>Credtent sends the list on a quarterly cadence.</p></article>
            <article class="fact"><p class="kicker">Optional</p><h3>Periodic AI model audits</h3><p>Audit enrollment comes with every paid plan.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">A documented history</p>
          <h2>How your opt-out works</h2>
          <p class="lede">Credtent records your opt-out preferences and the notices we send to AI companies, building a documented history over time. We cannot guarantee that every company will act on your request.</p>
          <div class="steps" style="margin-top:24px">${STEP_ARROWS}
            <article class="step"><p class="kicker">01</p><h3>Register your preferences</h3><p>Identify the work you want included in your opt-out request.</p></article>
            <article class="step"><p class="kicker">02</p><h3>We send your request</h3><p>Credtent distributes the opt-out list to AI companies each quarter. Sent notices are distinct from confirmed receipt or action.</p></article>
            <article class="step"><p class="kicker">03</p><h3>Choose additional support</h3><p>Add a paid plan, and Credtent enrolls your works in its periodic AI model audits.</p></article>
          </div>
          <p class="fine">Registration does not automatically remove work from datasets.</p>
        </div>
      </section>
      <section class="section" id="premium">
        <div class="wrap premium">
          <div>
            <p class="eyebrow">Periodic AI model audits</p>
            <h2>Enroll your works in periodic AI model audits.</h2>
            <p class="lede">The two plans priced here, like every other paid plan, include that enrollment, and Credtent records the results. Audit results are not proof of dataset inclusion or infringement.</p>
            <div class="btn-row"><a class="btn" href="/resources/auditing">Understand auditing</a></div>
          </div>
          <div class="price-stack">
            <p class="price-meta">Licensing for individuals</p>
            <p>${price("US$49")} (promo)</p>
            <span class="price-meta">a year, with licensing, for sign-ups through December 31, 2026</span>
            <p class="price-meta">Opt-Out Premium for rights holders</p>
            <p>from ${price("US$299")}</p>
            <span class="price-meta">a year, scaling with catalog size</span>
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
            <article class="card resource-card">${shot("resourceOptout", { sizes: "(min-width: 1000px) 340px, 100vw" })}<div><h3>What an opt-out request can do.</h3></div></article>
            <article class="card resource-card">${shot("resourceTerms", { sizes: "(min-width: 1000px) 340px, 100vw" })}<div><h3>How to read a platform's AI terms.</h3></div></article>
            <article class="card resource-card">${shot("resourceJudgment", { sizes: "(min-width: 1000px) 340px, 100vw" })}<div><h3>Use AI without giving up your judgment.</h3></div></article>
          </div>
        </div>
      </section>
      <section class="book-banner" aria-label="New book"><div class="wrap"><p><a href="https://credtent.com/about#collaborithmic-age">Now available as an e-book: <cite>The Collaborithmic Age</cite>, written by Credtent CEO E.R. Burgess.</a></p></div></section>
      <section class="section section-white" id="who">
        <div class="wrap">
          <p class="eyebrow">Who Credtent is</p>
          <h2>E.R. Burgess and Dr. Galen Buckwalter.</h2>
          <div class="prose who-bio"><p>Credtent connects AI companies and the creative industries through licensing, so AI solutions are ethical and commercially safe.</p>
<p>E.R. Burgess founded Credtent after more than eight years of research into creative rights and data provenance, well before the public AI debate grew loud. He started from the idea that AI and human creativity can work together, ethically, legally, and profitably, when the people who make the work are paid and their consent is on record.</p>
<p>E.R. Burgess brings over 30 years of industry experience. He is also a published tabletop game designer, with card, board, and role-playing games to his name. He leads Credtent as Founder and CEO, alongside Co-Founder and Chief Science Officer Dr. Galen Buckwalter.</p>
<p>Our mission is to bring AI and creativity together ethically, legally, and profitably. Credtent, Inc. is a Delaware Public Benefit Corporation and a Certified B Corp. Its charter names protecting creators of original works in the AI marketplace as a public benefit.</p></div>
          ${bcorpBadge()}
          <div class="team" style="margin-top:24px">
            <article class="person">${picture(images.eric, { sizes: "240px" })}<h3>E.R. Burgess</h3><p class="role">Founder and CEO</p></article>
            <article class="person">${picture(images.galen, { sizes: "240px" })}<h3>Dr. Galen Buckwalter</h3><p class="role">Co-Founder and Chief Science Officer</p></article>
          </div>
          <div class="btn-row"><a class="btn" href="https://credtent.com/about">Read About Credtent</a></div>
        </div>
      </section>`
    },
    {
      path: "/creative-consent",
      noindex: true,
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
        { q: "Where are the guide and the platform list?", a: "The platform list and the guide are in preparation. Subscribe to Creative Consent updates to hear when they are published." }
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
        <p>The platform list and the guide are in preparation. Subscribe below to hear when they are published.</p>
        <p>Creative Consent describes platform policies. Creative Origin describes a work's disclosed origin.</p>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>Represent a platform?</h2>
        <p class="lede">Help keep the record accurate. Submit a clarification, correction, or updated policy for review.</p>
        ${formSlot({
          id: TALLY_FORM_IDS.consentClarification,
          title: "Creative Consent platform clarification",
          subject: "Creative Consent platform clarification",
          submitLabel: "Submit for review",
          style: "margin-top:18px",
          note: "Submissions are reviewed. They do not automatically change an assessment. Sending opens an email to hello@credtent.org.",
          fields: `<label>Platform / organization <input name="platform" type="text" required></label>
          <label>Supporting policy URL <input name="policy" type="url" required></label>
          <label>Scope and requested correction <textarea name="scope" required></textarea></label>`
        })}
      </div></section>
      <section class="section"><div class="wrap">
        <h2>Get Creative Consent updates.</h2>
        <p class="lede">Choose to receive relevant policy and assessment updates. You can unsubscribe at any time.</p>
        ${formSlot({
          id: TALLY_FORM_IDS.consentUpdates,
          title: "Creative Consent updates",
          subject: "Creative Consent updates",
          submitLabel: "Subscribe to updates",
          style: "margin-top:18px",
          note: "Sending opens an email to hello@credtent.org.",
          fields: `<label>Email address <input name="email" type="email" autocomplete="email" required></label>
          <label><span><input name="consent" type="checkbox"> Yes, send me Creative Consent updates.</span></label>`
        })}
      </div></section>`
    },
    {
      path: "/creative-consent/platforms",
      noindex: true,
      title: "Creative Consent platform list | Credtent",
      description: "The Creative Consent platform list: each platform's AI policy, the choices it offers, and its Creative Consent label.",
      eyebrow: "Creative Consent",
      h1: "Creative Consent platform list.",
      capsule: "The platform list shows each platform's policy, the choices it offers, and its Creative Consent label.",
      crumbs: [{ name: "Creative Consent", href: "https://credtent.org/creative-consent" }, { name: "Platform list", href: "https://credtent.org/creative-consent/platforms" }],
      faq: [],
      main: `<section class="section"><div class="wrap prose"><p><a href="/creative-consent">Back to Creative Consent</a></p></div></section>`
    },
    {
      path: "/creative-consent/guide",
      noindex: true,
      title: "Creative Consent guide | Credtent",
      description: "The Creative Consent guide: Full Protection, Optional Protection, and No Protection.",
      eyebrow: "Creative Consent",
      h1: "Creative Consent guide.",
      capsule: "Creative Consent uses three labels: Full Protection, Optional Protection, and No Protection.",
      crumbs: [{ name: "Creative Consent", href: "https://credtent.org/creative-consent" }, { name: "Guide", href: "https://credtent.org/creative-consent/guide" }],
      faq: [],
      main: `<section class="section"><div class="wrap prose"><p>The three labels, Full Protection, Optional Protection, and No Protection, are explained on the <a href="/creative-consent">Creative Consent page</a>.</p></div></section>`
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
      main: `<section class="section section-white"><div class="wrap">
        <p class="eyebrow">What the opt-out is</p>
        <h2>One registration, one notice to the industry.</h2>
        <p class="lede">When you register works with Credtent and choose opt-out, Credtent records your reservation of rights and delivers the notice to AI companies, with a dated record of when it went out. Instead of relying on each platform's separate setting, you set your preference once.</p>
        <div class="steps" style="margin-top:24px">
          <article class="step"><p class="kicker">01</p><h3>Create a free account</h3><p>Create a free Credtent account.</p></article>
          <article class="step"><p class="kicker">02</p><h3>Register your works</h3><p>Add text, audio, video, image, or data to the registry and mark them opted out. One registration covers every AI company Credtent notifies.</p></article>
          <article class="step"><p class="kicker">03</p><h3>Credtent sends the notice</h3><p>Credtent records your reservation and delivers the notice to AI companies, with a dated record of each delivery.</p></article>
        </div>
        <div class="btn-row"><a class="btn" href="${OPT_OUT_FLOW}">Start your free opt-out</a></div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>What you can count on</h2>
        <h3>It is free.</h3>
        <p>Registering a work for the opt-out costs nothing, and the opt-out is not a trial. Every paid plan keeps the same opt-out and adds enrollment in periodic AI model audits. Credtent does not plan to charge for the free opt-out.</p>
        <h3>You can change your mind.</h3>
        <p>You can update your preferences at any time to enable licensing, with no retroactive fees and no penalties. A work that is opted out can be made licensable later, and a licensable work can go back to opt-out.</p>
        <h3>It is recorded and dated.</h3>
        <p>Credtent keeps a dated record of when each notice went out. If your work is used anyway, you can point to that record as evidence that the notice was sent, though it does not confirm that a company received the notice or acted on it.</p>
        <h3>It can become an income stream.</h3>
        <p>The same registry that records your opt-out can license your work on your terms if you ever choose to opt in.</p>
        <p>Questions about limits live in the <a href="/resources/opt-out-limitations">opt-out limitations FAQ</a>.</p>
      </div></section>
      <section class="section section-white"><div class="wrap prose">
        <p class="eyebrow">For AI companies</p>
        <h2>For AI companies: honoring opt-outs.</h2>
        <p>Credtent keeps a dated record of each opt-out notice it sends, and companies that honor those notices can show that they did.</p>
        <p><a href="https://credtent.com/ai-companies">How AI companies work with Credtent</a></p>
      </div></section>`
    },
    {
      path: "/premium",
      title: "Opt-Out Premium | Credtent",
      description: "Opt-Out Premium for rights holders enrolls their works in Credtent's periodic AI model audits, from US$299 a year.",
      eyebrow: "Opt-Out Premium",
      h1: "Enroll your works in periodic AI model audits.",
      capsule: "Opt-Out Premium for rights holders, from US$299 a year, enrolls their works in Credtent's periodic AI model audits but does not include licensing. Audit results are not proof of dataset inclusion or infringement.",
      actions: `<div class="btn-row"><a class="btn" href="/resources/auditing">Understand auditing</a></div>`,
      crumbs: [{ name: "Opt-Out Premium", href: "https://credtent.org/premium" }],
      extraLd: [{
        "@type": "Service",
        "@id": "https://credtent.org/premium#service",
        name: "Opt-Out Premium",
        provider: { "@id": ORG_ID },
        description: "Enrollment of rights holders' works in Credtent's periodic AI model audits. Audit results are not proof of dataset inclusion or infringement.",
        offers: [
          {
            "@type": "Offer",
            "@id": "https://credtent.org/premium#rights-holders",
            name: "Opt-Out Premium for rights holders",
            priceCurrency: "USD",
            description: "From US$299 a year for rights holders, scaling with catalog size.",
            url: "https://credtent.org/premium",
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: "299",
              priceCurrency: "USD",
              description: "US$299 or more a year for rights holders, scaling with catalog size."
            }
          }
        ]
      }],
      faq: [
        { q: "What does an audit prove?", a: "An audit records how AI models respond, and its results are not proof of dataset inclusion or infringement." },
        { q: "What does Opt-Out Premium cost?", a: "Opt-Out Premium starts at US$299 a year for rights holders and scales with catalog size." },
        { q: "Can individual creatives get audits?", a: "Yes. Licensing for individual creatives is US$49 a year for sign-ups through December 31, 2026, and it includes the opt-out and enrolls their works in Credtent's periodic AI model audits." }
      ],
      main: `<section class="section"><div class="wrap premium">
        <div><p>Opt-Out Premium is for rights holders. Individual creatives get audit enrollment with licensing, at US$49 a year for sign-ups through December 31, 2026; see the <a href="https://credtent.com/pricing">pricing page</a>. The free opt-out remains available without either.</p><p><a href="${OPT_OUT_FLOW}">Get the free opt-out</a></p></div>
        <div class="price-stack"><p>${price("US$299+")}</p><span class="price-meta">annually for rights holders, scaling with catalog size</span></div>
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
      faq: [],
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
      description: "Every paid plan enrolls works in Credtent's periodic AI model audits. Audit results are not proof of dataset inclusion.",
      eyebrow: "Auditing",
      h1: "What an audit can show.",
      capsule: "Opt-Out Premium for rights holders enrolls their works in Credtent's periodic AI model audits, and Credtent records the results. Audit results are not proof of dataset inclusion or infringement.",
      crumbs: [{ name: "Resources", href: "https://credtent.org/resources" }, { name: "Auditing", href: "https://credtent.org/resources/auditing" }],
      faq: [
        { q: "Is an audit proof my work was in a training set?", a: "No. It is an observation of a model response, not a dataset inventory." },
        { q: "Who is it for?", a: "It comes with every paid plan, and the free opt-out does not include it." }
      ],
      main: `<section class="section"><div class="wrap prose"><p>Auditing is optional. The free opt-out still records preferences and notices without it. Read <a href="/premium">Opt-Out Premium</a>.</p><p>Opt-Out Premium for rights holders starts at ${price("US$299")} a year. Individual creatives get audits with licensing, at ${price("US$49")} a year for sign-ups through December 31, 2026.</p></div></section>`
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
        { q: "Does Premium prove infringement?", a: "No. Audit results are not proof of dataset inclusion or infringement." }
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
      capsule: "Three badge systems: one for creative work, one for platforms, and one for AI companies. Certification looks at works and organizational processes.",
      crumbs: [{ name: "Badges", href: "https://credtent.org/badges/" }],
      faq: [],
      main: `<section class="section section-white"><div class="wrap">
        <p class="eyebrow">For creatives and publishers</p>
        <h2>Creative Origin</h2>
        <p class="lede">Creative Origin signals the role of AI in a specific creative work, for creatives and publishers who want the audience to know how a work was made, from a fully human-composed novel to an AI-generated image, with the middle ground disclosed honestly.</p>
        <div class="grid-3" style="margin-top:16px">
          <figure class="card badge-card badge-hc"><span class="certified-ribbon">Certified</span><img src="/brand/badges/creative-origin-human-composed.png" width="512" height="512" alt="Human Composed badge, HC"><figcaption><span class="badge-label">Human Composed</span><span class="badge-code">HC</span></figcaption></figure>
          <figure class="card badge-card badge-aa"><span class="certified-ribbon">Certified</span><img src="/brand/badges/creative-origin-ai-assisted.png" width="512" height="512" alt="AI-Assisted badge, AA"><figcaption><span class="badge-label">AI-Assisted</span><span class="badge-code">AA</span></figcaption></figure>
          <figure class="card badge-card badge-ag"><img src="/brand/badges/creative-origin-ai-generated.png" width="512" height="512" alt="AI-Generated badge, AG"><figcaption><span class="badge-label">AI-Generated</span><span class="badge-code">AG</span></figcaption></figure>
        </div>
        <ul style="margin-top:16px">
          <li><strong>Human Composed:</strong> the work was composed by a person, without generative AI composing it.</li>
          <li><strong>AI-Assisted:</strong> a person made the work with help from AI tools.</li>
          <li><strong>AI-Generated:</strong> the work was generated by AI.</li>
          <li><strong>Legacy Creation:</strong> the work was made before November 2022, predating generative AI tools.</li>
        </ul>
        <p class="fine">Only Human Composed and AI-Assisted are offered as certified, with a corner ribbon. AI-Generated is not a certified tier.</p>
        <p>There are two ways to display it: a free self-declared disclosure badge you make yourself, or a paid, expert-reviewed certified badge with a registry record. A free badge is a disclosure, not a certification.</p>
        <div class="btn-row"><a class="btn" href="/badge-builder">Build your free badge</a><a class="btn btn-ghost" href="https://credtent.com/certified-publisher">Get the certified seal</a></div>
        <p class="small">Working in more than one format? The <a href="/creative-origin">multi-format Creative Origin composer</a> builds a combined origin bar for works that mix text, art, music, code, video, and voices. It is an earlier generation of the badge tool and shows the earlier badge designs.</p>
        <p class="eyebrow" style="margin-top:36px">For platforms</p>
        <h2>Creative Consent</h2>
        <p>Creative Consent rates how a platform treats creatives' data, content, and metadata, and whether it respects their choices about AI training.</p>
        <ul>
          <li><strong>Full Protection:</strong> protected by default. AI training requires explicit opt-in. Creatives can still choose to participate.</li>
          <li><strong>Optional Protection:</strong> protection depends on using an available, effective opt-out.</li>
          <li><strong>No Protection:</strong> the assessed policy offers no effective choice to prevent that use.</li>
        </ul>
        <p><a href="/creative-consent">Read Creative Consent</a></p>
        <p class="eyebrow" style="margin-top:36px">For AI companies</p>
        <h2>Commercial Safety</h2>
        <p>A badge for AI companies, with Full, Guardrail, and Provisional levels. Inquiry: <a href="https://credtent.com/contact#other">contact Credtent</a>.</p>
        <p class="fine">Disclosure badges are free to use. Expert-led certification is paid because expert review is real labor.</p>
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
      faq: [],
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
            <p>This step is optional, and you can skip straight to your download.</p>
            <iframe id="email-gate-frame" title="Badge builder email capture" hidden></iframe>
            <button type="button" id="email-gate-skip">Skip and download</button>
          </div>
        </div>
      </div></section>
      <script src="/badge-builder.js" defer></script>
      <script src="/badge-builder-ui.js" defer></script>
      <section class="section section-tight"><div class="wrap prose"><p class="fine">This badge is a self-declared disclosure, not a certification. Certified review is a separate process described on the Creative Origin page.</p></div></section>`
    },
    {
      path: "/blog",
      title: "Credtent blog",
      description: "Writing on AI, creative rights, and copyright, published on Substack and Medium.",
      eyebrow: "Blog",
      h1: "The Credtent blog",
      capsule: "Credtent publishes on Medium and Substack. This page points at those pieces. It does not republish them.",
      crumbs: [{ name: "Blog", href: "https://credtent.org/blog" }],
      faq: [],
      main: `<section class="section"><div class="wrap blog-list">
        <article class="blog-card"><p class="kicker">Medium · Mar 24, 2026</p><h2>The Creative Fatalism Trap in the Age of AI</h2><p>Why treating scraping as inevitable is a weak position, and what a more deliberate move looks like.</p><p><a href="https://medium.com/credtent-on-content/the-creative-fatalism-trap-in-the-age-of-ai-e486ba739818">Read on Medium</a></p></article>
        <article class="blog-card"><p class="kicker">Medium · Mar 24, 2026</p><h2>The UK's AI Copyright Update Is Newtonian. Style Protection Requires Einstein.</h2><p><a href="https://medium.com/credtent-on-content/the-uks-ai-copyright-update-is-newtonian-style-protection-requires-einstein-512bf1cf9ab5">Read on Medium</a></p></article>
        <article class="blog-card"><p class="kicker">Medium · Dec 23, 2025</p><h2>A large copyright settlement, and the law firms recruiting writers</h2><p>This card uses a descriptive title in place of the article's original headline.</p><p><a href="https://medium.com/credtent-on-content/anthropics-1-5b-payout-are-opt-out-law-firms-taking-writers-for-a-ride-4558db806176">Read on Medium</a></p></article>
        <article class="blog-card"><p class="kicker">Substack · Jun 24, 2025</p><h2>Human-Composed: Why AI Creation and Human Creativity Remain Fundamentally Different</h2><p><a href="https://credtent.substack.com/p/human-composed-why-ai-creation-and">Read on Credtent's Substack</a></p></article>
        <article class="blog-card"><p class="kicker">Substack · Apr 1, 2025</p><h2>Unfair Use: Denormalizing AI Theft</h2><p><a href="https://credtent.substack.com/p/unfair-use-denormalizing-ai-theft">Read on Credtent's Substack</a></p></article>
        <article class="blog-card"><p class="kicker">Substack · Mar 29, 2025</p><h2>HollywoodGPT: AI Controversy and the Oscars</h2><p><a href="https://credtent.substack.com/p/hollywoodgpt-ai-controversy-and-the-85e">Read on Credtent's Substack</a></p></article>
      </div></section>`
    },
    {
      path: "/wga",
      title: "Screenplay certification and the WGA West member offer",
      description: "Credtent's screenplay certification process was reviewed by the Writers Guild of America and accepted. Certification is US$300 per screenplay, with 50% off for WGA West members who register through the WGA.",
      eyebrow: "Writers Guild of America",
      h1: "Certified Human Composed for screenwriters.",
      capsule: "The Writers Guild of America reviewed Credtent's screenplay certification process and accepted it. The badge is a record of review, not a promise about copyright registration.",
      crumbs: [{ name: "WGA", href: "https://credtent.org/wga" }],
      faq: [
        { q: "What is Credtent's relationship with the WGA?", a: "The WGA reviewed Credtent's screenplay certification process and it has been accepted. Members of the Writers Guild of America West who register through the WGA currently receive 50% off." },
        { q: "What does it cost?", a: "Certification is US$300 per screenplay, and members of the Writers Guild of America West who register through the WGA currently receive 50% off. Each certification includes review by a professional auditor, a badge and credit line you may ask a production to include, and free Creative Origin badge access." },
        { q: "Is my screenplay used for AI training?", a: "No. Credtent does not use your screenplay to train AI models." }
      ],
      main: `<section class="section section-white"><div class="wrap split">
        <div class="prose">
          <img src="/badges/human-composed-creation-badge.svg" width="160" height="160" alt="Certified Human Composed badge">
          <h2>A certification service for screenwriters.</h2>
          <p>Credtent's certification process reviews your authorship record and issues a Certified Human Composed badge when the work meets the Human Composed standard. It gives you a documented record of how the work was made, and it does not change your legal rights. Production companies and studios need assurance that screenplays are human-authored to avoid copyright and IP risk.</p>
          <p class="price-stack"><span class="price">US$300</span> <span class="price-meta">per screenplay, with 50% off for WGA West members who register through the WGA.</span></p>
        </div>
        <ul class="check-list">
          <li>A time-stamped record of your drafts, process, and Credtent's review, which you can keep with your files and give to counsel. It does not guarantee a copyright registration or any legal outcome.</li>
          <li>Industry credibility as AI-authored work spreads</li>
          <li>Free access to the Creative Origin badge system</li>
          <li>Review by a professional auditor</li>
          <li>Credtent does not use your screenplay to train AI models.</li>
        </ul>
      </div></section>
      <section class="section"><div class="wrap">
        <h2>How does certification work?</h2>
        <p class="lede">Three steps lead to a Certified Human Composed badge, and the process is built to fit a screenwriter's schedule.</p>
        <div class="steps" style="margin-top:20px">
          <article class="step"><p class="kicker">01</p><h3>Submit and survey</h3><p>Upload your screenplay and complete a short authorship survey covering your process, drafts, and tools.</p></article>
          <article class="step"><p class="kicker">02</p><h3>Secure analysis</h3><p>An AI-detection analysis informs the review. A professional auditor makes the decision. Credtent does not use your screenplay to train AI models.</p></article>
          <article class="step"><p class="kicker">03</p><h3>Expert review</h3><p>A professional auditor reviews the analysis and authorship record, then issues your Certified Human Composed badge.</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>Show that your script was written by a person.</h2>
        <p class="lede">Studios, producers, and audiences are starting to ask which scripts were written by people. The certified badge makes the answer clear, and pairs it with a badge and credit line you may ask a production to include, and an authorship record.</p>
        <div class="grid-2" style="margin-top:20px">
          <article class="card"><h3>Credit line</h3><p>A badge and credit line you may ask a production to include.</p></article>
          <article class="card"><h3>Authorship record</h3><p>A time-stamped record of your drafts, process, and Credtent's review, which you can keep with your files and give to counsel. It does not guarantee a copyright registration or any legal outcome.</p></article>
          <article class="card"><h3>Creative Origin badge</h3><p>Free access to Credtent's badge system, which travels with your work across the web.</p></article>
          <article class="card"><h3>An audit-ready record</h3><p>Every certification produces a documentation packet you can hand to studios, agents, or counsel.</p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>WGA West member offer: 50% off.</h2>
        <p>The Writers Guild of America reviewed Credtent's screenplay certification process and accepted it. Certification is US$300 per screenplay, and members of the Writers Guild of America West who register through the WGA currently receive 50% off.</p>
        <div class="btn-row"><a class="btn" href="https://registry.credtent.org/auth/sign-in?next=/script-ai-analyzer">Continue to the registry</a></div>
        <p class="small">Questions? Write to <a href="mailto:hello@credtent.org">hello@credtent.org</a>.</p>
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
      faq: [],
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
        { q: "Can a license fix past training for everyone?", a: "No. We can structure a going-forward license and a covenant not to sue over past use from the rights holders who sign, limited to the named works. Neither one binds a rights holder who did not sign, and neither one satisfies the developer's regulatory obligations." }
      ],
      main: `<section class="section"><div class="wrap prose">
        <p>Updated October 2026. Published by Credtent, a Delaware Public Benefit Corporation.</p>
        <p>Questions about AI training data licensing reach us from both sides of the table: creatives and rights holders register their works with us for opt-out, licensing, or both, and AI companies come to us to license named collections of that work. This guide answers the questions rights holders bring to us.</p>
        <h2>What is AI training data licensing?</h2>
        <p>It is a written agreement in which the owner of text, images, audio, video, or data grants an AI developer permission to use specific works to train a model, in exchange for payment and on defined terms. The license names the works, the permitted uses, the duration, and the documentation the developer receives.</p>
        <p>Every training license has two parties with different worries. The developer wants to know that the people granting permission had the right to grant it, and that the paperwork will hold up when a regulator or a court asks where the training data came from. The rights holder wants to know what the work will be used for, who else can use it, and how payment reaches the people who made it.</p>
        <p>In the European Union, the text and data mining exception in Article 4 of Directive (EU) 2019/790 applies only where rights holders have not expressly reserved their rights, and for content published online that reservation can be made by machine-readable means. Once a rights holder has reserved those rights, a developer who still wants the work needs permission, and a license is how permission is given.</p>
        <h2>What rights does a training license grant?</h2>
        <p>A training license grants permission to use named works to train or fine-tune a model, within the scope the contract states. It does not automatically cover inference or grounding, where content is retrieved to answer a user's question, and it does not transfer copyright. Those uses, and any indemnity, need their own written terms.</p>
        <p>The difference matters because some programs now license them separately. Microsoft's Publisher Content Marketplace, announced on February 3, 2026, is built for grounding: in Microsoft's description, publishers set licensing and usage terms while AI builders license content for specific grounding scenarios. A training license and a grounding license can cover the same article and still be two different contracts.</p>
        <p>A license also conveys only the rights its signatories hold. A book can carry rights held by an author, a publisher, an illustrator, and a translator, and a license signed by one of them does not bind the others. That is why a careful license comes with a manifest, a list of exactly which works are covered, and with records showing who warranted which rights.</p>
        <p>Our corporate page states the boundary in these words: "Licenses include the rights the contracting holders warranted, a named manifest, and a disclosure pack your counsel can use for EU AI Act Art. 53 and CA AB 2013 filings. Those statutes still bind the developer. Indemnity, if any, is only as written in the signed license."</p>
        <h2>Who can offer a license?</h2>
        <p>Licenses come from four kinds of sellers: individual creatives, publishers and other rights holders who own catalogs, aggregators and marketplaces that gather content from many owners, and collective or platform-run programs that offer one set of terms to many participants. They differ in scale, documentation, and how payment reaches the people who made the work.</p>
        <p>Individual creatives can license their own work directly or reach AI buyers through an agent, a marketplace, or a collective program. Publishers, studios, labels, archives, and data providers can license a catalog directly; their main questions are which rights they hold for each work and how much control they keep after signing. Aggregators and marketplaces either take a license from each owner and resell it, or act as an agent and route payment back to the owners. Collective programs offer standard terms to many participants at once: Copyright Clearance Center, for example, offers an AI Systems Training License to organizations training AI systems for external uses.</p>
        <p>The neutral company map is on <a href="https://credtent.com/guides/ai-training-data-licensing-companies/">credtent.com</a>.</p>
        <h2>How are licenses priced?</h2>
        <p>Four structures are common: a flat fee for a defined collection, a per-work or per-unit rate, a revenue share between seller and rights holders, and usage-based fees tied to how often content is accessed. The price depends on exclusivity, quality, documentation, the rights layers involved, and the license term.</p>
        <p>Credtent does not publish a rate card for AI companies. On the rights-holder side our structure is a revenue share: under its standard terms, Credtent routes 85% of each licensing deal to the rights holders and data providers whose content was licensed and keeps 15% for the platform, legal work, compliance tools, and operations. The Terms of Service list the costs and taxes deducted before payment.</p>
        <p>Usage-based pricing appears in access and grounding programs. Cloudflare's pay per crawl, which its own page describes as a private beta feature of AI Crawl Control, lets publishers charge AI crawlers for access.</p>
        <h2>What records do developers need?</h2>
        <p>Developers of general-purpose AI models in the EU must publish a sufficiently detailed summary of training content and keep a copyright policy that honors rights reservations, under Article 53 of the EU AI Act. Under Article 113, those obligations apply from 2 August 2025. California's AB 2013 (Chapter 817, approved September 28, 2024) requires developers to post training-data documentation, including the sources or owners of the datasets and whether they were purchased or licensed.</p>
        <p>A developer's filings remain the developer's responsibility. A good license improves the evidence available to the people who write them: a manifest of named works, a record of who warranted which rights, and dates for when the content was delivered.</p>
        <h2>Can a license cover content a model already trained on?</h2>
        <p>A deal can address past training only for the rights holders who sign it. Credtent states the limit in these words: "We can structure a going-forward license and a covenant not to sue over past use from the rights holders who sign, limited to the named works. Neither one binds a rights holder who did not sign, and neither one satisfies the developer's regulatory obligations." Rights holders who did not sign keep every claim they had.</p>
        <h2>How can a rights holder participate?</h2>
        <p>Document ownership, list the works, set which uses and buyers you will accept, and set the terms Credtent licenses within. With Credtent, you submit catalog metadata, ownership documentation, and your licensing terms; we verify ownership and tag the content so AI buyers can find it; and royalties are paid quarterly with usage reports. Listing transfers no copyright, and the license you grant Credtent is non-exclusive unless you agree otherwise in writing. You can end our representation at any time. Details are on <a href="https://credtent.com/content-owners">credtent.com/content-owners</a>.</p>
        <p>You can also choose the <a href="/opt-out">free opt-out</a> instead. Opt-Out Premium for rights holders, from <span class="price">US$299</span> a year, enrolls their works in Credtent's periodic AI model audits and does not include licensing. Licensing for individual creatives is US$49 a year for sign-ups through December 31, 2026, and it includes the same audit enrollment. From 2027, new individual sign-ups pay US$99 a year, and creatives who sign up during the promotion keep US$49 a year through 2028 while the subscription stays active. After 2028, and for anyone who rejoins after a lapse or cancellation, the regular price applies. Rights-Holder Licensing, for publishers and others who represent many creatives, starts at $299 a year. Full terms are on the <a href="https://credtent.com/pricing">pricing page</a>.</p>
        <p>Opting out and licensing are not permanent choices. A work registered for opt-out can be made licensable later, and a licensable work can be withdrawn to opt-out, with no retroactive fees.</p>
      </div></section>`
    },
    {
      path: "/lws",
      // Out of the sitemap and noindex until Cherryh clears the member page (legal hold review).
      noindex: true,
      title: "London Writers' Salon | Credtent",
      description: "London Writers' Salon members get two years for the price of one on a paid registry account, and a free opt-out any time.",
      eyebrow: "London Writers' Salon",
      h1: "A path for London Writers' Salon members.",
      capsule: "London Writers' Salon members can register a free opt-out any time, and get two years for the price of one on a paid Independent Creative Registry account with code LWSALON25.",
      crumbs: [{ name: "London Writers' Salon", href: "https://credtent.org/lws" }],
      faq: [
        { q: "Is opt-out free for members?", a: "Yes. The free opt-out is available with no charge to decline AI use." },
        { q: "What is the member offer?", a: "Two years of a paid Independent Creative Registry account for the price of one, renewable for the life of your LWS membership, with code LWSALON25 at checkout." }
      ],
      main: `<section class="section section-white"><div class="wrap split">
        <div class="prose">
          <h2>License your writing for AI use, or record an opt-out.</h2>
          <p>LWS members get member access to Credtent's Independent Creative Registry. Choose whether to license your work for AI use or to record an opt-out.</p>
        </div>
        <ul class="check-list">
          <li>Two years of a paid registry account for the price of one, renewable</li>
          <li>Certification at LWS member rates</li>
          <li>A free opt-out account, with no charge to decline AI use</li>
          <li>Revenue share on certification services</li>
          <li>Priority support from the Credtent partnerships team</li>
        </ul>
      </div></section>
      <section class="section"><div class="wrap">
        <h2>Negotiated for the LWS community.</h2>
        <p class="lede">Register a free opt-out account any time, with no obligation.</p>
        <div class="grid-3" style="margin-top:20px">
          <article class="card"><p class="kicker">01</p><h3>Two years for the price of one</h3><p>Buy-one-get-one pricing on paid registry accounts, renewable for the life of your LWS membership.</p></article>
          <article class="card"><p class="kicker">02</p><h3>Certification</h3><p>Certification at LWS member pricing, with revenue share on every deal.</p></article>
          <article class="card"><p class="kicker">03</p><h3>Free opt-out</h3><p>Don't want to license to AI? Register a free opt-out account and record your reservation of rights.</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>Tools for control, pricing, and insight.</h2>
        <div class="grid-3" style="margin-top:20px">
          <article class="card"><h3>Content valuation</h3><p>Credtent values your work using market trends and first-party Credtent data.</p></article>
          <article class="card"><h3>Pricing controls</h3><p>Credtent's valuation gives you a starting point, and you set the final price on the marketplace.</p></article>
          <article class="card"><h3>License approval</h3><p>Review every license request before approval, or set rules that match your terms.</p></article>
          <article class="card"><h3>Analytics</h3><p>Usage, licensing requests, and revenue in your Creative Library dashboard.</p></article>
          <article class="card"><h3>Custom valuation</h3><p>Media and publishing companies can request a tailored valuation at an LWS rate.</p></article>
          <article class="card"><h3>Revenue share</h3><p>Earn back on every certification deal Credtent closes through LWS.</p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>Use code LWSALON25.</h2>
        <p>Apply code LWSALON25 at checkout for two years for the price of one on a paid registry account.</p>
        <div class="btn-row"><a class="btn" href="https://app.credtent.org/login">Claim your member benefits</a><a class="btn btn-ghost" href="/opt-out">Read about opt-out</a></div>
        <p class="small">Publishing or media company? Write to <a href="mailto:partners@credtent.org">partners@credtent.org</a> for a custom rate.</p>
      </div></section>`
    },
    {
      path: "/creative-origin",
      title: "Creative Origin | Credtent",
      description: "The multi-format Creative Origin composer lives on the Credtent registry.",
      eyebrow: "Creative Origin",
      h1: "The composer lives on the registry.",
      capsule: "The multi-format Creative Origin tool is on the registry.",
      crumbs: [{ name: "Creative Origin", href: "https://credtent.org/creative-origin" }],
      faq: [],
      main: `<section class="section"><div class="wrap prose"><p><a href="https://registry.credtent.org/creative-origin">Continue to registry.credtent.org/creative-origin</a></p></div></section>
      <section class="section section-tight"><div class="wrap prose"><p class="fine">This is not the free badge builder. The free one-label builder is on this site; the multi-format composer is on the registry.</p></div></section>`
    },
    {
      path: "/contact",
      title: "Contact | Credtent",
      description: "Contact Credtent about opt-out, Creative Consent, and resources.",
      eyebrow: "Contact",
      h1: "Contact Credtent.",
      capsule: "Creatives can write to hello@credtent.org, and this form opens an email to that address.",
      crumbs: [{ name: "Contact", href: "https://credtent.org/contact" }],
      faq: [],
      main: `<section class="section"><div class="wrap grid-2">
        ${formSlot({
          id: TALLY_FORM_IDS.orgContact,
          title: "Credtent.org Contact",
          subject: "Credtent inquiry",
          submitLabel: "Send",
          note: "Sending opens an email to hello@credtent.org.",
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
    faq: [],
    main: `<section class="section"><div class="wrap prose"><p>Coming soon.</p><p><a href="/resources">Back to resources</a></p></div></section>`
  };
}
