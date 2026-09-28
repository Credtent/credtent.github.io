#!/usr/bin/env python3
"""Static checks for serving this repo as the credtent-site Vercel project.

Stdlib only, no network. Run from anywhere:

    python3 .github/scripts/check_vercel_site.py [repo_root] [--strict]

What it checks:
  1. vercel.json parses, uses only known top-level keys, sets cleanUrls and an
     explicit boolean trailingSlash, adds no X-Robots-Tag or CSP header, and
     has no redirect or rewrite whose destination is an absolute vercel.app URL.
  2. robots: robots.txt (served by GitHub Pages on credtent.org) stays
     indexable; robots-vercel.txt disallows everything; vercel.json rewrites
     /robots.txt to it; .vercelignore excludes the root robots.txt. The last
     one matters because Vercel gives the filesystem precedence over rewrites,
     so the rewrite only takes effect if robots.txt is not in the deployment.
  3. Every local reference in the HTML, CSS and web manifest that ships to
     Vercel (after .vercelignore) resolves to a file, using the URL each page
     is actually served at on Vercel (cleanUrls on, trailingSlash as
     configured). Document-relative references in directory index pages are
     resolved against the no-slash URL when trailingSlash is false.
  4. Every sitemap URL and every canonical maps to a shipped file, and is
     reported as served directly (200) or as a 308 under cleanUrls or
     trailingSlash (a form mismatch, reported as a warning).

Exit status: 1 on errors (missing files, bad JSON, robots problems). Warnings
(URL form mismatches) only fail with --strict.

The .vercelignore matcher implements the subset of gitignore syntax this repo
uses (comments, anchored /paths, directory names, fnmatch globs). Negation
patterns are rejected rather than half-supported.
"""

from __future__ import annotations

import fnmatch
import json
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET

KNOWN_VERCEL_KEYS = {
    "$schema", "buildCommand", "cleanUrls", "framework", "headers",
    "installCommand", "outputDirectory", "redirects", "rewrites",
    "trailingSlash", "github", "git", "devCommand", "ignoreCommand",
    "public", "regions", "functions", "images", "crons", "routes",
}
PUBLIC_HOSTS = {"credtent.com", "www.credtent.com"}
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "javascript:", "data:", "blob:")


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.info: list[str] = []

    def err(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def note(self, msg: str) -> None:
        self.info.append(msg)


# ---------------------------------------------------------------- ignore rules

def load_ignore(root: str, rep: Report) -> list[str]:
    path = os.path.join(root, ".vercelignore")
    if not os.path.exists(path):
        rep.warn(".vercelignore not found; every file would ship")
        return []
    pats = []
    for raw in open(path, encoding="utf-8").read().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("!"):
            rep.err(f".vercelignore: negation pattern not supported by this check: {line}")
            continue
        pats.append(line)
    return pats


def is_ignored(rel: str, pats: list[str]) -> bool:
    parts = rel.split("/")
    for pat in pats:
        dir_only = pat.endswith("/")
        p = pat.rstrip("/")
        anchored = p.startswith("/") or "/" in p
        p = p.lstrip("/")
        if anchored:
            # Match the pattern against the path or any leading directory of it.
            for i in range(1, len(parts) + 1):
                prefix = "/".join(parts[:i])
                is_dir = i < len(parts)
                if fnmatch.fnmatchcase(prefix, p) and (is_dir or not dir_only):
                    return True
        else:
            for i, seg in enumerate(parts):
                is_dir = i < len(parts) - 1
                if fnmatch.fnmatchcase(seg, p) and (is_dir or not dir_only):
                    return True
    return False


def shipped_files(root: str, pats: list[str]) -> set[str]:
    out = set()
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = os.path.relpath(dirpath, root)
        rel_dir = "" if rel_dir == "." else rel_dir.replace(os.sep, "/")
        dirnames[:] = [d for d in dirnames if d != ".git"]
        for f in filenames:
            rel = f"{rel_dir}/{f}" if rel_dir else f
            if not is_ignored(rel, pats):
                out.add(rel)
    return out


# ------------------------------------------------------------- URL semantics

def served_url(rel: str) -> str:
    """URL a shipped HTML file is served at with cleanUrls on, no trailing slash."""
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("/index.html")]
    if rel.endswith(".html"):
        return "/" + rel[: -len(".html")]
    return "/" + rel


