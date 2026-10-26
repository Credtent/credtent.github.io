import { ADDRESS_HTML, BOOK, CAPSULE, LICENSE_SENTENCE, OPT_OUT_FLOW, SIGN_UP, price } from "./copy.mjs";
import { ORG_ID, diagramHtml, figure, picture } from "./render.mjs";

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
  const preload = (key) => `<link rel="preload" as="image" href="${images[key].base}-${images[key].widths.at(-1)}.avif" type="image/avif" imagesrcset="${images[key].widths.map((w) => `${images[key].base}-${w}.avif ${w}w`).join(", ")}" imagesizes="(min-width: 1000px) 520px, 100vw" fetchpriority="high">`;

  return [
    {
      path: "/",
      title: "Credtent | A neutral marketplace for content owners and AI companies",
      description: "Credtent bridges content owners and AI companies through consent, licensing, and compensation.",
      eyebrow: "Connecting creativity and AI",
      h1: "Creative work.<br>Clear AI permissions.<br>Value for both.",
      capsule: CAPSULE.comHome,
      lede: "Credtent bridges content owners and AI companies through consent, licensing, and compensation.",
      actions: `<div class="btn-row"><a class="btn" href="${SIGN_UP}">Sign up</a><a class="btn btn-ghost" href="/contact">Contact us</a></div>`,
      media: hero("bridge", { priority: true }),
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
          <h2>A neutral marketplace connecting content owners and AI companies.</h2>
          <p class="lede">We help content owners and AI companies define permitted uses, assess value, and agree terms that reflect both sides' needs.</p>
          <div class="grid-2" style="margin-top:28px">
            <article class="card">
              ${hero("editor", { sizes: "(min-width: 1000px) 480px, 100vw" }).replace('class="shot"', 'class="shot"')}
              <p class="kicker">Content owners</p>
              <h3>Choose what to license</h3>
              <p>For authors, publishers, studios, archives, and data providers. Choose what to license, agree on terms, get paid.</p>
              <p><a href="/content-owners">Explore content-owner options</a></p>
            </article>
            <article class="card">
              ${hero("aiTeam", { sizes: "(min-width: 1000px) 480px, 100vw" })}
              <p class="kicker">AI companies</p>
              <h3>Find content for training and AI answers</h3>
              <p>Agree the rights, documentation, and compensation for its use.</p>
              <p>${LICENSE_SENTENCE}</p>
              <p><a href="/ai-training">Explore AI training licensing</a></p>
            </article>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <p class="eyebrow">Content valuation</p>
          <h2>Understand your content's value. Explore your licensing options.</h2>
          <p class="lede">Before a first agreement, after an initial deal, or when considering new opportunities: start with an informed assessment. A baseline valuation comes when you add content. Optional paid custom valuation provides a deeper assessment. You can obtain a valuation independently, then choose whether to seek help finding licensing partners.</p>
          <h3 style="margin-top:28px">The context behind a valuation</h3>
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
        <div class="wrap split">
          <div>
            <p class="eyebrow">Full-cycle licensing</p>
            <h2>Agree how AI can use your content.</h2>
            <p class="lede">We help content owners and AI companies agree what can be used, how it can be used, and how it is paid for.</p>
            <h3 style="margin-top:22px">AI training rights</h3>
            <p>License a defined corpus with documented origins and quality criteria. Set training scope and compensation, with agreed access to new work from creatives and subject-matter experts.</p>
            <p><a href="/ai-training">Explore training licensing</a></p>
            <h3 style="margin-top:22px">Use in AI answers</h3>
            <p>Generative Results Referencing (GRR) sets excerpt limits, attribution, source links, and compensation for licensed appearances, including those without a click.</p>
            <p><a href="/citation-licensing">Explore citation licensing</a></p>
            <p class="fine">Training and display permissions are agreed separately. Source visits are a goal, not a guarantee.</p>
          </div>
          ${hero("podcast", { sizes: "(min-width: 1000px) 520px, 100vw" })}
        </div>
      </section>
      ${bookBand()}`
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
      actions: `<div class="btn-row"><a class="btn" href="/contact">Talk with us</a><a class="btn btn-ghost" href="${SIGN_UP}">Sign up</a></div>`,
      media: hero("editor", { priority: true }),
      preload: preload("editor"),
      faq: [
        { q: "Do I give up ownership?", a: "Listing with Credtent does not transfer copyright. You approve the uses and the agreement." },
        { q: "Can I get a valuation without a licensing mandate?", a: "Yes. Obtain a valuation independently, then decide whether you want help finding licensing partners." },
        { q: "Where do individual creatives opt out?", a: "Free opt-out for creatives lives on credtent.org and does not require a licensing agreement." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><h3>Valuation</h3><p>An informed starting point before a price conversation. No public score or guaranteed transaction price.</p><p><a href="/valuation">Explore content valuation</a></p></article>
        <article class="card"><h3>Training licensing</h3><p>Define the corpus, the rights, and access to new work.</p><p><a href="/ai-training">Explore training licensing</a></p></article>
        <article class="card"><h3>Citation licensing</h3><p>Set excerpt limits, attribution, and compensation when work appears in AI answers.</p><p><a href="/citation-licensing">Explore citation licensing</a></p></article>
      </div></section>`
    },
    {
      path: "/ai-companies",
      title: "For AI companies | Credtent",
      description: "License a defined corpus with a named manifest and a disclosure pack. The statutes still bind the developer.",
      eyebrow: "AI companies",
      h1: "License content for training and AI answers.",
      capsule: CAPSULE.training,
      lede: LICENSE_SENTENCE,
      crumbs: [{ name: "AI companies", href: "https://credtent.com/ai-companies" }],
      actions: `<div class="btn-row"><a class="btn" href="/ai-training">Discuss training licensing</a><a class="btn btn-ghost" href="/contact">Contact us</a></div>`,
      media: hero("aiTeam", { priority: true }),
      preload: preload("aiTeam"),
      extraLd: [serviceNode("https://credtent.com/ai-companies#service", "Licensing for AI companies", CAPSULE.training)],
      faq: [
        { q: "What does a Credtent license cover?", a: LICENSE_SENTENCE },
        { q: "What about content a model already used?", a: "We can structure a going-forward license plus a covenant not to sue from the rights holders who sign, covering the named works. That is not a release from everyone else, and it is not a regulator cure." },
        { q: "Does display permission include training?", a: "No. Training and display permissions are agreed separately. A source link alone does not establish training permission." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-2">
        <article class="card"><h3>AI training licensing</h3><p>A defined corpus, documented origins, scope, compensation, and access to new work.</p><p><a href="/ai-training">Read how training licensing works</a></p></article>
        <article class="card"><h3>Citation licensing</h3><p>Excerpt limits, attribution, source links, and compensation for licensed appearances.</p><p><a href="/citation-licensing">Read how citation licensing works</a></p></article>
      </div></section>`
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
        <article class="card"><h3>Auditing</h3><p>Monthly observation of model responses for Opt-Out Premium.</p><p><a href="https://credtent.org/resources/auditing">Read how auditing works</a></p></article>
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
      actions: `<div class="btn-row"><a class="btn" href="/contact">Explore citation licensing</a><a class="btn btn-ghost" href="/contact">Contact us</a></div>`,
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
          <article class="card"><h3>For AI companies</h3><p>Secure clear permissions, provide accurate attribution, agree compensation, and respond to creative notices.</p><p><a href="/contact">Talk about citation licensing</a></p></article>
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
      extraLd: [serviceNode("https://credtent.com/valuation#service", "Content valuation", CAPSULE.valuation)],
      faq: [
        { q: "Is a valuation a price?", a: "No. An estimate is not a guaranteed transaction price or an established industry standard. The parties agree the final price." },
        { q: "What is the difference between baseline and custom?", a: "A baseline valuation comes when content is added. Optional paid custom valuation goes deeper into catalog, evidence, and intended use." },
        { q: "Will I see a numeric score?", a: "No. The diagram shows qualitative inputs only. Credtent does not publish weights, scores, or valuation figures." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><p class="kicker">Before a first agreement</p><h3>Start informed.</h3><p>Assess your work and intended use before discussing pricing and permissions.</p></article>
        <article class="card"><p class="kicker">After an initial deal</p><h3>Reassess the value.</h3><p>Consider what has changed in your catalog, audience, evidence, or the proposed AI use.</p></article>
        <article class="card"><p class="kicker">For new opportunities</p><h3>Explore more options.</h3><p>Evaluate additional licensing possibilities and how they fit your existing agreements.</p></article>
      </div></section>
      <section class="section"><div class="wrap grid-2">
        <article class="card"><h3>Baseline valuation</h3><p>Credtent provides a baseline valuation when content is added. It gives the licensing conversation an informed starting point.</p></article>
        <article class="card"><h3>Paid custom valuation</h3><p>Optional deeper assessment considers your catalog, supported evidence, intended AI use, and the questions you need answered.</p><p><a href="/contact">Discuss a custom assessment</a></p></article>
      </div></section>
      <section class="section section-white"><div class="wrap">
        <h2>More than volume or tokens.</h2>
        <p class="lede">Assessment considers intended AI use alongside creative-side evidence. Different uses and rights can change the value discussion.</p>
        <div class="grid-3" style="margin-top:22px">
          <article class="card"><h3>Creative significance</h3><p>Cultural significance, subject-matter expertise, distinctive perspective, and other supported indicators.</p></article>
          <article class="card"><h3>Audience and recognition</h3><p>Audience reception, awards, and relevant third-party evidence, with appropriate sources and context.</p></article>
          <article class="card"><h3>Scope and intended use</h3><p>The proposed AI use, rights requested, limitations, and the content available for that agreement.</p></article>
        </div>
        <h3 style="margin-top:28px">The context behind a valuation</h3>
        ${diagramHtml()}
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>An estimate supports a conversation.</h2>
        <p>The assessment should identify evidence, assumptions, scope, and uncertainty. An estimate is not a guaranteed transaction price or an established industry standard. Final terms depend on the parties and their agreement.</p>
        <p>Credtent's proposed approach brings context and supported indicators into constructive pricing discussions. Third-party ratings and evidence must be appropriately sourced; unsupported ratings are not part of this preview.</p>
        <h2>Valuation can stand on its own.</h2>
        <p>You may already have a buyer or a licensing agreement. Obtain a valuation independently, then decide whether you want help finding licensing partners or negotiating another opportunity.</p>
        <div class="btn-row"><a class="btn" href="/contact">Request a valuation</a><a class="btn btn-ghost" href="/ai-training">Discuss licensing options</a></div>
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
      actions: `<div class="btn-row"><a class="btn" href="/contact">Discuss training licensing</a></div>`,
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
        <div class="btn-row"><a class="btn" href="/contact">Contact our team</a></div>
      </div></section>`
    },
    {
      path: "/about",
      title: "About Credtent",
      description: "Credtent, Inc. is a Delaware Public Benefit Corporation founded by Eric R. Burgess and Dr. Galen Buckwalter.",
      eyebrow: "About",
      h1: "About Credtent",
      capsule: CAPSULE.about,
      lede: "More choice. Wider participation. We help creatives and AI companies find constructive ways to work together through choice, consent, credit, and compensation.",
      crumbs: [{ name: "About Credtent", href: "https://credtent.com/about" }],
      extraLd: [
        {
          "@type": "Person",
          "@id": "https://credtent.com/about#eric-r-burgess",
          name: "Eric R. Burgess",
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
          image: "https://credtent.com/media/galen-640.webp",
          sameAs: ["https://www.linkedin.com/in/j-galen-buckwalter-04139510"]
        }
      ],
      faq: [
        { q: "What kind of company is Credtent?", a: "Credtent, Inc. is a Delaware Public Benefit Corporation." },
        { q: "Who founded Credtent?", a: "Eric R. Burgess is Founder and CEO. Dr. Galen Buckwalter is Co-Founder and Chief Science Officer." },
        { q: "Where is Credtent based?", a: "Credtent, Inc. is at 1822 E. Route 66, Suite A353, Glendora, California 91740." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-3">
        <article class="card"><h3>Human judgment</h3><p>Use AI with curiosity while keeping creative skills, agency, and responsibility strong.</p></article>
        <article class="card"><h3>Neutral role</h3><p>Help content owners and AI companies understand each other's needs and agree clear terms.</p></article>
        <article class="card"><h3>Shared opportunity</h3><p>Make room for more people to participate in the AI economy and the value their work creates.</p></article>
      </div></section>
      <section class="section"><div class="wrap">
        <p class="eyebrow">The people behind the work</p>
        <h2>The Credtent team</h2>
        <p class="lede">Eric R. Burgess, Dr. Galen Buckwalter, Edmond Almond, Abigail Cameron, Carmen Sinata, Freddy Mota, Michael Thompson, Raymond Jia, Jim Li, and Colin Devenish.</p>
        <!-- TODO(Eric): headshots for Edmond Almond and Abigail Cameron -->
        <!-- TODO(Eric): confirm advisors. The council is not rendered. -->
        <div class="team" style="margin-top:24px">
          <article class="person">${picture(images.eric, { sizes: "240px" })}<h3>Eric R. Burgess</h3><p class="role">Founder and CEO</p><p><a href="https://www.linkedin.com/in/erburgess">Eric on LinkedIn</a></p></article>
          <article class="person">${picture(images.galen, { sizes: "240px" })}<h3>Dr. Galen Buckwalter</h3><p class="role">Co-Founder and Chief Science Officer</p><p><a href="https://www.linkedin.com/in/j-galen-buckwalter-04139510">Galen on LinkedIn</a></p></article>
          <article class="person"><img src="/media/placeholder-ea.svg" width="480" height="480" alt="Placeholder headshot for Edmond Almond" data-placeholder="headshot"><h3>Edmond Almond</h3><p class="role">Chief Partnerships Officer</p></article>
          <article class="person"><img src="/media/placeholder-ac.svg" width="480" height="480" alt="Placeholder headshot for Abigail Cameron" data-placeholder="headshot"><h3>Abigail Cameron</h3><p class="role">Engineering</p></article>
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
          <article class="card"><h3>Eric's personal Substack</h3><p>Burgessing on Content, Board Games and Other Things.</p><p><a href="https://burgessing.substack.com/">Visit Eric's personal Substack</a></p></article>
        </div>
      </div></section>
      <section class="section"><div class="wrap prose">
        <h2>How can we help?</h2>
        <p>For questions about opt-out, auditing, valuation, or licensing, contact <a href="mailto:hello@credtent.com">hello@credtent.com</a>.</p>
        ${ADDRESS_HTML}
        <div class="btn-row"><a class="btn" href="/contact">Contact Credtent</a></div>
      </div></section>`
    },
    {
      path: "/contact",
      title: "Contact Credtent",
      description: "Contact Credtent about opt-out, auditing, valuation, or licensing.",
      eyebrow: "Contact",
      h1: "Start a conversation.",
      capsule: "Write to Credtent about opt-out, auditing, valuation, or licensing. This preview form does not send a message.",
      crumbs: [{ name: "Contact", href: "https://credtent.com/contact" }],
      faq: [
        { q: "Which email should companies use?", a: "Write to hello@credtent.com." },
        { q: "Where is Credtent?", a: "Credtent, Inc. is at 1822 E. Route 66, Suite A353, Glendora, California 91740." }
      ],
      main: `<section class="section section-white"><div class="wrap grid-2">
        <form class="form" action="#" method="post">
          <!-- TODO(Eric): point this form at a real inbox. It must not post anywhere live. -->
          <label>Name <input name="name" type="text" autocomplete="name" required></label>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Topic
            <select name="topic">
              <option>Valuation</option>
              <option>AI training licensing</option>
              <option>Citation licensing</option>
              <option>Something else</option>
            </select>
          </label>
          <label>Message <textarea name="message" required></textarea></label>
          <button class="btn" type="submit">Send</button>
          <p class="small">This preview does not deliver the form.</p>
        </form>
        <div>
          <p><a href="mailto:hello@credtent.com">hello@credtent.com</a></p>
          ${ADDRESS_HTML}
        </div>
      </div></section>`
    },
    {
      path: "/pricing",
      title: "Pricing | Credtent",
      description: "Opt-Out Premium is US$49 for individuals and US$249+ for organizations. The Collaborithmic Age lists its published book prices.",
      eyebrow: "Pricing",
      h1: "Published prices.",
      capsule: "Opt-Out Premium is US$49 a year for individuals and US$249+ a year for organizations. The Collaborithmic Age is $14.99, $24.99, and $49.",
      crumbs: [{ name: "Pricing", href: "https://credtent.com/pricing" }],
      faq: [
        { q: "What does Opt-Out Premium cost?", a: "US$49 annually for individuals and US$249+ annually for organizations." },
        { q: "What does the book cost?", a: "The published collaborithmic.com prices are $14.99 for the e-book, $24.99 for the paperback, and $49 for the living e-book." }
      ],
      main: `<section class="section section-white"><div class="wrap">
        <div class="grid-2">
          <article class="card"><h3>Opt-Out Premium</h3><p>${price("US$49")} annually for individuals.</p><p>${price("US$249+")} annually for organizations.</p><p><a href="https://credtent.org/premium">Read about Opt-Out Premium</a></p></article>
          <article class="card"><h3>The Collaborithmic Age</h3>${editions()}<p><a href="${BOOK}">Explore the book</a></p></article>
        </div>
        <p class="fine">Enterprise licensing and other catalog fees are discussed directly. They are intentionally absent from this preview.</p>
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
        { q: "What does a Credtent license cover?", a: LICENSE_SENTENCE },
        { q: "What about content already used for training?", a: "We can structure a going-forward license plus a covenant not to sue from the rights holders who sign, covering the named works. That is not a release from everyone else, and it is not a regulator cure." },
        { q: "How should we read a valuation?", a: CAPSULE.valuation },
        { q: "Where do creative opt-out questions live?", a: "Creative questions about what an opt-out can and cannot do are answered at credtent.org/resources/opt-out-limitations." }
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
        { q: "Is this an automated score?", a: "No. Expert review looks at process. A self-declared badge from the badge builder is a disclosure, not this review." },
        { q: "Where is the free badge?", a: "The free badge builder stays on credtent.org." }
      ],
      main: `<section class="section section-white"><div class="wrap prose">
        <p>Publishers, studios, and other organizations that publish human-authored work can ask Credtent to review the editorial process behind that work. The review is about process and disclosure, not a promise that every future work is human-made.</p>
        <p>Creative Origin sits alongside <a href="https://credtent.org/creative-consent">Creative Consent</a> for platforms and the badge overview on <a href="https://credtent.org/badges/">credtent.org/badges</a>.</p>
        <div class="btn-row"><a class="btn" href="/contact">Tell us about your editorial process</a></div>
        <p class="small">Creative Origin for publishers lives on credtent.com. credtent.org/certified-publisher redirects here.</p>
      </div></section>`
    }
  ];
}
