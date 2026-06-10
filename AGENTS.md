# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (http://localhost:4321)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run ios:data       # export Astro content to ios/Putaoso/Resources/varieties.json
npm run ios:resources  # export iOS JSON data and JPEG illustrations
npm run ios:generate   # regenerate ios/Putaoso.xcodeproj from ios/project.yml
```

There are no npm tests or a linter configured. The iOS app has an XCTest UI target; build/test it with Xcode or `xcodebuild`.

## Architecture

**Putaoso** is a wine grape variety field guide (葡萄品种图鉴) with two surfaces:

- A fully static Astro website generated at build time.
- A native SwiftUI iOS app in `ios/` that consumes exported website content.

The Astro content collection is the source of truth for grape variety data.

### Routing

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Editorial cover, interactive world map, variety picker, and full variety grid |
| `/:slug` | `src/pages/[slug].astro` | Detail page, only generated for `status: live` entries |
| `/compare` | `src/pages/compare.astro` | Client-side comparison view; selected slugs are stored in the URL hash |
| `/api/varieties.json` | `src/pages/api/varieties.json.ts` | JSON API for live variety comparison data |
| `/rss.xml` | `src/pages/rss.xml.js` | RSS feed for live varieties |
| `/llms.txt` | `src/pages/llms.txt.ts` | LLM-readable site summary |
| `/privacy` | `src/pages/privacy.astro` | Privacy page |
| `/404` | `src/pages/404.astro` | Static 404 page |

`astro.config.mjs` sets `build.format = 'file'`, so static output uses paths like `compare.html` instead of `compare/index.html`.

### Content layer

Varieties live in `src/content/varieties/*.md` as frontmatter-only markdown files (no body text — all content is in the frontmatter). The schema is defined in `src/content/config.ts` and is strict: every variety must have exactly 3 `regions`, 3 `bottles`, and 3 `similar` entries.

**`status` field controls visibility:**
- `live` — detail page generated, card is clickable
- `draft` / `planned` — card shown on index with "Coming Soon" stamp, no detail page

**`type` field drives the palate chart:** red varieties use `tannin`, white/rosé use `sweetness` — the schema marks both optional but the relevant one must be present.

**Inline markdown** (`**bold**`) is supported in several string fields (`caveat`, `pairing_intro`, `region.body`, `history[]`, etc.) via a small `md()` helper in `[slug].astro` that converts `**x**` → `<strong>x</strong>`.

**YAML gotcha — `**` at the start of a list item:** YAML treats a leading `*` as an alias reference, so a `history` / `flavors_casual` / `pairings` entry that begins with `**加粗**...` will fail to parse. Put bold mid-sentence, or rephrase so the line starts with a normal character.

**Style conventions for content fields:**
- `regions[].badge` — short English phrase in "The XXX" form (for example "The Old World", "The Hidden Gem"). Rendered through label mappings on detail pages; don't use Chinese here.
- `regions[].name_en` — must match a key in `src/data/region-coords.json` when the region should appear on the website hero map and in the iOS map.
- `card_origin_short` — local-language place name (Bordeaux, Mosel, 宁夏, 怀来). Foreign regions stay in their native spelling; Chinese regions use Chinese.
- `aliases` — alternative names only (Garnacha, Shiraz, 解百纳); don't repeat `name_cn`. Omit the field entirely if there's no real alternative.

### Components

- `BaseLayout.astro` — HTML shell, Google Fonts, nav, footer, canonical/social metadata, JSON-LD, RSS/API discovery links, and privacy-aware analytics loading. Accepts `containerWidth` (`narrow` | `wide`), `wideFooter`, `hideHeader`, `structuredData`, `robots`, and `navMeta` props.
- `HeroMap.astro` — interactive homepage world map using `d3-geo`, `topojson-client`, `world-atlas`, and `src/data/region-coords.*`.
- `VarietyPicker.astro` — dialog used by the homepage and compare page; exposes `window.openVarietyPicker()` and writes compare selections to `/compare#slug,slug`.
- `Scene.astro` — renders `public/illustrations/{slug}.svg` for known varieties, with the older scene components as fallbacks based on `hero_scene`.
- `Palate.astro` — renders the 4-metric dot-bar chart (acidity, tannin/sweetness, body, beginner difficulty).

### Styles

Most CSS is in `src/styles/global.css` (one file, no CSS modules or utility framework). `VarietyPicker.astro` also includes `style is:global` for its dialog-specific styles.

### iOS app

The native app lives under `ios/` and is generated with XcodeGen:

- `ios/project.yml` is the project definition. Update it first, then run `npm run ios:generate` to refresh `ios/Putaoso.xcodeproj`.
- `ios/Putaoso/Sources/` contains the SwiftUI app (`PutaosoApp`, `ContentView`, `DetailView`, `Models`, `VarietyStore`, `PalateView`, `Theme`, `SVGView`).
- `ios/PutaosoUITests/` contains UI tests, currently including a map callout screenshot test.
- `ios/Putaoso/Resources/varieties.json` is generated from `src/content/varieties/*.md` by `scripts/export-ios-data.mjs`.
- `ios/Putaoso/Resources/Illustrations/*.jpg` are generated from `public/illustrations/*.svg` by `scripts/export-ios-illustrations.mjs` using macOS `qlmanage` and `sips`.
- `ios/project.yml` runs both export scripts as a pre-build step, so content and illustration changes flow into the iOS bundle during Xcode builds.

When changing content fields used by both platforms, update the Astro schema, the export script, and the Swift `Codable` models together.

### Deployment

The site deploys static assets to Cloudflare via `wrangler.jsonc`, which points wrangler at the `dist/` output directory. No SSR adapter is used; the website is fully static. `@astrojs/sitemap` generates the sitemap from the configured `site` URL.

### Cache gotcha

If the dev server throws *"No cached compile metadata found"* for an `.astro` virtual module, clear the Vite and Astro caches and restart:

```bash
rm -rf node_modules/.vite .astro/astro
npm run dev
```
