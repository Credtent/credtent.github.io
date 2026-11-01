import { ADDRESS_HTML, BOOK, CAPSULE, CONTENT_PARTNER_INQUIRY, LICENSE_SENTENCE, OPT_OUT_FLOW, SIGN_UP, price } from "./copy.mjs";
import { ORG_ID, diagramHtml, figure, inquiryForm, picture, tallyEmbed } from "./render.mjs";

function editions() {
  return `<ul class="editions">
    <li><p class="kicker">Standard e-book</p><p>${price("$14.99")}</p><p>A standalone digital edition. Quarterly updates are not included.</p></li>
    <li><p class="kicker">Paperback</p><p>${price("$24.99")}</p><p>A standalone printed edition. Quarterly updates are not included.</p></li>
    <li><p class="kicker">Living e-book</p><p>${price("$49")}</p><p>The digital book with quarterly updates included.</p></li>
  </ul>`;
}

function bookBand() {
  return `<section class="section">
    <div class="wrap split">
      <div>
        <p class="eyebrow">The Collaborithmic Age</p>
        <h2>Understand how creativity and AI can work together.</h2>
        <p class="lede">By E.R. Burgess, Credtent CEO and creative technologist. Drawing on years of content valuation and two and a half years developing full-cycle AI licensing, Burgess explores how to use AI, understand the value of your work, and keep your creative skills and judgment strong.</p>
        <div class="btn-row"><a class="btn" href="${BOOK}">Explore the book</a></div>
        ${editions()}
      </div>
      <div>
        <p>The book site is separate. These are the published collaborithmic.com prices.</p>
      </div>
    </div>
  </section>`;
}

function serviceNode(id, name, description) {
  return {
    "@type": "Service",
    "@id": id,
    name,
    provider: { "@id": ORG_ID },
    description
  };
}