def resolve_path(path: str, files: set[str], trailing_slash: bool):
    """Map a request path to (file or None, list of redirect hops)."""
    hops = []
    p = path
    for _ in range(4):
        if p != "/" and p.endswith("/") and trailing_slash is False:
            hops.append(f"{p} -> {p.rstrip('/')} (308 trailingSlash)")
            p = p.rstrip("/")
            continue
        if p.endswith("/index.html"):
            target = p[: -len("index.html")]
            if trailing_slash is False and target != "/":
                target = target.rstrip("/")
            hops.append(f"{p} -> {target} (308 cleanUrls)")
            p = target
            continue
        if p.endswith(".html"):
            target = p[: -len(".html")]
            hops.append(f"{p} -> {target} (308 cleanUrls)")
            p = target
            continue
        break
    rel = p.lstrip("/")
    if p == "/":
        return ("index.html" if "index.html" in files else None), hops
    if rel in files:
        return rel, hops
    if rel.rstrip("/") + ".html" in files:
        return rel.rstrip("/") + ".html", hops
    if rel.rstrip("/") + "/index.html" in files:
        return rel.rstrip("/") + "/index.html", hops
    return None, hops


# ---------------------------------------------------------------- reference scan

class RefParser(HTMLParser):
    ATTRS = {"href", "src", "poster", "action", "data-src"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str]] = []
        self.canonical: str | None = None
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "link" and (a.get("rel") or "").lower() == "canonical":
            self.canonical = a.get("href")
        for k, v in attrs:
            if v is None:
                continue
            if k in self.ATTRS:
                self.refs.append((f"<{tag} {k}>", v))
            elif k == "srcset":
                for part in v.split(","):
                    u = part.strip().split(" ")[0]
                    if u:
                        self.refs.append((f"<{tag} srcset>", u))
            elif k == "style":
                for u in re.findall(r"url\(\s*['\"]?([^'\")]+)", v):
                    self.refs.append((f"<{tag} style url()>", u))
        if tag == "script":
            self.in_script = True

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False


def is_local(ref: str) -> bool:
    r = ref.strip()
    if not r or r.startswith("#") or r.startswith("//"):
        return False
    if "${" in r or "{{" in r:
        return False
    return not r.lower().startswith(SKIP_SCHEMES)


def check_ref(page_label, base_url, ref, kind, files, trailing_slash, rep, alt_base=None):
    target = urljoin("https://x" + base_url, ref.strip())
    path = urlsplit(target).path or "/"
    f, hops = resolve_path(path, files, trailing_slash)
    alt_f = None
    if alt_base is not None:
        alt = urlsplit(urljoin("https://x" + alt_base, ref.strip())).path or "/"
        alt_f = resolve_path(alt, files, trailing_slash)[0]
    if f is None:
        msg = f"{page_label}: {kind} '{ref}' resolves to {path}, which does not ship"
        if alt_f is not None:
            msg += f" (it works from {alt_base}, the trailing-slash URL GitHub Pages uses)"
        rep.err(msg)
        return False
    if alt_base is not None and alt_f is not None and alt_f != f:
        rep.err(
            f"{page_label}: {kind} '{ref}' resolves to {f} when the page is served at "
            f"{base_url}, but to {alt_f} from {alt_base} (GitHub Pages); the link changes meaning"
        )
        return False
    return True


# ---------------------------------------------------------------------- checks

