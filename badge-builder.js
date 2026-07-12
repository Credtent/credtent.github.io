/**
 * Creative Origin 4.0 badge builder for credtent.org.
 *
 * Plain-JS port of the credtent.com 4.0 badge-maker engine
 * (~/Code/credtent-com/src/lib/badge-maker/: encoding.ts, metadata-writer.ts),
 * which is itself a client port of the CredtentOne Phase 1 engine. Fully
 * static: no server dependency, runs entirely in the browser on GitHub Pages.
 * Base badge art is fetched from /badges/*.svg (the approved plain-language
 * series, extracted verbatim from the 4.0 badge-maker's badge-art module).
 *
 * The free path produces a SELF-DECLARED disclosure badge (Layer 2: readable
 * XMP metadata, data-* attributes, and a disclosure sentence stamped into the
 * SVG). Layer-1 C2PA cryptographic signing is NOT here; it requires the server
 * signer and a procured certificate, both gated in CredtentOne. A generated
 * badge is a disclosure, never a Credtent certification. The surface states
 * this honestly and never softens it.
 *
 * Every emitted string is dash-clean (no em or en dashes) and carries no
 * exclamation points.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(); // node, for testing the pure functions
  } else {
    root.CredtentBadgeBuilder = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Encoding (port of encoding.ts) ─────────────────────────────

  var CREATIVE_ORIGIN_STANDARD_VERSION = 'creative-origin/4.0';
  var CREATIVE_ORIGIN_ISSUING_AUTHORITY = 'Credtent';

  /**
   * Locked plain-language disclosure labels, keyed off the tier.
   * 'legacy' is the fourth builder tier restored from the original registry
   * builder (EB decision 2026-07-11): Legacy Creation, for works made before
   * November 2022, predating generative AI tools.
   */
  var CREATIVE_ORIGIN_DISCLOSURE_LABELS = {
    hcc: 'Human Composed',
    aac: 'AI-assisted',
    acc: 'AI-generated',
    legacy: 'Legacy Creation'
  };

  /**
   * Stable machine token per tier (snake_case, regulator-aligned).
   * Legacy uses the existing 4.0 vocabulary: origin_class human_composed with
   * the manifest's legacy_flag set true, rather than inventing a new token.
   */
  var CREATIVE_ORIGIN_CLASS_TOKEN = {
    hcc: 'human_composed',
    aac: 'ai_assisted',
    acc: 'ai_generated',
    legacy: 'human_composed'
  };

  /**
   * How each Credtent tier MAPS ONTO the EU's binary Article 50 label. The EU
   * label is binary: AI-generated vs not. This is a mapping of the three-tier
   * refinement onto that binary floor, NOT a claim that Article 50 defines
   * three tiers. hcc is the non-AI side; aac and acc fall on the AI side.
   */
  var EU_ARTICLE_50_BINARY_MAP = {
    hcc: [],
    aac: ['eu-ai-act:art50:ai_generated'],
    acc: ['eu-ai-act:art50:ai_generated'],
    legacy: []
  };

  function disclosureLabel(origin) {
    return CREATIVE_ORIGIN_DISCLOSURE_LABELS[origin];
  }

  function classToken(origin) {
    return CREATIVE_ORIGIN_CLASS_TOKEN[origin];
  }

  function regulatoryMapFor(origin) {
    return EU_ARTICLE_50_BINARY_MAP[origin].slice();
  }

  function buildCreativeOriginManifest(input) {
    return {
      standard_version: CREATIVE_ORIGIN_STANDARD_VERSION,
      origin_class: classToken(input.origin),
      origin_label: disclosureLabel(input.origin),
      assertion_basis: input.assertionBasis,
      issuing_authority: CREATIVE_ORIGIN_ISSUING_AUTHORITY,
      legacy_flag: input.origin === 'legacy',
      regulatory_map: regulatoryMapFor(input.origin)
    };
  }

  /**
   * Human-readable disclosure sentence. Dash-clean, no exclamation point.
   * Phrased so it never implies Article 50 mandates three tiers: it states
   * what Credtent asserts and that it maps onto Article 50.
   */
  function disclosureSentence(origin, basis) {
    var label = disclosureLabel(origin);
    var basisPhrase =
      basis === 'expert_certified'
        ? 'expert certified by Credtent'
        : 'self declared by the creator';
    // The legacy sentence adds the pre-November-2022 clause; the three core
    // tier sentences stay byte-identical to the 4.0 engine.
    var legacyClause =
      origin === 'legacy'
        ? ' The work was made before November 2022, predating generative AI tools.'
        : '';
    return (
      'Creative Origin: ' + label + '.' + legacyClause +
      ' This classification is ' + basisPhrase +
      ' and maps onto the EU AI Act Article 50 transparency label.'
    );
  }

  // ── Layer-2 metadata writer (port of metadata-writer.ts) ───────

  var XMP_NS = 'https://schema.credtent.org/creative-origin/4.0';

  function xmlEscape(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function manifestToXmp(manifest) {
    var fields = [
      ['standardVersion', manifest.standard_version],
      ['originClass', manifest.origin_class],
      ['originLabel', manifest.origin_label],
      ['assertionBasis', manifest.assertion_basis],
      ['issuingAuthority', manifest.issuing_authority],
      ['legacyFlag', String(manifest.legacy_flag)]
    ];

    var props = fields
      .map(function (f) { return '      <co:' + f[0] + '>' + xmlEscape(f[1]) + '</co:' + f[0] + '>'; })
      .join('\n');
    var regulatory = manifest.regulatory_map
      .map(function (r) { return '        <rdf:li>' + xmlEscape(r) + '</rdf:li>'; })
      .join('\n');

    return '<x:xmpmeta xmlns:x="adobe:ns:meta/">\n' +
      '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:co="' + XMP_NS + '">\n' +
      '    <rdf:Description>\n' +
      props + '\n' +
      '      <co:regulatoryMap>\n' +
      '        <rdf:Bag>\n' +
      regulatory + '\n' +
      '        </rdf:Bag>\n' +
      '      </co:regulatoryMap>\n' +
      '    </rdf:Description>\n' +
      '  </rdf:RDF>\n' +
      '</x:xmpmeta>';
  }

  function manifestToDataAttributes(manifest) {
    return {
      'data-creative-origin': manifest.origin_class,
      'data-creative-origin-label': manifest.origin_label,
      'data-assertion-basis': manifest.assertion_basis,
      'data-standard-version': manifest.standard_version,
      'data-issuing-authority': manifest.issuing_authority,
      'data-legacy-flag': String(manifest.legacy_flag)
    };
  }

  /**
   * Inject Layer-2 metadata into an existing SVG string. Replaces or inserts a
   * <metadata> block carrying the XMP, adds data-* attributes to the root
   * <svg>, and sets a <desc> with the human-readable disclosure sentence.
   * Idempotent on the data-* attributes.
   */
  function writeSvgMetadata(svg, manifest, descSentence) {
    var xmp = manifestToXmp(manifest);
    var dataAttrs = manifestToDataAttributes(manifest);

    var attrString = Object.keys(dataAttrs)
      .map(function (k) { return k + '="' + xmlEscape(dataAttrs[k]) + '"'; })
      .join(' ');

    var out = svg.replace(/<svg\b([^>]*)>/, function (_m, existingAttrs) {
      var cleaned = existingAttrs.replace(/\sdata-creative-origin[^=]*="[^"]*"/g, '');
      return '<svg' + cleaned + ' ' + attrString + '>';
    });

    out = out.replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
    var metadataBlock = '<metadata>\n' + xmp + '\n</metadata>';
    out = out.replace(/(<svg\b[^>]*>)/, '$1\n' + metadataBlock);

    if (/<desc>[\s\S]*?<\/desc>/.test(out)) {
      out = out.replace(/<desc>[\s\S]*?<\/desc>/, '<desc>' + xmlEscape(descSentence) + '</desc>');
    } else {
      out = out.replace(/(<svg\b[^>]*>)/, '$1\n<desc>' + xmlEscape(descSentence) + '</desc>');
    }

    return out;
  }

  // ── Badge generation (mirrors the 4.0 self-declared flow) ──────

  /**
   * Build a self-declared Layer-2 badge entirely client-side from a base SVG
   * string. The signed Layer-1 path is NOT reachable here by design; the
   * status line states that honestly, exactly as the Phase 1 engine does when
   * its signer is not active.
   */
  function generateBadge(origin, baseSvg) {
    var manifest = buildCreativeOriginManifest({ origin: origin, assertionBasis: 'self_declared' });
    var sentence = disclosureSentence(origin, 'self_declared');
    var stamped = writeSvgMetadata(baseSvg, manifest, sentence);
    var label = disclosureLabel(origin);
    var statusLine =
      'Badge ready with embedded disclosure metadata. Cryptographic signing is not active yet, so ' +
      'this badge carries readable provenance but not a signed Content Credential. Classification: ' +
      label + ', self declared.';
    return { svg: stamped, label: label, statusLine: statusLine, manifest: manifest };
  }

  return {
    CREATIVE_ORIGIN_STANDARD_VERSION: CREATIVE_ORIGIN_STANDARD_VERSION,
    CREATIVE_ORIGIN_DISCLOSURE_LABELS: CREATIVE_ORIGIN_DISCLOSURE_LABELS,
    CREATIVE_ORIGIN_CLASS_TOKEN: CREATIVE_ORIGIN_CLASS_TOKEN,
    disclosureLabel: disclosureLabel,
    classToken: classToken,
    regulatoryMapFor: regulatoryMapFor,
    buildCreativeOriginManifest: buildCreativeOriginManifest,
    disclosureSentence: disclosureSentence,
    manifestToXmp: manifestToXmp,
    manifestToDataAttributes: manifestToDataAttributes,
    writeSvgMetadata: writeSvgMetadata,
    generateBadge: generateBadge
  };
});