export function comPages(images) {
  const hero = (key, opts = {}) => figure(images[key], { priority: !!opts.priority, sizes: opts.sizes || "(min-width: 1000px) 520px, 100vw", className: "shot" });
  const preload = (key) => `<link rel="preload" as="image" href="${images[key].base}-${images[key].widths.at(-1)}.avif" type="image/avif" imagesrcset="${images[key].widths.map((w) => `${images[key].base}-${w}.avif ${w}w`).join(", ")}" imagesizes="(min-width: 1000px) 50vw, 100vw" fetchpriority="high">`;

  return [
    {
      path: "/",
      title: "Credtent | A neutral marketplace for content owners and AI companies",
      description: "Credtent bridges content owners and AI companies through consent, licensing, and compensation.",
      eyebrow: "Connecting creativity and AI",
      h1: "Creative work.<br>Clear AI permissions.<br>Value for both.",
      capsule: CAPSULE.comHome,
      capsuleOutsideHero: true,
      heroBand: true,
      lede: "We help content owners and AI companies define permitted uses, assess value, and agree on terms for mutual prosperity and commercial safety.",
      actions: `<div class="btn-row"><a class="btn" href="${SIGN_UP}">Sign up</a><a class="btn btn-ghost" href="/contact">Contact us</a></div>`,
      media: hero("bridge", { priority: true, sizes: "(min-width: 1000px) 50vw, 100vw" }),
      disclosures: [
        "Training and display permissions are agreed separately. Source visits are a goal, not a guarantee.",
        "Illustrative inputs, not a formula. Evidence, assumptions, and intended use inform the assessment; the parties agree the final price."
      ],
      preload: preload("bridge"),
      faq: [
        { q: "What is Credtent?", a: CAPSULE.comHome },
        { q: "Does a license replace a company's own legal duties?", a: LICENSE_SENTENCE },
        { q: "Are source visits guaranteed?", a: "Source visits are a goal, not a guarantee. Training and display permissions are agreed separately." }
      ],
      main: `
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">Two sides. Shared opportunity.</p>
          <h2 class="h2-wide">A neutral marketplace connecting content owners <br class="br-desk">and AI companies.</h2>
          <p class="lede">We help content owners and AI companies define permitted uses, assess value, and agree on terms for mutual prosperity and commercial safety.</p>
          <p class="capsule">${CAPSULE.comHome}</p>
          <div class="grid-2" style="margin-top:28px">
            <article class="card">
              ${hero("editor", { sizes: "(min-width: 1000px) 480px, 100vw" }).replace('class="shot"', 'class="shot"')}
              <p class="kicker">Content Owners</p>
              <h3>Choose what to license and what to protect.</h3>
              <p>Credtent helps you protect your work and license your content for full cycle AI training.</p>
              <p>This works for:</p><ul class="audience-list"><li>Authors</li><li>Publishers</li><li>Studios</li><li>Archives</li><li>Data providers</li><li>Musicians</li><li>Filmmakers</li><li>Poets</li><li>Artists</li><li>Photographers</li></ul>
              <p><a href="/content-owners">Explore content-owner options</a></p>
            </article>
            <article class="card">
              ${hero("aiTeam", { sizes: "(min-width: 1000px) 480px, 100vw" })}
              <p class="kicker">AI Companies</p>
              <h3>Find content for training and AI citation rights.</h3>
              <p>Full-cycle Credtent licensing covers AI training, retrieval-augmented generation (RAG), and Generative Results Referencing, including citation rights.</p>
              <p>${LICENSE_SENTENCE}</p>
              <p><a href="/ai-training">Explore content licensing</a></p>
            </article>
          </div>
        </div>
      </section>
      <section class="section section-warm">
        <div class="wrap">
          <p class="eyebrow">Content valuation</p>
          <h2>Understand your content's value. Explore your licensing options.</h2>
          <p class="lede">Credtent assesses what content is worth for AI licensing, so that high-quality, credible work is licensed at an appropriate value.</p>
          <p>A baseline valuation comes when you register on Credtent. Optional paid custom valuation goes deeper, into the catalog, its evidence, and its intended use.</p>
          <h3 style="margin-top:28px">The Burgess-Buckwalter methodology, the Credtent Universal Content Valuation System</h3>
          ${diagramHtml()}
          <div class="btn-row"><a class="btn" href="/valuation">Request a valuation</a></div>
        </div>
      </section>
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">How licensing works</p>
          <h2>Your work. New ways to earn.</h2>
          <div class="steps" style="margin-top:28px">
            <article class="step"><p class="kicker">01</p><h3>Choose the rights.</h3><p>Define which content, uses, and exclusions you want to offer.</p></article>
            <article class="step"><p class="kicker">02</p><h3>Understand your value.</h3><p>Credtent helps assess your content's value alongside the intended AI use.</p></article>
            <article class="step"><p class="kicker">03</p><h3>Agree on terms.</h3><p>Set permitted use, attribution, compensation, reporting, and renewal terms together.</p></article>
            <article class="step"><p class="kicker">04</p><h3>Get paid.</h3><p>Receive licensing payments and agreed reporting under the contract.</p></article>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div>
            <p class="eyebrow">Full-cycle licensing</p>
            <h2>Agree how AI can use your content.</h2>
            <p class="lede">We enable content owners and AI companies to agree on what can be used, how it can be used, and how it is paid for.</p>
            <h3 style="margin-top:22px">AI training rights</h3>
            <p>License a defined corpus with documented origins and quality criteria. Set training scope and compensation, with agreed access to new work from creatives and subject-matter experts.</p>
            <p><a href="/ai-training">Explore training licensing</a></p>
            <h3 style="margin-top:22px">Use in AI answers</h3>
            <p>Generative Results Referencing (GRR) sets excerpt limits, attribution and citation, source links, and compensation for licensed appearances, including those without a click.</p>
            <p><a href="/citation-licensing">Explore citation licensing</a></p>
          </div>
        </div>
        <div class="wrap media-wide">${hero("podcast", { sizes: "(min-width: 1120px) 1064px, 100vw" })}</div>
      </section>
      <section class="book-banner" aria-label="New book"><div class="wrap"><p><a href="/about#collaborithmic-age">Now available: <cite>The Collaborithmic Age</cite>, written by Credtent CEO E.R. Burgess.</a></p></div></section>`
    },
    {
      path: "/content-owners",
      title: "For content owners | Credtent",
      description: "Choose what to license, agree terms, and get paid. Valuation can stand on its own.",
      eyebrow: "Content owners",
      h1: "Choose what to license, agree on terms, get paid.",
      capsule: "Credtent helps authors, publishers, studios, archives, and data providers decide which uses to permit, understand value, and license on terms they set.",
      crumbs: [{ name: "Content owners", href: "https://credtent.com/content-owners" }],
      crumbName: "Content owners",
      actions: `<div class="btn-row"><a class="btn" href="${CONTENT_PARTNER_INQUIRY}">Talk with us</a><a class="btn btn-ghost" href="${SIGN_UP}">Sign up</a></div>`,
      media: hero("editor", { priority: true }),
      preload: preload("editor"),
      faq: [
        { q: "What do I keep when I list my catalog with Credtent?", a: "You keep full ownership of everything you list. Credtent acts as your licensing agent, not a publisher or co-owner, and holds only limited representation rights for AI licensing that you can end at any time. Listing transfers no copyright and no exclusivity, and every deal needs your approval before it goes ahead." },
        { q: "How does the revenue split work?", a: "Credtent sends 85% of gross revenue from every licensing deal to the rights holders and data providers whose content was licensed, and keeps 15% for the platform, legal work, compliance tools, and operations. The split applies to gross revenue." },
        { q: "When do Credtent partners get paid?", a: "Royalties are paid quarterly. Each payment comes with a usage report showing which licensees used your catalog and how much, so you can tie each payment to specific deals." },
        { q: "Can I get a valuation without a licensing mandate?", a: "Yes. Obtain a valuation independently, then decide whether you want help finding licensing partners." },
        { q: "Where do individual creatives opt out?", a: "Free opt-out for creatives lives on credtent.org and does not require a licensing agreement." }
      ],
      main: `<section class="section section-white"><div class="wrap split">
        <div class="prose">
          <p class="eyebrow">What you keep</p>
          <h2>Your catalog stays yours.</h2>
          <p>You keep full ownership of everything you list with Credtent. We act as your licensing agent, not a publisher or co-owner, and hold only limited representation rights for AI licensing, which you can end at any time. Listing transfers no copyright and no exclusivity. You also decide which AI companies and uses your content is licensed for, because every deal needs your approval before it goes ahead.</p>
        </div>
        <ul class="check-list">
          <li>Full ownership of your work</li>
          <li>85% of all licensing revenue</li>
          <li>Control over which AI companies can use your content</li>
          <li>Anti-plagiarism guardrails in every license</li>
          <li>Audit-ready reporting on demand</li>
          <li>Quarterly royalty payments</li>
        </ul>
      </div></section>
      <section class="section"><div class="wrap prose">
        <p class="eyebrow">The economics</p>
        <h2>85% goes to the people whose work was licensed.</h2>
        <p>Every deal Credtent closes sends 85% of gross licensing revenue to the content owners, rights holders, and data providers who made it possible. The other 15% pays for the platform, legal work, compliance tools, and operations that make the whole system work.</p>
        <p>Under the 85/15 split, revenue reaches rights holders every quarter.</p>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <p class="eyebrow">What you get</p>
        <h2>What a Credtent content partner gets.</h2>
        <p class="lede">You register your catalog and set your terms. We bring it to the AI companies who need it, and we handle rights clearance, legal work, and compliance so your catalog can be licensed again and again without you giving up control.</p>
        <div class="grid-3" style="margin-top:24px">
          <article class="card"><h3>License at scale</h3><p>List your full catalog once, with bulk metadata intake, standard deal terms, and reporting across every licensee in one place.</p></article>
          <article class="card"><h3>Anti-plagiarism protection</h3><p>License terms include output guardrails so AI tools do not reproduce your protected work at scale.</p></article>
          <article class="card"><h3>Provenance certification</h3><p>Creative Origin certification adds a neutral, third-party record of where your work came from, which AI buyers increasingly ask for.</p></article>
          <article class="card"><h3>Usage tracking</h3><p>See how your catalog is used by every AI licensee, with audit-ready reporting on demand.</p></article>
          <article class="card"><h3>Quarterly royalties</h3><p>Predictable payments every quarter, with 85% of revenue going to creatives, rights holders, and data providers.</p></article>
          <article class="card"><h3>Full ownership</h3><p>You keep your rights. Credtent works as your licensing agent, not as a publisher or owner of your content.</p></article>
        </div>
        <div class="grid-3" style="margin-top:24px">
          <article class="card"><h3>Valuation</h3><p>An informed starting point before a price conversation. No public score or guaranteed transaction price.</p><p><a href="/valuation">Explore content valuation</a></p></article>
          <article class="card"><h3>Training licensing</h3><p>Define the corpus, the rights, and access to new work.</p><p><a href="/ai-training">Explore training licensing</a></p></article>
          <article class="card"><h3>Citation licensing</h3><p>Set excerpt limits, attribution, and compensation when work appears in AI answers.</p><p><a href="/citation-licensing">Explore citation licensing</a></p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap">
        <p class="eyebrow">How it works</p>
        <h2>Four steps from catalog to royalties.</h2>
        <p class="lede">Register once, and earn on every deal Credtent closes for your catalog. Onboarding is built for whole catalogs, and we handle the rest.</p>
        <div class="steps" style="margin-top:24px">
          <article class="step"><p class="kicker">01</p><h3>Submit your catalog</h3><p>Share catalog metadata, proof of ownership, and your licensing terms. Bulk intake is available.</p></article>
          <article class="step"><p class="kicker">02</p><h3>Provenance certification</h3><p>Credtent verifies ownership, adds Creative Origin certification, and tags your content so AI buyers can find it.</p></article>
          <article class="step"><p class="kicker">03</p><h3>Deals close</h3><p>We bring your content to AI companies. You review and approve the terms, and we sign the contract.</p></article>
          <article class="step"><p class="kicker">04</p><h3>Royalties are paid</h3><p>Usage is tracked and revenue is paid quarterly, with audit-ready reporting any time.</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap prose">
        <p class="eyebrow">Talk to the team</p>
        <h2>Tell us about your content.</h2>
        <p>Describe your catalog: format, volume, subject areas, and who owns the rights. We'll come back with an onboarding plan and a projected deal pipeline within 5 business days.</p>
        <div class="btn-row"><a class="btn" href="${CONTENT_PARTNER_INQUIRY}">Talk with us</a></div>
        <p class="small">Prefer email? Write to <a href="mailto:partners@credtent.org">partners@credtent.org</a>.</p>
      </div></section>`
    },
    {
      path: "/ai-companies",
      title: "For AI companies | Credtent",
      description: "License rights-cleared, provenance-tagged content for AI training and AI citation rights, with a named manifest and a disclosure pack your counsel can use.",
      eyebrow: "AI Companies",
      h1: "Find content for training and AI citation rights.",
      capsule: "Credtent offers AI companies rights-cleared, provenance-tagged content from publishers, studios, archives, and data providers who chose to license it, with a named manifest and a disclosure pack in every license.",
      lede: "Build with content people chose to share. We enable you to license verified, rights-cleared work for training and for citation in AI answers, under one standardized contract.",
      crumbs: [{ name: "AI companies", href: "https://credtent.com/ai-companies" }],
      actions: `<div class="btn-row"><a class="btn" href="/contact">Schedule a licensing call</a><a class="btn btn-ghost" href="#how-it-works">See how it works</a></div>`,
      media: hero("aiTeam", { priority: true }),
      preload: preload("aiTeam"),
      extraLd: [serviceNode("https://credtent.com/ai-companies#service", "Licensing for AI companies", CAPSULE.training)],
      faq: [
        { q: "What comes with a Credtent license?", a: "The rights the contracting rights holders warranted, a named manifest of the works, and a disclosure pack your counsel can use for EU AI Act Art. 53 and California AB 2013 filings. Those laws still apply to you as the developer, and any indemnity is only what the signed license says." },
        { q: "Can you license content we already trained on?", a: "Yes, going forward. We can set up a license plus a promise not to sue from the rights holders who sign, covering the named works. It does not cover anyone who did not sign, and it does not settle anything with regulators." },
        { q: "Does citation permission include training?", a: "No. Training and citation in AI answers are agreed separately. A source link on its own does not grant training permission." }
      ],
      main: `
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">What's covered</p>
          <h2>Everything you need to train with confidence.</h2>
          <p class="lede">Every license covers the training uses you define, and comes with a named manifest, a disclosure pack, and safeguards against plagiarized output.</p>
          <p>Licenses include the rights the contracting holders warranted, a named manifest, and a disclosure pack your counsel can use for EU AI Act Art. 53 and CA AB 2013 filings. Those statutes still bind the developer. Indemnity, if any, is only as written in the signed license.</p>
          <ul class="audience-list" style="margin-top:20px">
            <li>Pre-cleared chain of title, ready for audit</li>
            <li>A disclosure pack for EU AI Act Art. 53 and California AB 2013 filings</li>
            <li>One contract with access to many rights holders</li>
            <li>Guardrails against plagiarized output</li>
            <li>Deals that close in weeks, not quarters</li>
          </ul>
          <div class="grid-3" style="margin-top:28px">
            <article class="card"><h3>Neutral by design</h3><p>Credtent is a Delaware Public Benefit Corporation, and we don't build AI models.</p></article>
            <article class="card"><h3>Every format</h3><p>Text, audio, video, images, and structured data.</p></article>
            <article class="card"><h3>Disclosure pack included</h3><p>Every license ships with a named manifest and a disclosure pack.</p></article>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <p class="eyebrow">The corpus</p>
          <h2>Real content from people who opted in.</h2>
          <p class="lede">Not scraped. Not synthetic. Our corpus is verified, rights-cleared content from publishers, studios, archives, and data providers who chose to license their work for AI under standardized terms. Everything is provenance-tagged and rights-cleared before we offer it.</p>
          <div class="grid-4" style="margin-top:28px">
            <article class="card"><p class="kicker">Growing</p><h3>Registered works</h3></article>
            <article class="card"><p class="kicker">800B+</p><h3>Structured sports tokens</h3></article>
            <article class="card"><p class="kicker">135K+</p><h3>Healthcare articles</h3></article>
            <article class="card"><p class="kicker">5</p><h3>Content verticals</h3><p>Education, healthcare, sports, entertainment, and media.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-white">
        <div class="wrap">
          <p class="eyebrow">What you get</p>
          <h2>Licensing that works for your team.</h2>
          <div class="grid-3" style="margin-top:28px">
            <article class="card"><h3>Peace of mind</h3><p>Pre-cleared chain of title and documented consent from the rights holders you contract with.</p></article>
            <article class="card"><h3>Quality over quantity</h3><p>Curated, premium content from publishers, studios, and archives who own the IP. Not scraped, not synthetic.</p></article>
            <article class="card"><h3>A neutral partner</h3><p>We don't build AI models, so we never compete with you. Both sides of the market trust Credtent because we sit on neither side.</p></article>
            <article class="card"><h3>Provenance-tagged content</h3><p>Metadata and chain-of-custody records designed to reduce hallucinations and make your training verifiable.</p></article>
            <article class="card"><h3>Disclosure pack</h3><p>A named manifest and a disclosure pack your counsel can use for EU AI Act Art. 53 and California AB 2013 filings.</p></article>
            <article class="card"><h3>Fast deal cycles</h3><p>Standardized terms, neutral pricing, and pre-negotiated contracts. Weeks, not quarters.</p></article>
          </div>
        </div>
      </section>
      <section class="section" id="how-it-works">
        <div class="wrap">
          <p class="eyebrow">How it works</p>
          <h2>From first call to licensed content in weeks.</h2>
          <p class="lede">We've standardized the process so you can move quickly without giving up the legal and compliance rigor your team needs. We find the right rights holders, shape the license around your corpus and use case, and deliver a named manifest and disclosure pack with the data.</p>
          <div class="steps" style="margin-top:28px">
            <article class="step"><p class="kicker">01</p><h3>Scope the deal</h3><p>A 20-minute call about the content you need, your use case, and your compliance requirements.</p></article>
            <article class="step"><p class="kicker">02</p><h3>Get a proposal</h3><p>Within 5 business days you get a scoped proposal: corpus, terms, pricing, and disclosure pack.</p></article>
            <article class="step"><p class="kicker">03</p><h3>Sign once</h3><p>One standardized contract with access to many rights holders. One signature, one NDA, one deal.</p></article>
            <article class="step"><p class="kicker">04</p><h3>Receive your disclosure pack</h3><p>A named manifest and a disclosure pack your counsel can use for filings.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-white">
        <div class="wrap grid-2">
          <article class="card"><h3>AI training licensing</h3><p>A defined corpus, documented origins, scope, compensation, and access to new work.</p><p><a href="/ai-training">Read how training licensing works</a></p></article>
          <article class="card"><h3>Citation licensing</h3><p>Excerpt limits, attribution and citation, source links, and compensation for licensed appearances in AI answers.</p><p><a href="/citation-licensing">Read how citation licensing works</a></p></article>
        </div>
      </section>
      <section class="section">
        <div class="wrap prose">
          <p class="eyebrow">Content you already used</p>
          <h2>What about content a model already used?</h2>
          <p>We can structure a going-forward license plus a covenant not to sue from the rights holders who sign, covering the named works. That is not a release from everyone else, and it is not a regulator cure. It is a clear, honest place to start.</p>
        </div>
      </section>
      <section class="section section-tint">
        <div class="wrap">
          <p class="eyebrow">Start the conversation</p>
          <h2>20 minutes. A scoped proposal back to you.</h2>
          <p class="lede">Tell us what you're building and which content categories you need. We'll come back with a proposal within 5 business days.</p>
          <div class="btn-row"><a class="btn" href="/contact">Talk to the team</a></div>
        </div>
      </section>`
    },
    {
      path: "/services",
      title: "Services | Credtent",
      description: "Valuation, AI training licensing, citation licensing, and auditing.",
      eyebrow: "Services",
      h1: "Services for both sides of a license.",
      capsule: "Credtent offers content valuation, AI training licensing, Generative Results Referencing for AI answers, and optional auditing of observable model responses.",
      crumbs: [{ name: "Services", href: "https://credtent.com/services" }],
      faq: [
        { q: "Which service comes first?", a: "Many catalogs start with a valuation, then choose training rights, display rights, or both." },
        { q: "Where is auditing?", a: "Auditing of observable model responses is described on credtent.org and is not proof of dataset inclusion." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-2">
        <article class="card"><h3>Content valuation</h3><p>Qualitative context for a pricing conversation.</p><p><a href="/valuation">Explore content valuation</a></p></article>
        <article class="card"><h3>AI training licensing</h3><p>License a defined corpus.</p><p><a href="/ai-training">Explore training licensing</a></p></article>
        <article class="card"><h3>Citation licensing</h3><p>License use in AI answers.</p><p><a href="/citation-licensing">Explore citation licensing</a></p></article>
        <article class="card"><h3>Auditing</h3><p>Opt-Out Premium enrolls your works in Credtent's periodic AI model audits.</p><p><a href="https://credtent.org/resources/auditing">Read how auditing works</a></p></article>
      </div></section>`
    },
    {
      path: "/citation-licensing",
      title: "Citation licensing (GRR) | Credtent",
      description: "Set excerpt limits, support visits to the source, and agree compensation for licensed appearances in AI answers.",
      eyebrow: "Your content in AI answers",
      h1: "More control over your content in AI answers.",
      capsule: CAPSULE.citation,
      lede: "Set excerpt limits. Support visits to the source. Get paid for licensed use. Your content creates value when it appears in AI answers. Credtent's Generative Results Referencing licenses help you agree how much is shown, how people reach the source, and how you're compensated for its use.",
      actions: `<div class="btn-row"><a class="btn" href="/contact#other">Explore citation licensing</a><a class="btn btn-ghost" href="/contact#other">Contact us</a></div>`,
      media: hero("citation", { priority: true, sizes: "(min-width: 1000px) 560px, 100vw" }),
      preload: preload("citation"),
      crumbs: [{ name: "Citation licensing", href: "https://credtent.com/citation-licensing" }],
      extraLd: [serviceNode("https://credtent.com/citation-licensing#service", "Generative Results Referencing", CAPSULE.citation)],
      faq: [
        { q: "What is GRR?", a: CAPSULE.citation },
        { q: "Are source visits promised?", a: "Traffic is a goal, not a promised outcome. Compensation and display limits depend on the agreement." },
        { q: "Does a citation license include training?", a: "No. Agree training scope explicitly. A source link alone does not establish permission." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><h3>Support source visits.</h3><p>Prominent attribution and source links invite people to explore the original article, image, audio, or video.</p></article>
        <article class="card"><h3>Get paid for use.</h3><p>Agree compensation for licensed appearances, including appearances that do not lead to a click.</p></article>
        <article class="card"><h3>Set the limits.</h3><p>Define acceptable excerpts so an AI answer introduces the work without giving everything away.</p></article>
      </div></section>
      <section class="section"><div class="wrap">
        <p class="eyebrow">Two audiences. Clear expectations.</p>
        <h2>Make the relationship explicit.</h2>
        <div class="grid-2" style="margin-top:24px">
          <article class="card"><h3>For creatives</h3><p>Explore citation licensing and communicate your preferences about AI use. Agree attribution, excerpts, and compensation.</p><p><a href="/content-owners">Explore your options</a></p></article>
          <article class="card"><h3>For AI companies</h3><p>Secure clear permissions, provide accurate attribution, agree compensation, and respond to creative notices.</p><p><a href="/contact#other">Talk about citation licensing</a></p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <p class="eyebrow">Three illustrative journeys</p>
        <h2>A useful answer. A visible source.</h2>
        <p class="lede">These examples do not depict a real provider, publisher, contract, or measured performance outcome.</p>
        <div class="grid-3" style="margin-top:24px">
          <article class="journey"><p class="kicker">01 / The classic search journey</p><h3>Search and visit</h3><p>A relevant article. A brief description helps you decide what to open.</p><p>The reader opens the source to explore the full work.</p></article>
          <article class="journey"><p class="kicker">02 / The oversharing concern</p><h3>An answer that may replace the visit</h3><p>When an answer gives too much away, the reason to visit can shrink.</p></article>
          <article class="journey"><p class="kicker">03 / The balance Credtent helps define</p><h3>A licensed path to the source</h3><p>An agreed excerpt, clear credit, and a prominent invitation to keep reading.</p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <p class="eyebrow">Fictional example</p>
        <h2>A short excerpt. An unmistakable source.</h2>
        <p>The agreement sets the display limit and unit. A 150-character cap is illustrative only, not a universal rule.</p>
        <blockquote>
          <p>The full report examines how independent studios develop new audiences and sustain their creative work.</p>
          <p class="small">103 characters shown. Licensed source excerpt. Example Publisher / The Studio Report.</p>
        </blockquote>
        <p><a href="/contact">Read the original source</a></p>
        <p>Additional generated explanation appears separately from the publisher's licensed words.</p>
        <div class="grid-3" style="margin-top:20px">
          <article class="card"><h3>Display and attribution</h3><p>Specify excerpt limits, source naming, visible source links, and permitted media.</p></article>
          <article class="card"><h3>Payments and reporting</h3><p>Agree compensation, usage records, responsibilities, and follow-up.</p></article>
          <article class="card"><h3>Training is a separate right</h3><p>Agree training scope explicitly. A source link alone does not establish permission.</p></article>
        </div>
      </div></section>`
    },
    {
      path: "/valuation",
      title: "Content valuation | Credtent",
      description: "Understand your content's value for AI licensing. An estimate supports a conversation. It is not a guaranteed price.",
      eyebrow: "Services / Content valuation",
      h1: "What is your content worth for AI licensing?",
      capsule: CAPSULE.valuation,
      lede: "Understand your content's value. Explore your licensing options.",
      actions: `<div class="btn-row"><a class="btn" href="/contact">Request a valuation</a></div>`,
      crumbs: [{ name: "Services", href: "https://credtent.com/services" }, { name: "Content valuation", href: "https://credtent.com/valuation" }],
      disclosures: ["Illustrative inputs, not a formula. Evidence, assumptions, and intended use inform the assessment; the parties agree the final price."],
      extraLd: [serviceNode("https://credtent.com/valuation#service", "Content valuation", CAPSULE.valuation)],
      faq: [
        { q: "Is a valuation a price?", a: "No. An estimate is not a guaranteed transaction price or an established industry standard. The parties agree the final price." },
        { q: "What is the difference between baseline and custom?", a: "A baseline valuation comes when content is added. Optional paid custom valuation goes deeper into catalog, evidence, and intended use." },
        { q: "Will I see a numeric score?", a: "No. The diagram shows qualitative inputs only. Credtent does not publish weights, scores, or valuation figures." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><h3>Start informed.</h3><p>Assess your work and intended use before discussing pricing and permissions.</p></article>
        <article class="card"><h3>Reassess the value.</h3><p>Consider what has changed in your catalog, audience, evidence, or the proposed AI use.</p></article>
        <article class="card"><h3>Explore more options.</h3><p>Evaluate additional licensing possibilities and how they fit your existing agreements.</p></article>
      </div></section>
      <section class="section"><div class="wrap grid-2">
        <article class="card"><h3>Baseline valuation</h3><p>Credtent provides a baseline valuation when content is added. It gives the licensing conversation an informed starting point.</p></article>
        <article class="card"><h3>Paid custom valuation</h3><p>Optional deeper assessment considers your catalog, supported evidence, intended AI use, and the questions you need answered.</p><p><a href="/contact#other">Discuss a custom assessment</a></p></article>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>More than volume or tokens.</h2>
        <p class="lede">Assessment considers intended AI use alongside creative-side evidence. Different uses and rights can change the value discussion.</p>
        <div class="grid-3" style="margin-top:22px">
          <article class="card"><h3>Creative significance</h3><p>Cultural significance, subject-matter expertise, distinctive perspective, and other supported indicators.</p></article>
          <article class="card"><h3>Audience and recognition</h3><p>Audience reception, awards, and relevant third-party evidence, with appropriate sources and context.</p></article>
          <article class="card"><h3>Scope and intended use</h3><p>The proposed AI use, rights requested, limitations, and the content available for that agreement.</p></article>
        </div>
        <h3 style="margin-top:28px">The Burgess-Buckwalter methodology, the Credtent Universal Content Valuation System</h3>
        <div class="diagram">
    <ol class="diagram-inputs">
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg><h3>Intended AI use</h3><p>Training, answers, or both</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a2 2 0 0 0 0 4h3M16 6h3a2 2 0 0 1 0 4h-3"/><path d="M12 13v4M8 21h8M9 17h6"/></svg><h3>Evidence of success</h3><p>Audience reception and awards</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18M4 10h16M12 3l9 5H3l9-5z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/></svg><h3>Cultural significance</h3><p>Context and distinctive contribution</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3z"/></svg><h3>Quality and expertise</h3><p>The work and its specialist value</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg><h3>Rights and scope</h3><p>Permissions, limits, and exclusivity</p></li>
    </ol>
    <svg class="diagram-lines" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <line x1="10" y1="0" x2="50" y2="36"></line>
      <line x1="30" y1="0" x2="50" y2="36"></line>
      <line x1="50" y1="0" x2="50" y2="36"></line>
      <line x1="70" y1="0" x2="50" y2="36"></line>
      <line x1="90" y1="0" x2="50" y2="36"></line>
    </svg>
    <div class="diagram-hub">
      <h3>A neutral assessment</h3>
      <p>An informed starting point for what to charge.</p>
    </div>
  </div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>An estimate supports a conversation.</h2>
        <p>The assessment should identify evidence, assumptions, scope, and uncertainty. An estimate is not a guaranteed transaction price or an established industry standard. Final terms depend on the parties and their agreement.</p>
        <p>Credtent's proposed approach brings context and supported indicators into constructive pricing discussions. Third-party ratings and evidence must be appropriately sourced; unsupported ratings are not part of a Credtent valuation.</p>
        <h2>Valuation can stand on its own.</h2>
        <p>You may already have a buyer or a licensing agreement. Obtain a valuation independently, then decide whether you want help finding licensing partners or negotiating another opportunity.</p>
        <div class="btn-row"><a class="btn" href="/contact#other">Request a valuation</a><a class="btn btn-ghost" href="/ai-training">Discuss licensing options</a></div>
      </div></section>`
    },
    {
      path: "/ai-training",
      title: "AI training licensing | Credtent",
      description: "License content from creatives and subject-matter experts, with a named list of works and separate training and display rights.",
      eyebrow: "Services / For AI companies",
      h1: "Build on expertise. Keep it fresh.",
      capsule: CAPSULE.training,
      lede: "License content from creatives and subject-matter experts, understand its origins, and build relationships that provide access to new work over time. " + LICENSE_SENTENCE,
      actions: `<div class="btn-row"><a class="btn" href="/contact#ai-licensing">Discuss training licensing</a></div>`,
      media: hero("training", { priority: true }),
      preload: preload("training"),
      crumbs: [{ name: "Services", href: "https://credtent.com/services" }, { name: "AI training licensing", href: "https://credtent.com/ai-training" }],
      extraLd: [serviceNode("https://credtent.com/ai-training#service", "AI training licensing", CAPSULE.training)],
      faq: [
        { q: "What does the license include?", a: LICENSE_SENTENCE },
        { q: "Does a training license require payment forever?", a: "A training license does not automatically require recurring payments for every continued model use. Specific contracts define the scope, duration, compensation, and renewal arrangements." },
        { q: "Do the research notes prove a license prevents model collapse?", a: "No. The studies support attention to data origins and careful selection. They do not show that buying a license prevents model collapse." }
      ],
      main: `<section class="section section-white"><div class="wrap">
        <h2>Know which works and rights your license covers.</h2>
        <div class="grid-3" style="margin-top:22px">
          <article class="card"><h3>A defined content corpus</h3><p>Tell us whether you need text, images, audio, video, or structured data. We help scope the works and formats for your use case.</p></article>
          <article class="card"><h3>Training and display rights</h3><p>We help scope training and Generative Results Referencing separately. Agree excerpts, attribution, permitted uses, and compensation.</p></article>
          <article class="card"><h3>Rights you can review</h3><p>Review a named list of works, the rights offered, and supporting provenance documentation. Agree how new work and updates enter the license.</p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap">
        <p class="eyebrow">From discovery to ongoing relationships</p>
        <h2>Full-cycle support for content licensing.</h2>
        <div class="steps" style="margin-top:22px">
          <article class="step"><p class="kicker">01</p><h3>Find relevant expertise</h3><p>Discuss your use case, content needs, origin information, and selection criteria.</p></article>
          <article class="step"><p class="kicker">02</p><h3>Assess the value</h3><p>Consider intended use alongside the work, its context, and supported creative-side evidence.</p></article>
          <article class="step"><p class="kicker">03</p><h3>Agree the license</h3><p>Define scope, permitted uses, compensation, exclusions, and responsibilities.</p></article>
          <article class="step"><p class="kicker">04</p><h3>Keep the relationship current</h3><p>Plan content updates, access to new work, reporting, and agreed renewals.</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap prose">
        <h2>Build with people who keep creating.</h2>
        <p>Ongoing relationships can provide access to new human-created and expert work. The agreement defines which updates, renewals, and payments apply.</p>
        <p>A training license does not automatically require recurring payments for every continued model use. Specific contracts define the scope, duration, compensation, and renewal arrangements.</p>
        <h2>Origins and selection deserve care.</h2>
        <p>Research on recursive training highlights why the composition and handling of training data matter. Findings depend on the experimental conditions.</p>
        <div class="grid-2">
          <article class="card"><p class="kicker">Nature / 2024</p><h3>Recursive replacement</h3><p>Shumailov and colleagues observed degradation when models were recursively trained on generated data under the conditions they studied.</p><p><a href="https://doi.org/10.1038/s41586-024-07566-y">Read Shumailov et al.</a></p></article>
          <article class="card"><p class="kicker">Research / 2024</p><h3>Retaining original data</h3><p>Gerstgrasser and colleagues found that retaining original real data while accumulating synthetic data avoided collapse in their experiments.</p><p><a href="https://arxiv.org/abs/2404.01413">Read Gerstgrasser et al.</a></p></article>
        </div>
        <p>These studies support attention to data origins, diversity, and careful selection. They do not show that all synthetic data is harmful, that human authorship alone guarantees quality, or that buying a license prevents model collapse.</p>
        <h2>Permission, context, and partnership.</h2>
        <p>Our service focuses on connecting AI teams with content owners, assessing value, and agreeing clear terms. Research findings are distinct from this proposed service value.</p>
        <p><a href="/valuation">Explore content valuation</a> · <a href="/citation-licensing">Explore citation licensing</a></p>
        <div class="btn-row"><a class="btn" href="/contact#ai-licensing">Contact our team</a></div>
      </div></section>`
    },
    {
      path: "/about",
      title: "About Credtent",
      description: "Credtent, Inc. is a Delaware Public Benefit Corporation founded by E.R. Burgess and Dr. Galen Buckwalter.",
      eyebrow: "About",
      h1: "About Credtent",
      capsule: CAPSULE.about,
      lede: "More choice. Wider participation. We help creatives and AI companies find constructive ways to work together through choice, consent, credit, and compensation.",
      crumbs: [{ name: "About Credtent", href: "https://credtent.com/about" }],
      extraLd: [
        {
          "@type": "Person",
          "@id": "https://credtent.com/about#eric-r-burgess",
          name: "E.R. Burgess",
          jobTitle: "Founder and CEO",
          worksFor: { "@id": ORG_ID },
          url: "https://credtent.com/about",
          image: "https://credtent.com/media/eric-640.webp",
          sameAs: ["https://www.linkedin.com/in/erburgess"]
        },
        {
          "@type": "Person",
          "@id": "https://credtent.com/about#galen-buckwalter",
          name: "Dr. Galen Buckwalter",
          jobTitle: "Co-Founder and Chief Science Officer",
          worksFor: { "@id": ORG_ID },
          url: "https://credtent.com/about",
          image: "https://credtent.com/media/galen-256.webp",
          sameAs: ["https://www.linkedin.com/in/j-galen-buckwalter-04139510"]
        }
      ],
      faq: [
        { q: "What kind of company is Credtent?", a: "Credtent, Inc. is a Delaware Public Benefit Corporation." },
        { q: "Who founded Credtent?", a: "E.R. Burgess is Founder and CEO. Dr. Galen Buckwalter is Co-Founder and Chief Science Officer." },
        { q: "Where is Credtent based?", a: "Credtent, Inc. is at 1822 E. Route 66, Suite A353, Glendora, California 91740." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><h3>Human judgment</h3><p>Use AI with curiosity while keeping creative skills, agency, and responsibility strong.</p></article>
        <article class="card"><h3>Neutral role</h3><p>Help content owners and AI companies understand each other's needs and agree clear terms.</p></article>
        <article class="card"><h3>Shared opportunity</h3><p>Make room for more people to participate in the AI economy and the value their work creates.</p></article>
      </div></section>
      <section class="section"><div class="wrap prose">
        <p class="eyebrow">The origin</p>
        <h2>Why was Credtent founded?</h2>
        <p>Credtent exists because the AI economy is not a zero-sum game. Creatives and AI companies need each other, and they need a neutral place to do business together, ethically, legally, and profitably.</p>
        <p>The problem Credtent solves was visible long before it became a headline. For more than eight years, our team researched creative IP, digital rights, and the coming collision between AI's demand for training data and intellectual property law. By the time AI content licensing reached the mainstream, Credtent already had a thesis, a model, and a growing set of partners. We weren't reacting to a crisis. We were preparing for one we could see coming.</p>
        <h2>What is Credtent's mission?</h2>
        <p>To bring AI and creativity together ethically, legally, and profitably. We hold every decision to that. If a deal does not work for the creative side, it does not get made. If a policy does not work for the AI side, we redesign it. The goal is not to referee a fight but to build the infrastructure that makes the fight unnecessary.</p>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <p class="eyebrow">What we stand for</p>
        <h2>Credtent works only if both sides trust it completely.</h2>
        <p class="lede">Every structural, legal, and financial decision traces back to that.</p>
        <div class="grid-3" style="margin-top:24px">
          <article class="card"><p class="kicker">01</p><h3>Structural neutrality</h3><p>We don't train models. We don't compete with AI companies. We don't publish content. Our only business is connecting both sides on fair terms.</p></article>
          <article class="card"><p class="kicker">02</p><h3>Rights holders first</h3><p>The 85/15 split reflects our belief that the people who made the content that trains AI deserve most of the value it creates.</p></article>
          <article class="card"><p class="kicker">03</p><h3>Ethical by design</h3><p>Opt-outs are free, always. License terms include anti-plagiarism guardrails. Compliance documentation is standard, not optional.</p></article>
        </div>
        <div class="grid-3" style="margin-top:24px">
          <article class="card"><h3>Delaware Public Benefit Corporation</h3><p>Legally obligated to serve a public benefit alongside profit. Our benefit purpose is protecting creative rights in the AI economy.</p></article>
          <article class="card"><h3>85/15 revenue split</h3><p>85% of licensing revenue goes to creatives, rights holders, and data providers.</p></article>
          <article class="card"><h3>8+ years of research</h3><p>Research as a service, carried out with a rigorous scientific method.</p></article>
        </div>
      </div></section>
      <section class="section section-white" id="who"><div class="wrap prose">
        <p class="eyebrow">Who Credtent is</p>
        <h2>E.R. Burgess and the company he founded.</h2>
        <p>Credtent connects AI companies and the creative industries through licensing, so AI solutions are ethical and commercially safe.</p>
<p>E.R. Burgess founded Credtent after more than eight years of research into creative rights and data provenance, well before the public AI debate grew loud. The starting idea was simple: AI and human creativity can work together, ethically, legally, and profitably, when the people who make the work are paid and their consent is on record.</p>
<p>E.R. Burgess brings over 30 years of industry experience. He is also a published tabletop game designer, with card, board, and role-playing games to his name. He leads Credtent as Founder and CEO, alongside Co-Founder and Chief Science Officer Dr. Galen Buckwalter.</p>
<p>Our mission is to bring AI and creativity together ethically, legally, and profitably. Credtent, Inc. is a Delaware Public Benefit Corporation and a Certified B Corp, so protecting creative rights in the AI economy is part of how the company is built.</p>
      </div></section>
      <section class="section"><div class="wrap">
        <p class="eyebrow">The people behind the work</p>
        <h2>The Credtent team</h2>
        <p class="lede">E.R. Burgess, Dr. Galen Buckwalter, Edmond Allmond, Abigail Cameron, Carmen Sinata, Freddy Mota, Michael Thompson, Raymond Jia, Jim Li, and Colin Devenish.</p>
        <div class="team" style="margin-top:24px">
          <article class="person">${picture(images.eric, { sizes: "240px" })}<h3>E.R. Burgess</h3><p class="role">Founder and CEO</p><p><a href="https://www.linkedin.com/in/erburgess">E.R. Burgess on LinkedIn</a></p></article>
          <article class="person">${picture(images.galen, { sizes: "240px" })}<h3>Dr. Galen Buckwalter</h3><p class="role">Co-Founder and Chief Science Officer</p><p><a href="https://www.linkedin.com/in/j-galen-buckwalter-04139510">Galen on LinkedIn</a></p></article>
          <article class="person"><img src="/media/placeholder-ea.svg" width="480" height="480" alt="" data-placeholder="headshot"><h3>Edmond Allmond</h3><p class="role">Chief Partnerships Officer</p></article>
          <article class="person">${picture(images.abigail, { sizes: "240px" })}<h3>Abigail Cameron</h3><p class="role">Engineering</p></article>
          <article class="person">${picture(images.carmen, { sizes: "240px" })}<h3>Carmen Sinata</h3><p class="role">Onboarding</p></article>
          <article class="person">${picture(images.freddy, { sizes: "240px" })}<h3>Freddy Mota</h3><p class="role">Operations</p></article>
          <article class="person">${picture(images.michael, { sizes: "240px" })}<h3>Michael Thompson</h3><p class="role">Revenue</p></article>
          <article class="person">${picture(images.raymond, { sizes: "240px" })}<h3>Raymond Jia</h3><p class="role">Technology</p></article>
          <article class="person">${picture(images.jim, { sizes: "240px" })}<h3>Jim Li</h3><p class="role">Technology</p></article>
          <article class="person">${picture(images.colin, { sizes: "240px" })}<h3>Colin Devenish</h3><p class="role">Sales</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <p class="eyebrow">Writing and ideas</p>
        <h2>Keep the conversation going.</h2>
        <p class="lede">Explore writing on human creativity, judgment, and the choices that shape AI.</p>
        <div class="grid-2" style="margin-top:20px">
          <article class="card"><p class="kicker">From the current writing index</p><h3>The Creative Fatalism Trap in the Age of AI</h3><p><a href="https://medium.com/credtent-on-content/the-creative-fatalism-trap-in-the-age-of-ai-e486ba739818">Read on Medium</a></p></article>
          <article class="card"><p class="kicker">From the current writing index</p><h3>Human-Composed: Why AI Creation and Human Creativity Remain Fundamentally Different</h3><p><a href="https://credtent.substack.com/p/human-composed-why-ai-creation-and">Read on Credtent's Substack</a></p></article>
          <article class="card"><h3>Credtent's publication</h3><p>Company perspectives on consent, creativity, and the AI economy.</p><p><a href="https://credtent.substack.com/">Visit Credtent's Substack</a></p></article>
          <article class="card"><h3>E.R. Burgess's personal Substack</h3><p>Burgessing on Content, Board Games and Other Things.</p><p><a href="https://burgessing.substack.com/">Visit E.R. Burgess's personal Substack</a></p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>Want to work with us?</h2>
        <p>Whether you're an AI company, a rights holder, or an investor, we'd like to talk.</p>
        <div class="btn-row"><a class="btn" href="/ai-companies">AI companies</a><a class="btn btn-ghost" href="/content-owners">Content partners</a><a class="btn btn-ghost" href="https://app.credtent.org/inquiries/investor">Investors</a></div>
        <h2>How can we help?</h2>
        <p>For questions about opt-out, auditing, valuation, or licensing, contact <a href="mailto:hello@credtent.org">hello@credtent.org</a>.</p>
        ${ADDRESS_HTML}
        <div class="btn-row"><a class="btn" href="/contact">Contact Credtent</a></div>
      </div></section>
      <section class="section section-tint" id="collaborithmic-age">
        <div class="wrap split">
          <div>
            <p class="eyebrow">The Collaborithmic Age</p>
            <h2>Understand how creativity and AI can work together.</h2>
            <p class="lede">By E.R. Burgess, Credtent CEO and creative technologist. Drawing on years of content valuation and two and a half years developing full-cycle AI licensing, Burgess explores how to use AI, understand the value of your work, and keep your creative skills and judgment strong.</p>
            <div class="btn-row"><a class="btn" href="https://collaborithmic.com/">Explore the book</a></div>
            ${editions()}
          </div>
          <div>
            <p>The book site is separate. These are the published collaborithmic.com prices.</p>
          </div>
        </div>
      </section>`
    },
    {
      path: "/contact",
      title: "Contact Credtent",
      description: "AI companies can use the licensing form. Content owners start an inquiry in the app. Other questions open an email.",
      eyebrow: "Contact",
      h1: "Start a conversation.",
      capsule: "AI companies can use the licensing form on this page. Content owners start an inquiry in the app. Valuation, citation licensing, and other notes still open an email to hello@credtent.org.",
      crumbs: [{ name: "Contact", href: "https://credtent.com/contact" }],
      faq: [
        { q: "Which email should companies use?", a: "Write to hello@credtent.org." },
        { q: "Where is Credtent?", a: "Credtent, Inc. is at 1822 E. Route 66, Suite A353, Glendora, California 91740." }
      ],
      main: `<section class="section section-white"><div class="wrap">
        <div class="grid-2">
          <div id="ai-licensing">
            <h2>AI companies</h2>
            <p>Licensing inquiry for teams training models or using licensed work in AI answers.</p>
            ${tallyEmbed({ id: "BzbXK7", title: "AI Company Licensing Inquiry" })}
          </div>
          <div id="content-partners">
            <h2>Content owners</h2>
            <p>Tell us about your catalog, the rights you hold, and the uses you want to offer.</p>
            <div class="btn-row"><a class="btn" href="${CONTENT_PARTNER_INQUIRY}">Talk with us</a></div>
          </div>
        </div>
        <div class="grid-2" id="other" style="margin-top:36px">
          <div>
            <h2>Valuation, citation licensing, or another question</h2>
            ${inquiryForm({
              subject: "Credtent inquiry",
              submitLabel: "Send",
              note: "Sending opens an email to hello@credtent.org.",
              fields: `<label>Name <input name="name" type="text" autocomplete="name" required></label>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Topic
            <select name="topic">
              <option>Valuation</option>
              <option>Citation licensing</option>
              <option>Something else</option>
            </select>
          </label>
          <label>Message <textarea name="message" required></textarea></label>`
            })}
          </div>
          <div>
            <p><a href="mailto:hello@credtent.org">hello@credtent.org</a></p>
            ${ADDRESS_HTML}
          </div>
        </div>
      </div></section>`
    },
    {
      path: "/pricing",
      title: "Pricing | Credtent",
      description: "Custom licensing for AI companies, 85/15 revenue terms for content partners, a free opt-out for creatives, and published plan prices.",
      eyebrow: "Pricing",
      h1: "Pricing that scales with you.",
      capsule: "AI companies license through custom agreements priced per deal. Content partners keep 85% of every licensing deal Credtent closes, and a platform fee applies. Creatives can opt out for free, or license their work for US$49 a year, with periodic AI model audits included, under a promotion for individual creatives who sign up by December 31, 2026.",
      crumbs: [{ name: "Pricing", href: "https://credtent.com/pricing" }],
      faq: [
        { q: "How much does Credtent cost?", a: "It depends on which side of the market you are on. AI companies pay for custom licensing priced per deal. Content partners keep 85% of every licensing deal Credtent closes, with Credtent keeping 15%, and a platform fee applies. Individual creatives can opt out for free, enroll their works in periodic AI model audits with Opt-Out Premium, or license their work with a licensing plan." },
        { q: "How much does Credtent cost for AI companies?", a: "There is no fixed public price. Licenses are custom agreements scoped to the content, the license type, and the size of the organization, and each one includes a disclosure pack. Pricing is set in a scoping conversation, not from a rate card." },
        { q: "How much does Credtent cost for content partners?", a: "A platform fee applies, and Credtent keeps 15% of each licensing deal it closes and sends the other 85% to the rights holder under the Starter Partner terms. The Organization License keeps the same split and adds more services for larger catalogs, and Enterprise is priced to the catalog." },
        { q: "What does Opt-Out Premium for rights holders cost?", a: "It starts at US$299 a year and scales with catalog size. It enrolls the works in periodic AI model audits and does not include licensing." },
        { q: "What does licensing cost for individual creatives?", a: "US$49 a year for individual creatives who sign up by December 31, 2026, with licensing, the opt-out, and periodic AI model audits included. Creatives who sign up during the promotion keep US$49 a year through 2028 while the subscription stays active, then move to the regular price, which becomes US$99 in 2027. Rejoining after a lapse or cancellation is at the regular price. Rights holders who publish or represent many creatives use Rights-Holder Licensing, from US$299 a year." },
        { q: "What does the book cost?", a: "The published collaborithmic.com prices are $14.99 for the e-book, $24.99 for the paperback, and $49 for the living e-book." }
      ],
      main: `<section class="section section-white"><div class="wrap">
        <p class="eyebrow">AI companies</p>
        <h2>Licensing scoped to the deal.</h2>
        <p class="lede">Licensing fees are scoped to each deal, based on how much content, the license type, and the size of your organization. There's no public price list because no two deals are the same. What we can promise: neutral terms and compliance documentation included.</p>
        <div class="grid-3" style="margin-top:24px">
          <article class="card"><h3>Content scope</h3><p>Pricing follows the size and breadth of the collection, from a single subject area to full multi-format catalog access.</p></article>
          <article class="card"><h3>License type</h3><p>Each license is scoped to the named collection and use. A disclosure pack is included.</p></article>
          <article class="card"><h3>Organization type</h3><p>Startups, growth-stage companies, and frontier labs are priced differently.</p></article>
        </div>
        <div class="btn-row"><a class="btn" href="/contact#ai-licensing">Schedule a licensing call</a></div>
      </div></section>
      <section class="section"><div class="wrap">
        <p class="eyebrow">Content partners</p>
        <h2>You keep 85% of every deal we close.</h2>
        <p class="lede">The tier you choose sets the level of service and support. Partners earn when Credtent closes a deal.</p>
        <div class="grid-3" style="margin-top:24px">
          <article class="card"><p class="kicker">For individual rights holders</p><h3>Starter Partner</h3><p><span class="price">85/15</span></p><ul><li>Catalog registration and provenance certification</li><li>Matching with AI companies</li><li>Quarterly royalty payments</li><li>Standard usage reporting</li></ul><p><a href="https://app.credtent.org/inquiries/content-partner">Contact us</a></p></article>
          <article class="card"><p class="kicker">For guilds, publishers, and studios</p><h3>Organization License</h3><p><span class="price">85/15</span> plus premium</p><ul><li>Everything in Starter Partner</li><li>Bulk catalog intake and metadata tools</li><li>Priority deal placement</li><li>A dedicated account manager</li><li>Audit-ready reporting on demand</li></ul><p><a href="https://app.credtent.org/inquiries/content-partner">Talk with us</a></p></article>
          <article class="card"><p class="kicker">For large catalogs and data providers</p><h3>Enterprise</h3><p><span class="price">Custom</span></p><ul><li>Everything in Organization License</li><li>Custom API and data pipeline integration</li><li>Dedicated legal advice</li><li>Fully bespoke onboarding</li></ul><p><a href="https://app.credtent.org/inquiries/content-partner">Contact us</a></p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <p class="eyebrow">Individual creatives</p>
        <h2>A free way to say no, and room to grow.</h2>
        <p class="lede">Every creative gets a free path to opt out. Add Opt-Out Premium to enroll your works in periodic AI model audits, or choose a licensing plan to earn from AI licensing.</p>
        <div class="grid-4" style="margin-top:24px">
          <article class="card"><p class="kicker">For every creative</p><h3>Opt-Out Free</h3><p><span class="price">$0</span> forever</p><ul><li>Add your name and works to the opt-out list</li><li>Include your website or specific pages</li><li>Each opt-out notice recorded with its delivery date</li></ul><p><a href="https://credtent.org/opt-out">Get started</a></p></article>
          <article class="card"><p class="kicker">For rights holders who want audits</p><h3>Opt-Out Premium for rights holders</h3><p>From <span class="price">US$299</span> a year, scaling with catalog size</p><ul><li>Everything in Opt-Out Free</li><li>Works enrolled in periodic AI model audits</li><li>Does not include licensing</li></ul><p><a href="https://credtent.org/premium">Read about Opt-Out Premium</a></p></article>
          <article class="card"><p class="kicker">For individual creatives ready to license</p><h3>Licensing for individuals</h3><p><span class="price">US$49</span> a year, promotional price for sign-ups through December 31, 2026</p><p class="small">Creatives who sign up during the promotion keep US$49 a year through 2028 while the subscription stays active, then move to the regular price, which becomes US$99 in 2027. Rejoining after a lapse or cancellation is at the regular price.</p><ul><li>Everything in Opt-Out Premium</li><li>Upload your content</li><li>Content valuation</li><li>Listing in the Credtent marketplace</li></ul><p><a href="https://app.credtent.org/">Get started</a></p></article>
          <article class="card"><p class="kicker">For publishers and representatives</p><h3>Rights-Holder Licensing</h3><p>From <span class="price">$299</span> a year</p><ul><li>Everything in licensing for individuals</li><li>Bring in work by the creatives you publish or represent</li><li>Each creative is credited for their own work</li><li>Sales-assisted pricing for larger catalogs</li></ul><p><a href="https://app.credtent.org/">Get started</a></p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap">
        <div class="grid-2">
          <article class="card"><h3>The Collaborithmic Age</h3><ul class="editions">
    <li><p class="kicker">Standard e-book</p><p><span class="price">$14.99</span></p><p>A standalone digital edition. Quarterly updates are not included.</p></li>
    <li><p class="kicker">Paperback</p><p><span class="price">$24.99</span></p><p>A standalone printed edition. Quarterly updates are not included.</p></li>
    <li><p class="kicker">Living e-book</p><p><span class="price">$49</span></p><p>The digital book with quarterly updates included.</p></li>
  </ul><p><a href="https://collaborithmic.com/">Explore the book</a></p></article>
          <article class="card"><h3>Need something different?</h3><p>Whether you're an AI company with unusual content needs or a content partner with a complex catalog, let's figure it out together.</p><div class="btn-row"><a class="btn" href="/contact#ai-licensing">AI companies</a><a class="btn btn-ghost" href="https://app.credtent.org/inquiries/content-partner">Content partners</a></div></article>
        </div>
        <p class="fine">Questions about pricing? Read the <a href="/faq">FAQ</a> or write to <a href="mailto:hello@credtent.org">hello@credtent.org</a>.</p>
      </div></section>`
    },
    {
      path: "/faq",
      title: "Corporate FAQ | Credtent",
      description: "Answers for AI companies and content owners on licensing scope, documentation, and valuation limits.",
      eyebrow: "FAQ",
      h1: "Answers for companies and content owners.",
      capsule: "Licenses name the works and the rights the contracting holders warranted. A valuation is a starting point, not a guaranteed price.",
      crumbs: [{ name: "FAQ", href: "https://credtent.com/faq" }],
      faq: [
        { q: "What is Credtent?", a: "Credtent connects AI companies and the creative industries through licensing, so AI solutions are ethical and commercially safe. Creatives and rights holders register their work for opt-out, licensing, or both. Credtent builds no AI models and takes no equity in either side." },
        { q: "What does a Credtent license cover?", a: LICENSE_SENTENCE },
        { q: "What about content we already trained on?", a: "We can structure a going-forward license plus a covenant not to sue from the rights holders who sign, covering the named works. That is not a release from everyone else, and it is not a regulator cure." },
        { q: "How long does a deal take?", a: "A 20-minute scoping call leads to a proposal within 5 business days. Most deals close in 2 to 6 weeks, depending on the content and how many rights holders are involved. Single-catalog deals close faster; larger, multi-format collections take longer." },
        { q: "Why license instead of scraping public content?", a: "Because the legal risk is real and growing. Active court cases are testing the use of scraped training data, and new disclosure rules leave a paper trail that makes undocumented scraping visible. Ignoring a registered opt-out also becomes a documented record." },
        { q: "How should we read a valuation?", a: CAPSULE.valuation },
        { q: "Do I give up ownership of my content?", a: "No. Credtent acts as a licensing agent, not a publisher or co-owner. You keep full ownership of everything you list. Credtent holds only limited representation rights for AI licensing, and you can end that at any time. Listing does not transfer copyright, exclusivity, or any ownership to Credtent." },
        { q: "How does the revenue split work?", a: "Every licensing deal Credtent closes sends 85% of gross revenue to the rights holders and data providers whose content was licensed. Credtent keeps 15% for its platform, legal work, compliance tools, and operations. The split is on gross revenue, not net." },
        { q: "When do I get paid?", a: "Credtent pays royalties quarterly. Each payment comes with a usage report showing which licensees used your catalog and how much, so you can see which deals earned your share." },
        { q: "Can I choose which AI companies license my content?", a: "Yes. When you register your catalog, you set limits by vertical, use case, and type of application. You can exclude specific licensees or whole categories, and every deal needs your approval before it goes ahead." },
        { q: "What kinds of content can I list?", a: "Text, audio, video, images, and structured data, across education, healthcare, sports, entertainment, and media. You can register a mixed-format catalog in one place." },
        { q: "Is Credtent tied to any AI company or big-tech platform?", a: "No. Credtent does not build models, take equity positions, or share data outside of licensed transactions." },
        { q: "Where is Credtent incorporated?", a: "Credtent, Inc. is a Delaware Public Benefit Corporation. Its stated public benefit is protecting creative rights in the AI economy, alongside financial returns." },
        { q: "Where do creative opt-out questions live?", a: "Questions about the free opt-out, what it can and cannot do, and switching to licensing later are answered at credtent.org/opt-out and credtent.org/resources/opt-out-limitations." },
        { q: "I have a question that isn't here.", a: "We're happy to help. Write to hello@credtent.org." }
      ],
      main: `<section class="section"><div class="wrap prose"><p>The questions above are the corporate set. For creatives, start with the <a href="https://credtent.org/opt-out">free opt-out</a> and the <a href="https://credtent.org/resources/opt-out-limitations">opt-out limitations FAQ</a>.</p></div></section>`
    },
    {
      path: "/certified-publisher",
      title: "Creative Origin for publishers | Credtent",
      description: "Expert review of the editorial process behind published work. Not an automated detector score.",
      eyebrow: "Creative Origin",
      h1: "Expert review of how work is made.",
      capsule: "Creative Origin certification reviews an organization's editorial process. It is not an automated detector score and it does not promise a legal outcome.",
      crumbs: [{ name: "Creative Origin", href: "https://credtent.com/certified-publisher" }],
      faq: [
        { q: "Is Creative Origin an automated score?", a: "No. AI detectors score finished text for statistical signatures and can be fooled. Credtent reviews the editorial process behind the content: who wrote it, who edited it, what tools were used, and how oversight was kept at every stage. A self-declared badge from the badge builder is a disclosure, not this review." },
        { q: "Does certification require that no AI was used?", a: "No. If AI tools were used anywhere in the process, they are identified and disclosed in the certification record. Transparency is required; absence of AI is not." },
        { q: "How long does certification take to start?", a: "Our reviewer team contacts you within five business days of receiving your process documentation, and comes back with a certification scope and fee estimate." },
        { q: "Where is the free badge?", a: "The free badge builder stays on credtent.org." }
      ],
      main: `<section class="section section-white"><div class="wrap split">
        <div class="prose">
          <p class="eyebrow">What the badge means</p>
          <h2>A verified process, not just a score.</h2>
          <p>The Creative Origin badge certifies that published content was conceived, written, and edited by human authors and editors. Credtent's independent reviewers verified the process behind it, not just the finished text. It is not an AI detector and not a checklist. It is a verified record of human craft.</p>
          <p>The review is about process and disclosure, not a promise that every future work is human-made, and it does not promise a legal outcome.</p>
        </div>
        <ul class="check-list">
          <li>Human-authored and human-edited content</li>
          <li>Expert review at every editorial stage</li>
          <li>Clear disclosure of any AI tool use</li>
          <li>An audit-ready editorial chain of custody</li>
          <li>A verified organizational process, not a single piece</li>
          <li>Annual renewal as standards change</li>
        </ul>
      </div></section>
      <section class="section"><div class="wrap">
        <h2>What does a Creative Origin review check?</h2>
        <div class="grid-3" style="margin-top:20px">
          <article class="card"><h3>Human authorship</h3><p>Reviewers confirm the content was conceived and written by human authors. Author attestations are kept in the certification record.</p></article>
          <article class="card"><h3>Editorial process</h3><p>We review the full editorial workflow: assignment, drafting, editing, fact-checking, and publication.</p></article>
          <article class="card"><h3>AI use disclosed</h3><p>Any AI tools used in the process are identified and disclosed in the certification record.</p></article>
          <article class="card"><h3>An independent reviewer</h3><p>Reviews are carried out by Credtent-trained practitioners from editorial, journalism, and media backgrounds. You get a named reviewer, not a queue.</p></article>
          <article class="card"><h3>A public record</h3><p>Every badge links to a public certification record in the Credtent registry, so readers, buyers, and platforms can check it.</p></article>
          <article class="card"><h3>Annual renewal</h3><p>Renewal keeps the certification current and the badge valid across distribution partners and platforms.</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>Who does Credtent certify?</h2>
        <p class="lede">Any organization that publishes human-authored work, across media, journalism, trade publications, newsletters, and digital content.</p>
        <div class="grid-3" style="margin-top:20px">
          <article class="card"><h3>Trade and specialty media</h3><p>Industry publications, trade magazines, and vertical outlets that publish expert editorial content.</p></article>
          <article class="card"><h3>News and journalism</h3><p>Digital newsrooms, regional papers, and independent journalism committed to human reporting and editorial accountability.</p></article>
          <article class="card"><h3>Books and long-form publishing</h3><p>Trade publishers, academic presses, and independent houses. Credtent certifies publisher editorial processes today; certification for individual books is in development.</p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap">
        <h2>How does certification work?</h2>
        <div class="steps" style="margin-top:20px">
          <article class="step"><p class="kicker">01</p><h3>Submit your process</h3><p>Provide editorial process documentation, author or editor attestations, and your AI use policy. Our reviewers contact you within five business days.</p></article>
          <article class="step"><p class="kicker">02</p><h3>Expert review</h3><p>A Credtent-trained practitioner checks your documentation against the Creative Origin standard.</p></article>
          <article class="step"><p class="kicker">03</p><h3>Certification decision</h3><p>You receive a detailed review letter. Certified organizations get a badge, a public registry record, and display rights.</p></article>
          <article class="step"><p class="kicker">04</p><h3>Annual renewal</h3><p>Renewal keeps your certification current as standards change.</p></article>
        </div>
      </div></section>
      <section class="section section-white"><div class="wrap prose">
        <h2>Why Credtent?</h2>
        <p>Credtent is a Delaware Public Benefit Corporation. We don't publish, we don't train AI models, and we don't compete with any organization we certify, so we have no reason to pass or fail any applicant.</p>
        <p>The Writers Guild of America reviewed Credtent's certification process and accepted it. WGA members receive a discount on certification fees.</p>
        <p>Creative Origin is one of three Credtent badge systems. It answers one question: was this made by people? Creative Consent covers platforms, and Commercial Safety covers AI companies. See the <a href="https://credtent.org/badges/">badge systems overview</a>, or make a free self-declared disclosure badge with the <a href="https://credtent.org/badge-builder">badge builder</a>. Creative Origin also sits alongside <a href="https://credtent.org/creative-consent">Creative Consent</a> for platforms.</p>
        <h2>Tell us about your editorial process.</h2>
        <p>Describe your organization, content type, and editorial workflow. Our reviewers will come back with a certification scope and fee estimate within five business days, with no commitment.</p>
        <div class="btn-row"><a class="btn" href="/contact#other">Tell us about your editorial process</a></div>
        <p class="small">Prefer email? Write to <a href="mailto:publishers@credtent.org">publishers@credtent.org</a>. Creative Origin for publishers lives on credtent.com. credtent.org/certified-publisher redirects here.</p>
      </div></section>`
    }
  ];
}
