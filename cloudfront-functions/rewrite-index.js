// CloudFront Function — viewer request
// Rewrites directory-style URIs to serve index.html from S3.
//
// Examples:
//   /              → /index.html
//   /blog/         → /blog/index.html
//   /blog          → /blog/index.html
//   /about.html    → /about.html       (unchanged)
//   /styles.css    → /styles.css       (unchanged)
//   /badges/hcc.svg→ /badges/hcc.svg   (unchanged)

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // If the URI ends with '/', append index.html directly.
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // If the last path segment has no '.', treat it as a directory.
    else if (!uri.split('/').pop().includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