def check_vercel_json(root, rep):
    path = os.path.join(root, "vercel.json")
    try:
        cfg = json.load(open(path, encoding="utf-8"))
    except FileNotFoundError:
        rep.err("vercel.json not found")
        return {}
    except json.JSONDecodeError as e:
        rep.err(f"vercel.json is not valid JSON: {e}")
        return {}
    rep.note("vercel.json parses as JSON")
    unknown = set(cfg) - KNOWN_VERCEL_KEYS
    if unknown:
        rep.err(f"vercel.json has unknown top-level keys: {sorted(unknown)}")
    if cfg.get("cleanUrls") is not True:
        rep.err("vercel.json: cleanUrls must be true")
    if not isinstance(cfg.get("trailingSlash"), bool):
        rep.err("vercel.json: trailingSlash must be set explicitly to true or false")
    if "routes" in cfg:
        rep.warn("vercel.json uses legacy routes; check it does not bypass the filesystem")
    for h in cfg.get("headers", []):
        for kv in h.get("headers", []):
            key = kv.get("key", "").lower()
            if key == "x-robots-tag":
                rep.err(f"vercel.json sets X-Robots-Tag on {h.get('source')}; the Aegis proxy would pass it to credtent.com")
            if key in ("content-security-policy", "content-security-policy-report-only"):
                rep.err(f"vercel.json sets a CSP on {h.get('source')}; CSP for proxied paths belongs to Aegis")
    for kind in ("redirects", "rewrites"):
        for r in cfg.get(kind, []):
            dest = str(r.get("destination", ""))
            if re.match(r"https?://", dest) and "vercel.app" in dest:
                rep.err(f"vercel.json {kind}: absolute vercel.app destination {dest}")
            elif re.match(r"https?://", dest) and kind == "redirects":
                rep.warn(f"vercel.json redirect to absolute URL {dest}; confirm it is intended")
    return cfg


def check_robots(root, cfg, pats, files, rep):
    pages = open(os.path.join(root, "robots.txt"), encoding="utf-8").read()
    if re.search(r"(?im)^\s*disallow:\s*/\s*$", pages):
        rep.err("robots.txt disallows everything; GitHub Pages serves it on credtent.org, which must stay indexable")
    else:
        rep.note("robots.txt (credtent.org via GitHub Pages) stays indexable")
    vpath = os.path.join(root, "robots-vercel.txt")
    if not os.path.exists(vpath):
        rep.err("robots-vercel.txt missing")
        return
    vtxt = open(vpath, encoding="utf-8").read()
    if not (re.search(r"(?im)^\s*user-agent:\s*\*\s*$", vtxt) and re.search(r"(?im)^\s*disallow:\s*/\s*$", vtxt)):
        rep.err("robots-vercel.txt must contain 'User-agent: *' and 'Disallow: /'")
    rw = [r for r in cfg.get("rewrites", []) if r.get("source") == "/robots.txt"]
    if not rw or rw[0].get("destination") != "/robots-vercel.txt":
        rep.err("vercel.json needs a rewrite from /robots.txt to /robots-vercel.txt")
    if "robots.txt" in files:
        rep.err("robots.txt ships to Vercel; the filesystem wins over rewrites, so /robots.txt would stay indexable on vercel.app. Add /robots.txt to .vercelignore")
    elif "robots-vercel.txt" in files and rw:
        rep.note("on Vercel, /robots.txt has no file, so the rewrite serves robots-vercel.txt (Disallow: /)")
    if "robots-vercel.txt" not in files:
        rep.err("robots-vercel.txt is excluded by .vercelignore")


def page_refs(root, rel):
    parser = RefParser()
    parser.feed(open(os.path.join(root, rel), encoding="utf-8", errors="replace").read())
    return parser


