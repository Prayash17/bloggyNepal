# Indexing audit and maintenance

## Public-site baseline: October 12, 2026

The deployed sitemap contained 100 URLs: six directory/static pages, 77 district guides, seven provinces, four destinations and six stories. The [per-URL baseline](baseline-2026-10-12.csv) records the production site **before this branch is deployed**.

All 100 URLs returned HTTP 200, had exactly one matching canonical and one H1, had a title and description, and did not declare `noindex`. Titles and descriptions were unique across those URLs. Every non-homepage URL had at least one incoming HTML link from another audited page. The live robots.txt and sitemap.xml both returned 200. HTTP and www homepage variants resolved to the HTTPS non-www homepage.

These are technical observations from our HTTP requests. They do not prove what Googlebot received, confirm Google indexing, establish content quality, or identify the reasons behind individual Search Console exclusions. Search-engine snippets and their crawl timestamps are not substitutes for Search Console URL Inspection.

## Confirmed issues addressed

| Issue | Change |
| --- | --- |
| `/search`, `/admin/login`, and `/studio` inherited the homepage's indexable metadata | Explicit route metadata now sets `noindex`; search retains `follow`. The public login path is allowed in robots.txt so its noindex can be read; other dashboard restrictions remain. |
| Two story titles ended in `bloggyNepal | bloggyNepal` | Shared title formatting removes a terminal brand suffix before adding it once, and uses an absolute title to avoid the root template adding it again. |
| Listings/stories used a hardcoded Sanity project while details/sitemap used environment variables and a different CDN policy | Both import paths now share the environment-configured client with the published perspective. ISR regeneration reads fresh data from Sanity's API. Existing route revalidation intervals remain. |
| The story fetcher caught every CMS error and returned null, which became a missing-page response | CMS failures propagate as server errors; missing documents still produce 404. React request caching shares story data between metadata and content. Failed ISR regeneration can retain the previous successful page. |
| Detail metadata returned fallback metadata for missing documents | All four content detail routes now call `notFound()` during metadata generation as well as page rendering. |
| Search could include documents without slugs; repeated `q` parameters could produce a non-string query | Search requires a nonempty slug and handles repeated query parameters. Destination listings exclude missing/empty slugs too. |

The two observed title duplicates were the Panch Pokhari bike/trek story and the Shivapuri/Nagi Gumba story. The configuration and error-handling changes fix code risks; they are **not demonstrated causes** of the current Google crawl backlog.

## Repeat the audit

Install Python 3.10+; no Python packages are required. From the repository root:

```bash
npm run audit:seo
```

The report is written to `reports/seo-audit.csv` (ignored by Git). The command checks response status, final URL, Googlebot robots rules, noindex directives, canonical URLs, titles, descriptions and H1s. Duplicate titles/descriptions are compared within the audited set.

To audit the actual examples exported from a Search Console exclusion report:

```bash
npm run audit:seo -- --urls "D:/Downloads/Table.csv"
```

Only pass URLs from one origin per run. Use `--base-url` to select that origin. The default input is the site's URL sitemap; sitemap-index traversal is not implemented. This tool reads HTML and does not execute browser JavaScript or call Google's URL Inspection API.

- `PASS`: these technical checks passed; indexing is not confirmed.
- `REVIEW`: metadata or heading warnings need human review.
- `FIX`: a response, robots, or canonical conflict needs review **if the URL is intended to be indexed**. Redirects, canonical alternates and intentional noindex pages from GSC may be correct and need no change.
- Exit codes: 0 = no hard flags, 1 = hard flags found, 2 = audit input/setup failure.

Parser regression checks:

```bash
python -m unittest discover -s scripts/tests -v
```

## Deployment and Search Console follow-up

1. Review and merge the change, then wait for Vercel's deployment to finish.
2. Re-run the audit on production. Check the two affected story titles and inspect the rendered noindex on search, login and Studio.
3. Confirm `/sitemap.xml` remains successful in Search Console. Do not repeatedly resubmit an unchanged sitemap.
4. Export the **Examples** tables for “Crawled - currently not indexed” and “Discovered - currently not indexed.” Aggregate chart exports do not contain those URLs.
5. Inspect representative priority URLs in Search Console: last crawl, fetch status, indexing allowed, user canonical and Google-selected canonical. Use Test Live URL to check the deployed response. Request indexing for a few improved priority guides after verifying them.
6. Review redirect and alternate-canonical examples before deciding to change them. Keep intentional exclusions; fix sitemap/internal links only when they point to the wrong version.
7. Review the Shivapuri story in Sanity. Its excerpt and body contain bracketed numeric references, including `[1, 2]`. Replace them with meaningful source attribution or remove confirmed drafting residue editorially. Do not globally strip all numeric citations in the renderer.
8. Recheck the dated GSC report after Google recrawls. Technical eligibility and sitemap submission do not guarantee indexing or timing.

## Validation and limits

The public production crawl covers every URL in the observed sitemap. The optimized Next.js build and TypeScript compilation pass using the public Sanity dataset. Supabase and Resend use **placeholder** values during local build verification; authenticated admin, email and engagement integrations are outside this change's validation. Changed TypeScript files pass ESLint, and the audit parser has eight passing regression checks. Production-server smoke checks pass for noindex on search/login/Studio, repeated search parameters, both corrected story titles, all four content-route 404s, and the sitemap response. A simulated CMS outage propagates as an error, while a missing story produces the Next.js 404 signal.

Publishing uses the existing `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and optional `NEXT_PUBLIC_SANITY_API_VERSION` environment variables consistently. Ensure they point to the intended production dataset. Reading Sanity's origin during regeneration avoids stale CDN snapshots but can increase origin requests; dynamic search also uses this shared client.

References:

- [Google: sitemap crawling is not guaranteed](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google: noindex requires crawler access](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: troubleshoot crawling](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [Sanity: CDN configuration for static sites](https://www.sanity.io/docs/help/js-client-cdn-configuration)
- [Sanity: published perspectives](https://www.sanity.io/docs/content-lake/perspectives)
