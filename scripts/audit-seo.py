"""Read-only SEO checks. PASS means technical checks passed, not Google indexed.

Python 3.10+, standard library only. Run from the repository root:
  python scripts/audit-seo.py
  python scripts/audit-seo.py --urls path/to/gsc-examples.csv
"""
import argparse
import csv
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.h1 = 0
        self.meta = {}
        self.canonicals = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.h1 += 1
        elif tag == "meta":
            name = attrs.get("name", "").lower()
            self.meta.setdefault(name, []).append(attrs.get("content", ""))
        elif tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonicals.append(attrs.get("href", ""))
        elif tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, text):
        if self.in_title:
            self.title += text


def normalized(url):
    parts = urlsplit(url)
    # Only the origin's empty path and '/' are equivalent. Preserve other slashes.
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path or "/", parts.query, ""))


class RobotsRules:
    """Evaluate Googlebot groups using longest match (allow wins ties)."""
    def __init__(self, text):
        self.groups = []
        agents, rules = [], []
        for line in text.splitlines():
            key, separator, value = line.split("#", 1)[0].partition(":")
            if not separator:
                continue
            key, value = key.strip().lower(), value.strip()
            if key == "user-agent":
                if rules:
                    self.groups.append((agents, rules))
                    agents, rules = [], []
                agents.append(value.lower())
            elif key in {"allow", "disallow"} and agents:
                rules.append((key, value))
        if agents:
            self.groups.append((agents, rules))

    def can_fetch(self, agent, url):
        agent = agent.lower()
        candidates = [(max((len(a) for a in agents if a != "*" and a in agent), default=0), rules)
                      for agents, rules in self.groups if "*" in agents or any(a in agent for a in agents)]
        specificity = max((score for score, _ in candidates), default=-1)
        parts = urlsplit(url)
        path = (parts.path or "/") + ("?" + parts.query if parts.query else "")
        matches = []
        for score, rules in candidates:
            if score != specificity:
                continue
            for directive, pattern in rules:
                if not pattern:
                    continue
                anchored = pattern.endswith("$")
                value = pattern[:-1] if anchored else pattern
                expression = "^" + ".*".join(re.escape(part) for part in value.split("*")) + ("$" if anchored else "")
                if re.search(expression, path):
                    matches.append((len(value.replace("*", "").encode("utf-8")), directive == "allow"))
        return max(matches)[1] if matches else True


def get(url, timeout):
    request = Request(url, headers={"User-Agent": "BloggyNepalSEOAudit/1.0"})
    with urlopen(request, timeout=timeout) as response:
        return response.status, response.url, response.headers, response.read().decode("utf-8", errors="replace")


def assess(url, status, final_url, headers, html, robots=None):
    page = Page()
    page.feed(html)
    issues, warnings = [], []
    if status != 200:
        issues.append(f"HTTP {status}")
    if normalized(final_url) != normalized(url):
        issues.append("URL redirects; review final destination")
    if "text/html" not in headers.get("Content-Type", "").lower():
        issues.append("Response is not HTML")
    if robots is not None and not robots.can_fetch("Googlebot", url):
        issues.append("Blocked for Googlebot in robots.txt")
    directives = ", ".join(page.meta.get("robots", []) + page.meta.get("googlebot", []) + [headers.get("X-Robots-Tag", "")])
    if re.search(r"\b(noindex|none)\b", directives, re.I):
        issues.append("noindex directive (review whether intentional)")
    canonical = page.canonicals[0] if page.canonicals else ""
    if len(page.canonicals) != 1:
        issues.append(f"Expected one canonical; found {len(page.canonicals)}")
    elif not canonical or normalized(urljoin(final_url, canonical)) != normalized(url):
        issues.append("Canonical points elsewhere or is empty")
    title = " ".join(page.title.split())
    description = " ".join(" ".join(page.meta.get("description", [])).split())
    if not title:
        warnings.append("Missing title")
    if not description:
        warnings.append("Missing description")
    if len(page.meta.get("description", [])) > 1:
        warnings.append("Multiple meta descriptions")
    if page.h1 != 1:
        warnings.append(f"Expected one H1; found {page.h1}")
    if re.search(r"[|–—-]\s*bloggynepal\s*[|–—-]\s*bloggynepal\s*$", title, re.I):
        warnings.append("Repeated brand suffix in title")
    return {"url": url, "http_status": status, "final_url": final_url,
            "canonical": canonical, "robots": directives, "title": title,
            "description": description, "h1_count": page.h1,
            "issues": issues, "warnings": warnings,
            "links": [normalized(urljoin(final_url, link)) for link in page.links]}