def check_refs(root, files, trailing_slash, rep):
    html_files = sorted(f for f in files if f.endswith(".html"))
    total = 0
    for rel in html_files:
        parser = page_refs(root, rel)
        base = served_url(rel)
        alt = base + "/" if rel.endswith("/index.html") else None
        for kind, ref in parser.refs:
            if not is_local(ref):
                continue
            total += 1
            check_ref(rel, base, ref, kind, files, trailing_slash, rep, alt_base=alt)
    for rel in sorted(f for f in files if f.endswith(".css")):
        css = open(os.path.join(root, rel), encoding="utf-8").read()
        for u in re.findall(r"url\(\s*['\"]?([^'\")]+)", css):
            if is_local(u):
                total += 1
                check_ref(rel, "/" + rel, u, "css url()", files, trailing_slash, rep)
    for rel in sorted(f for f in files if f.endswith(".webmanifest")):
        data = json.load(open(os.path.join(root, rel), encoding="utf-8"))
        for icon in data.get("icons", []):
            if is_local(icon.get("src", "")):
                total += 1
                check_ref(rel, "/" + rel, icon["src"], "manifest icon", files, trailing_slash, rep)
    rep.note(f"checked {total} local references across {len(html_files)} HTML pages, the CSS and the web manifest")


def check_url_form(label, url, files, trailing_slash, rep):
    parts = urlsplit(url)
    if parts.netloc and parts.netloc not in PUBLIC_HOSTS:
        rep.warn(f"{label}: {url} is not on credtent.com")
        return
    f, hops = resolve_path(parts.path or "/", files, trailing_slash)
    if f is None:
        rep.err(f"{label}: {url} maps to no shipped file")
    elif hops:
        rep.warn(f"{label}: {url} is served via redirect ({'; '.join(hops)}), not a direct 200")
    return f


def check_sitemap(root, files, trailing_slash, rep):
    tree = ET.parse(os.path.join(root, "sitemap.xml"))
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [e.text.strip() for e in tree.getroot().findall("s:url/s:loc", ns)]
    direct = 0
    for loc in locs:
        f, hops = resolve_path(urlsplit(loc).path or "/", files, trailing_slash)
        check_url_form("sitemap", loc, files, trailing_slash, rep)
        if f and not hops:
            direct += 1
    rep.note(f"sitemap: {len(locs)} URLs, {direct} served directly as 200 on Vercel")
    listed = set()
    for loc in locs:
        f, _ = resolve_path(urlsplit(loc).path or "/", files, trailing_slash)
        if f:
            listed.add(f)
    missing = sorted(f for f in files if f.endswith(".html") and f not in listed and f != "404.html")
    if missing:
        rep.note("shipped pages not in sitemap: " + ", ".join(missing))


def check_canonicals(root, files, trailing_slash, rep):
    for rel in sorted(f for f in files if f.endswith(".html")):
        c = page_refs(root, rel).canonical
        if not c:
            if rel != "404.html":
                rep.note(f"{rel}: no canonical tag")
            continue
        check_url_form(f"canonical {rel}", c, files, trailing_slash, rep)
        parts = urlsplit(c)
        if parts.netloc in PUBLIC_HOSTS:
            f, _ = resolve_path(parts.path or "/", files, trailing_slash)
            if f and f != rel:
                rep.err(f"canonical {rel}: points at {c}, which serves {f}")


def main(argv):
    strict = "--strict" in argv
    args = [a for a in argv if not a.startswith("--")]
    root = os.path.abspath(args[0]) if args else os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    rep = Report()
    cfg = check_vercel_json(root, rep)
    pats = load_ignore(root, rep)
    files = shipped_files(root, pats)
    trailing_slash = cfg.get("trailingSlash", None)
    rep.note(f"{len(files)} files ship to Vercel after .vercelignore; trailingSlash={trailing_slash}")
    for must in ("index.html", "styles.css", "components.js", "404.html", "sitemap.xml", "llms.txt"):
        if must not in files:
            rep.err(f"{must} is excluded by .vercelignore")
    check_robots(root, cfg, pats, files, rep)
    check_refs(root, files, trailing_slash, rep)
    check_sitemap(root, files, trailing_slash, rep)
    check_canonicals(root, files, trailing_slash, rep)

    for line in rep.info:
        print(f"ok    {line}")
    for line in rep.warnings:
        print(f"WARN  {line}")
    for line in rep.errors:
        print(f"ERROR {line}")
    print(f"\n{len(rep.errors)} error(s), {len(rep.warnings)} warning(s)")
    if rep.errors or (strict and rep.warnings):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
