# Multi-language support for Putaoso

## Context

Putaoso is currently a Chinese-only Astro static site (a wine grape field guide). The user wants it to serve four languages — Chinese (default), English, German, Spanish — with:

1. Auto-detection of the visitor's system language on first visit (client-side redirect, then cookie-remembered).
2. A simple language switcher at the top-right of every page for manual override.
3. Full translation of both UI chrome and the 20 variety entries, so each locale reads natively rather than as a partial overlay.

URLs: Chinese stays at root (no breakage). English/German/Spanish are prefixed: `/en/...`, `/de/...`, `/es/...`. The site is statically built for Cloudflare Pages — no SSR, so detection must run in the browser.

## Architecture

### Locales & routing

- `zh` (default, no prefix), `en`, `de`, `es` (prefixed).
- Existing `src/pages/index.astro` and `src/pages/[slug].astro` stay as the **zh routes** (URLs unchanged).
- New `src/pages/[lang]/index.astro` and `src/pages/[lang]/[slug].astro` generate routes for `en`/`de`/`es` via `getStaticPaths` (cross-product of 3 locales × 20 live varieties = 60 detail pages + 3 indexes).
- Page bodies are extracted into shared template components so the four route files are thin wrappers.

### Content schema — additive `i18n` block (not field-replacement)

Each variety markdown file keeps its current Chinese fields at top level (zero zh regression risk, no diff-history churn). An optional `i18n: { en, de, es }` block is appended, mirroring the translatable field structure. A `pickContent` helper resolves `entry.data.i18n?.[locale]?.[field] ?? entry.data[field]`, so a missing translation transparently falls back to Chinese.

Translatable fields (per [src/content/config.ts](src/content/config.ts)): `name_en`, `name_cn`, `aliases[]`, `origin`, `hero_quote`, `hero_scene_caption`, `flavors_professional`, `flavors_casual[]`, `history[]`, `palate.*_label` (5), `caveat`, `pairing_intro`, `pairings[]`, `avoid`, `regions[].name_en/name_cn/badge/body`, `bottles[].name_en/name_cn/body`, `similar[].name_en/name_cn/body`, `card_tagline`, `card_origin_short`.

Numeric and structural fields (`palate.acidity` etc., `price`, `type`, `status`, `parents.*`, `similar[].slug`, tags, flags) are locale-independent and stay top-level.

### UI string dictionary

`src/i18n/ui.ts` — typed dict `ui[locale][key]`, values are string or `(arg) => string` for two interpolated strings (`section.similar.heading`, `map.origin`). Keys cover everything currently hardcoded in [BaseLayout.astro](src/layouts/BaseLayout.astro), [index.astro](src/pages/index.astro), [[slug].astro](src/pages/[slug].astro), [Palate.astro](src/components/Palate.astro), [HeroMap.astro](src/components/HeroMap.astro).

`src/i18n/utils.ts` — helpers:
- `getLocaleFromUrl(url)` — first path segment, or `'zh'`.
- `t(locale, key, arg?)` — lookup with zh fallback.
- `localizedPath(slug, locale)` — `'/'+slug` for zh, `'/'+locale+'/'+slug` otherwise.
- `pickContent(entry, locale, field)`, `pickArray(entry, locale, 'regions'|'bottles'|'similar')`, `pickPalate(entry, locale)`.
- `displayName(entry, locale)` — `name_cn` for zh, else `i18n[locale].name_en ?? data.name_en` (for the "喜欢X，还可以试试" interpolation and similar use).

### Auto-detect redirect

Inline `<script is:inline>` in the BaseLayout `<head>`, runs on every page (not just `/`) so deep links from foreign search results redirect correctly:

1. Read `lang-pref` cookie (or `localStorage`). If present and matches current URL locale → done. If present but mismatched → `location.replace` to the sibling URL in the preferred locale.
2. If no preference: read `navigator.language`, map prefix (`zh-*`→zh, `de-*`→de, `es-*`→es, else en), write the cookie, redirect if needed.

Uses `location.replace` to keep history clean. Brief flicker is unavoidable on a static site; using `is:inline` in `<head>` minimizes it.

### Language switcher

