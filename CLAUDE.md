# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (http://localhost:4321)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

There are no tests or a linter configured.

## Architecture

**Putaoso** is a static Astro site — a wine grape variety field guide (葡萄品种图鉴). All pages are generated at build time; there is no client-side JS framework.

### Routing

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Grid of all variety cards |
| `/:slug` | `src/pages/[slug].astro` | Detail page, only generated for `status: live` entries |

### Content layer

Varieties live in `src/content/varieties/*.md` as frontmatter-only markdown files (no body text — all content is in the frontmatter). The schema is defined in `src/content/config.ts` and is strict: every variety must have exactly 3 `regions`, 3 `bottles`, and 3 `similar` entries.

**`status` field controls visibility:**
- `live` — detail page generated, card is clickable
- `draft` / `planned` — card shown on index with "即将推出" stamp, no detail page

**`type` field drives the palate chart:** red varieties use `tannin`, white/rosé use `sweetness` — the schema marks both optional but the relevant one must be present.

**Inline markdown** (`**bold**`) is supported in several string fields (`caveat`, `pairing_intro`, `region.body`, `history[]`, etc.) via a small `md()` helper in `[slug].astro` that converts `**x**` → `<strong>x</strong>`.

**YAML gotcha — `**` at the start of a list item:** YAML treats a leading `*` as an alias reference, so a `history` / `flavors_casual` / `pairings` entry that begins with `**加粗**...` will fail to parse. Put bold mid-sentence, or rephrase so the line starts with a normal character.

**Style conventions for content fields:**
- `regions[].badge` — short English phrase in "The XXX" form (e.g. "The Old World", "The Hidden Gem"). Rendered uppercase in monospace; **don't use Chinese** here.
- `card_origin_short` — local-language place name (Bordeaux, Mosel, 宁夏, 怀来). Foreign regions stay in their native spelling; Chinese regions use Chinese.
- `aliases` — alternative names only (Garnacha, Shiraz, 解百纳); don't repeat `name_cn`. Omit the field entirely if there's no real alternative.

### Components

- `BaseLayout.astro` — HTML shell, Google Fonts, nav, footer. Accepts `containerWidth` (`narrow` | `wide`) and `wideFooter` props.
- `Scene.astro` — dispatch component that renders one of four SVG illustration scenes based on `hero_scene`. Adding a new scene means creating a new file in `src/components/scenes/` and wiring it here.
- `Palate.astro` — renders the 4-metric dot-bar chart (acidity, tannin/sweetness, body, beginner difficulty).

### Styles

All CSS is in `src/styles/global.css` (one file, no CSS modules or utility framework). Components do not have scoped styles.

### Deployment

The site deploys to Cloudflare Pages via GitHub auto-deploy. `wrangler.jsonc` at the project root configures the static asset deployment — it points wrangler at the `dist/` output directory. No SSR adapter is used; the site is fully static.

### Cache gotcha

If the dev server throws *"No cached compile metadata found"* for an `.astro` virtual module, clear the Vite and Astro caches and restart:

```bash
rm -rf node_modules/.vite .astro/astro
npm run dev
```
