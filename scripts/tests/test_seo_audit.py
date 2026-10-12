import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("seo_audit", Path(__file__).parents[1] / "audit-seo.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
URL = "https://bloggynepal.com/destinations/example"
HTML = f'''<title>Example | bloggyNepal</title><meta name="description" content="A guide">
<link rel="canonical" href="{URL}"><h1>Example</h1><a href="/blog">Stories</a>'''


class SEOAuditTest(unittest.TestCase):
    def check_page(self, html=HTML, headers=None, status=200, final=URL):
        return audit.assess(URL, status, final, headers or {"Content-Type": "text/html"}, html)

    def test_complete_page_and_link_resolution(self):
        row = self.check_page()
        self.assertEqual(row["issues"], [])
        self.assertEqual(row["warnings"], [])
        self.assertEqual(row["links"], ["https://bloggynepal.com/blog"])

    def test_noindex_from_googlebot_and_http_header(self):
        for row in [self.check_page(HTML + '<meta name="googlebot" content="noindex, follow">'),
                    self.check_page(headers={"Content-Type": "text/html", "X-Robots-Tag": "noindex"})]:
            self.assertTrue(any("noindex" in issue for issue in row["issues"]))

    def test_duplicate_canonical_and_redirect(self):
        self.assertTrue(self.check_page(HTML + f'<link rel="canonical" href="{URL}">')["issues"])
        self.assertTrue(self.check_page(final=URL + "-other")["issues"])

    def test_wrong_canonical_and_missing_title(self):
        self.assertTrue(self.check_page(HTML.replace(URL, "https://bloggynepal.com"))["issues"])
        self.assertIn("Missing title", self.check_page('<h1>Example</h1>')["warnings"])

    def test_canonical_root_and_trailing_slash(self):
        self.assertEqual(audit.normalized("https://bloggynepal.com"), audit.normalized("https://bloggynepal.com/"))
        self.assertNotEqual(audit.normalized(URL), audit.normalized(URL + "/"))

    def test_duplicate_brand_is_review_not_indexing_failure(self):
        row = self.check_page(HTML.replace('Example | bloggyNepal', 'Example | bloggyNepal | bloggyNepal'))
        self.assertFalse(row["issues"])
        self.assertIn("Repeated brand suffix in title", row["warnings"])

    def test_robots_longest_match_and_specific_groups(self):
        rules = audit.RobotsRules("User-agent: *\nAllow: /\nDisallow: /admin/\nAllow: /admin/login\n")
        self.assertFalse(rules.can_fetch("Googlebot", "https://bloggynepal.com/admin/comments"))
        self.assertTrue(rules.can_fetch("Googlebot", "https://bloggynepal.com/admin/login"))
        rules = audit.RobotsRules("User-agent: *\nDisallow: /\nUser-agent: Googlebot\nAllow: /\nDisallow: /*?q=\n")
        self.assertTrue(rules.can_fetch("Googlebot", URL))
        self.assertFalse(rules.can_fetch("Googlebot", "https://bloggynepal.com/search?q=nepal"))

    def test_gsc_csv_header_bom_and_duplicate_urls(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'examples.csv'
            path.write_text(f'\ufeffURL,Last crawled\n{URL},2026-10-09\n{URL},2026-10-10\n', encoding='utf-8')
            self.assertEqual(audit.read_urls(path), [URL])


if __name__ == '__main__':
    unittest.main()