`src/components/LangSwitcher.astro` — four short links `ZH · EN · DE · ES`, the current one styled active. `href` built via `localizedPath(slug, l)`. A delegated `click` listener writes the `lang-pref` cookie synchronously so the choice persists. Positioned top-right via CSS (works whether the page renders the nav or sets `hideHeader`).

### `<html lang>` & SEO

- BaseLayout takes `locale` and `slug` props. `<html lang>` becomes `{zh:'zh-CN', en:'en', de:'de', es:'es'}[locale]`.
- Emit `<link rel="alternate" hreflang>` tags for each locale variant of the current page, plus `<link rel="canonical">`, so search engines understand the relationship and the JS redirect doesn't cause duplicate-content issues.

### RSS

[src/pages/rss.xml.js](src/pages/rss.xml.js) stays zh-only for v1. Per-locale RSS can be added later as `src/pages/[lang]/rss.xml.js` if there's demand — content firehose is identical across locales, so 4 feeds is mostly duplication.

## Files

| File | Change |
|---|---|
| [src/content/config.ts](src/content/config.ts) | Add `localeStrings` zod schema + optional `i18n: { en?, de?, es? }` field on the variety schema. |
| `src/i18n/ui.ts` | NEW. Locales list, `Locale` type, `defaultLocale`, full UI dict for zh/en/de/es. |
| `src/i18n/utils.ts` | NEW. `getLocaleFromUrl`, `t`, `localizedPath`, `pickContent`, `pickArray`, `pickPalate`, `displayName`. |
| [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) | Add `locale`, `slug` props; dynamic `<html lang>`; inline auto-detect script in `<head>`; render `<LangSwitcher>`; localize brand/footer/meta; emit `hreflang`/`canonical` links. |
| `src/components/LangSwitcher.astro` | NEW. Four-link switcher; cookie-write click listener. |
| `src/components/IndexPage.astro` | NEW. Body of current [index.astro](src/pages/index.astro); takes `locale`+`varieties`; uses `t()` and `localizedPath()`. |
| `src/components/VarietyPage.astro` | NEW. Body of current [[slug].astro](src/pages/[slug].astro); takes `locale`,`entry`,`all`; uses `t()`, `pickContent`, `pickArray`, `pickPalate`, `displayName`, `localizedPath` (for `similar[]` links). Keeps the `md()` helper from [[slug].astro:33](src/pages/[slug].astro:33). |
| [src/components/Palate.astro](src/components/Palate.astro) | Add `locale` prop; replace hardcoded labels with `t(locale, …)`. |
| [src/components/HeroMap.astro](src/components/HeroMap.astro) | Add `locale` prop; localize type labels, close aria, CTA, hint, popup origin prefix. Pass strings into the inline script via `data-i18n-*` attributes on the wrapper; fill marker data-attributes via `pickContent`/`pickArray` for the active locale. |
| [src/pages/index.astro](src/pages/index.astro) | Slim wrapper: `<IndexPage locale="zh" varieties={...} />`. |
| [src/pages/[slug].astro](src/pages/[slug].astro) | Slim wrapper: `<VarietyPage locale="zh" entry={...} all={...} />`. |
| `src/pages/[lang]/index.astro` | NEW. `getStaticPaths` over non-zh locales; renders `IndexPage`. |
| `src/pages/[lang]/[slug].astro` | NEW. `getStaticPaths` over (non-zh × live varieties); renders `VarietyPage`. |
| `src/content/varieties/*.md` (×20) | Append `i18n:` block with en/de/es translations of the translatable fields. |
| [src/styles/global.css](src/styles/global.css) | `.lang-switcher`, `.lang-link`, `.lang-link.active` styles; top-right positioning that works with and without the header. |

## Content translation workflow

~28 translatable fields × 20 varieties × 3 new languages ≈ 1700 strings. Done in three phases to de-risk:

**Phase A — plumbing only, no content.** Land schema + helpers + routes + switcher + redirect script + UI dict. With no `i18n:` blocks populated, `/en/cabernet-sauvignon` renders English UI chrome but Chinese body text via fallback. Verifies the pipeline, lets us catch routing/HeroMap/script issues before bulk translation work.