def read_urls(path):
    with path.open(encoding="utf-8-sig", newline="") as source:
        # Supports GSC example exports (URL, Last crawled) and one URL per line.
        return list(dict.fromkeys(cell.strip() for row in csv.reader(source) for cell in row
                                  if cell.strip().startswith(("https://", "http://"))))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://bloggynepal.com")
    parser.add_argument("--urls", type=Path, help="GSC examples CSV or one URL per line")
    parser.add_argument("--output", type=Path, default=Path("reports/seo-audit.csv"))
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--timeout", type=int, default=40)
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    if not 1 <= args.workers <= 8 or args.timeout < 1:
        parser.error("workers must be 1–8 and timeout must be positive")
    robots = None
    try:
        status, _, _, text = get(base + "/robots.txt", args.timeout)
        if status == 200:
            robots = RobotsRules(text)
    except Exception as error:
        print(f"WARNING: could not verify robots.txt: {error}", file=sys.stderr)
    try:
        if args.urls:
            urls = read_urls(args.urls)
        else:
            _, _, _, xml = get(base + "/sitemap.xml", args.timeout)
            root = ET.fromstring(xml)
            if root.tag.rsplit("}", 1)[-1] != "urlset":
                raise ValueError("Expected a URL sitemap; pass URL examples with --urls for sitemap indexes")
            urls = list(dict.fromkeys(element.text.strip() for element in root.iter()
                                     if element.tag.rsplit("}", 1)[-1] == "loc" and element.text))
        if not urls:
            raise ValueError("No URLs found")
        # A single robots file is valid only for this origin. Don't mislabel other hosts.
        if any(urlsplit(url).netloc != urlsplit(base).netloc or urlsplit(url).scheme != urlsplit(base).scheme for url in urls):
            raise ValueError("Input URLs must share --base-url's scheme and host; audit other origins separately")
    except Exception as error:
        print(f"Audit could not start: {error}", file=sys.stderr)
        return 2

    def check(url):
        try:
            row = assess(url, *get(url, args.timeout), robots=robots)
        except HTTPError as error:
            row = {"url": url, "http_status": error.code, "issues": [f"HTTP {error.code}"], "warnings": []}
        except Exception as error:
            row = {"url": url, "issues": [f"Fetch failed: {error}"], "warnings": []}
        if robots is None:
            row["warnings"].append("robots.txt not verified")
        return row

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        rows = list(pool.map(check, urls))
    titles = Counter(row.get("title") for row in rows if row.get("title"))
    descriptions = Counter(row.get("description") for row in rows if row.get("description"))
    fields = ["result", "url", "http_status", "final_url", "canonical", "robots", "title", "description", "h1_count", "issues", "warnings"]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8-sig", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            if titles[row.get("title")] > 1:
                row["warnings"].append("Duplicate title within audited URLs")
            if descriptions[row.get("description")] > 1:
                row["warnings"].append("Duplicate description within audited URLs")
            row["result"] = "FIX" if row["issues"] else "REVIEW" if row["warnings"] else "PASS"
            writer.writerow({**row, "issues": "; ".join(row["issues"]), "warnings": "; ".join(row["warnings"])})
            print(f"{row['result']}: {row['url']}", flush=True)
    print(dict(Counter(row["result"] for row in rows)))
    print(f"Report: {args.output}. PASS does not confirm Google indexing.")
    print("FIX flags on GSC exclusions may be intentional redirects/noindex; review before changing them.")
    return 1 if any(row["issues"] for row in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
