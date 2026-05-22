# SEO improvements

Putaoso is a static Astro site (Chinese-language wine grape field guide, 16 live varieties). Content is strong but SEO plumbing is mostly absent: no sitemap, no robots.txt, no Open Graph / Twitter card tags, no JSON-LD, no favicon, no alt text on hero SVGs. `astro.config.mjs` already sets `site: 'https://putaoso.com'` so sitemap generation will work out of the box.

Each todo below is one self-contained diff for the coder/reviewer loop.

## Todo

- [ ] **Install and configure `@astrojs/sitemap`.** `npm i @astrojs/sitemap`, then add it to `integrations` in `astro.config.mjs`. Verify `npm run build` produces `dist/sitemap-index.xml` + `dist/sitemap-0.xml` listing `/` and each live variety slug. No code outside `astro.config.mjs` and `package.json`/lockfile should change.

- [ ] **Add `public/robots.txt`.** Create `public/robots.txt` with `User-agent: *`, `Allow: /`, and `Sitemap: https://putaoso.com/sitemap-index.xml`. Single file, no other changes.

- [ ] **Add favicon and social preview assets.** Drop into `public/`: `favicon.svg` (simple grape glyph or "葡" character), `favicon.ico` fallback, `apple-touch-icon.png` (180×180), and `og-image.png` (1200×630, branded). Then in `src/layouts/BaseLayout.astro` add the corresponding `<link rel="icon">`, `<link rel="apple-touch-icon">`, and `<meta name="theme-color">` tags to `<head>`. Single coherent diff covering assets + head wiring.

- [ ] **Extend BaseLayout `<head>` with canonical, Open Graph, and Twitter Card tags.** In `src/layouts/BaseLayout.astro`: accept new optional props `ogImage` (defaults to `/og-image.png`) and `ogType` (defaults to `'website'`). Compute the canonical URL from `Astro.url` + `Astro.site`. Emit `<link rel="canonical">`, `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale` (`zh_CN`), `og:site_name`, plus `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`. Reuse the existing `title` / `description` props — don't duplicate them. No changes to page files yet.

- [ ] **Add per-variety `description` + JSON-LD on the detail page.** In `src/pages/[slug].astro`: replace the generic `hero_quote` description with a richer one built from `name_cn` + `name_en` + `card_tagline` + key flavor words (truncated to ~155 chars). Emit `ogType="article"` to BaseLayout. Add an inline `<script type="application/ld+json">` rendering a schema.org graph: a `BreadcrumbList` (Home → variety) and an `Article` (or `Thing`) node with `name`, `description`, `inLanguage: "zh-CN"`, `mainEntityOfPage`, `about` (the grape), and `isPartOf` pointing at the site. Keep the script generation in the frontmatter as a JS object passed through `JSON.stringify`.

- [ ] **Add homepage JSON-LD + sharpen meta.** In `src/pages/index.astro`: tighten the description (include "葡萄品种图鉴" + count of varieties) and emit a `WebSite` + `ItemList` JSON-LD graph listing each live variety with its URL and position. Build the list from the same `getCollection('varieties')` call already used for rendering — do not refetch.

- [ ] **Add alt text and semantic labelling to hero scene SVGs.** In `src/components/Scene.astro` and each of `src/components/scenes/*.astro` (`StudyStillLife`, `VineyardDawn`, `ChateauSundown`, `SlateSlope`): add `role="img"` and `aria-label` to the root `<svg>` derived from the existing `hero_scene_caption` (or a scene-specific default when no caption is passed). Decorative inner shapes get `aria-hidden="true"`. Single sweep across these files.

- [ ] **Add `prefetch` hints and a `<link rel="alternate">` for the future RSS feed placeholder.** In `BaseLayout.astro`, add `<link rel="dns-prefetch" href="https://fonts.gstatic.com">` (preconnect already exists, dns-prefetch is the cheap fallback) and wire Astro's built-in `prefetch` via `prefetch` config in `astro.config.mjs` (`prefetch: { prefetchAll: false, defaultStrategy: 'viewport' }`) so variety card links prefetch on scroll. No RSS feed yet — skip the alternate link until that exists.

- [ ] **Generate an RSS feed of varieties.** `npm i @astrojs/rss`. Create `src/pages/rss.xml.js` exporting a feed of live varieties (title = `name_cn name_en`, description = the new meta description from the detail-page task, `pubDate` from frontmatter `publishedAt` if present). Add a `<link rel="alternate" type="application/rss+xml">` to `BaseLayout.astro`. Single coherent diff.

- [ ] **Add subsection H3s on the detail page for scannability.** In `src/pages/[slug].astro`, promote labelled sub-blocks inside the existing H2 sections (e.g., each region name inside `产区`, each bottle inside `酒款`, each pairing inside `搭配`) to `<h3>`. Purely structural — no content or styling changes beyond what's needed to keep the page looking the same (adjust `global.css` if h3 needs sizing to match current visual).

## Manual verification

- Run `npm run build` and inspect `dist/sitemap-0.xml` — confirm it lists `/` and each live variety URL with `https://putaoso.com` as the host.
- `curl -I https://putaoso.com/robots.txt` after deploy and confirm 200 + correct `Sitemap:` line.
- Paste a deployed variety URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and the [Twitter Card Validator](https://cards-dev.twitter.com/validator); confirm title, description, and og-image render.
- Paste a deployed variety URL into Google's [Rich Results Test](https://search.google.com/test/rich-results); confirm the `BreadcrumbList` and `Article` are detected with no errors.
- Run Lighthouse SEO audit on `/` and on one variety detail page; expect ≥95.
- Submit `https://putaoso.com/sitemap-index.xml` in Google Search Console.
- Visually confirm favicon + apple-touch-icon on iOS Safari "Add to Home Screen" and on a desktop browser tab.
- Use a screen reader (VoiceOver `Cmd+F5`) on a variety page to confirm hero SVGs announce a meaningful label rather than "image".