**Phase B — one canonical variety, hand-translated.** Pick `cabernet-sauvignon.md` (well-known reference). Append `i18n:` to the existing frontmatter — do **not** rewrite the file. Review English/German/Spanish for tone; this becomes the style template for the others.

**Phase C — batch translate the remaining 19.** Parallel agent tasks, one variety per agent. Each agent receives (a) the source `.md`, (b) the reviewed cabernet-sauvignon as style/structure reference, (c) the schema. Each agent appends an `i18n:` block to its target file — append-only edits preserve `git blame` and avoid touching the Chinese source-of-truth.

## Pitfalls

1. **YAML `**leading-asterisk` gotcha** ([CLAUDE.md:38](CLAUDE.md:38)). Applies to every locale's `history[]`/`flavors_casual[]`/`pairings[]`. Brief the translators (agents and humans) in writing.
2. **`md()` with locale fallback.** Wrap with `?? ''` so a missing field can never become `md(undefined)`.
3. **HeroMap inline script.** It runs in the browser and currently builds popup HTML with hardcoded Chinese (`原产 ${origin}`, `查看详情 →`). Pass the localized prefixes via `data-i18n-*` on the wrapper element; populate marker data-attrs from `pickContent`/`pickArray` for the current locale.
4. **`喜欢{name}，还可以试试`** (similar-section heading at [[slug].astro:183](src/pages/[slug].astro:183)). For non-zh, use `displayName(entry, locale)` (typically the Latin name) rather than `name_cn`.
5. **Hero/card variety name.** `name_en` (Latin) is locale-independent — Cabernet Sauvignon doesn't translate. Default to the top-level `name_en` for all locales unless an `i18n[locale].name_en` override exists. On non-zh, omit the `.hero-cn` subhead unless explicitly overridden.
6. **Cookie write before navigation.** Synchronous `document.cookie = …` in a click handler runs before the link follows, so the cookie is set when the next page loads — verified-safe.
7. **Astro cache.** After schema changes: `rm -rf node_modules/.vite .astro && npm run dev` ([CLAUDE.md:60](CLAUDE.md:60)).
8. **Searchbots.** Googlebot doesn't run the redirect JS reliably; that's fine — each canonical URL is its own page, and `hreflang` tags declare the relationship.

## Verification

After **Phase A** lands:
- `npm run dev`, visit `/` → renders identically to today.
- Visit `/en/`, `/de/`, `/es/` → UI chrome translates; card content falls back to Chinese.
- Visit `/en/cabernet-sauvignon` → page renders with English chrome; detail body in Chinese.
- Click the switcher; URL updates; cookie set (check DevTools → Application → Cookies).
- Hard-reload `/` after setting cookie to `de` → redirects to `/de/`.
- Clear cookies, set browser language to German, reload `/` → redirects to `/de/`.
- Run `npm run build` → no schema errors; `dist/` contains `index.html`, `en/index.html`, `de/index.html`, `es/index.html`, all 20 zh detail pages, and 20×3 = 60 prefixed detail pages.
- View source on each: `<html lang>` correct, `<link rel="alternate" hreflang>` tags present, canonical present.

After **Phase B/C**:
- Spot-check 3–4 varieties in each non-zh locale: hero quote, tasting notes, history, regions, bottles, similar links all render in the target language with no Chinese fallback bleeding through (except where intentional, e.g. Latin variety names).
- HeroMap popup in each locale: marker labels, origin prefix, CTA text all localized.
- RSS feed at `/rss.xml` still works (zh-only).

## Critical files to read before implementing

- [src/content/config.ts](src/content/config.ts) — schema shape, before adding `i18n`.
- [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) — head injection point, nav structure, `hideHeader` interaction.
- [src/pages/[slug].astro](src/pages/[slug].astro) — full body to extract into `VarietyPage.astro`, `md()` helper.
- [src/pages/index.astro](src/pages/index.astro) — body to extract into `IndexPage.astro`, cover markup.
- [src/components/HeroMap.astro](src/components/HeroMap.astro) — inline script with hardcoded Chinese; trickiest file.
- [src/components/Palate.astro](src/components/Palate.astro) — 5 label strings to externalize.
- One representative variety: [src/content/varieties/cabernet-sauvignon.md](src/content/varieties/cabernet-sauvignon.md) — to design the `i18n:` block shape against real content.