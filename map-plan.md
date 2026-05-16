# Hero Terroir Map — Implementation Spec

## Purpose

The homepage hero is a global, interactive map that plots every wine variety's regions as markers. It replaces a static SVG illustration and turns the hero into a navigational entry point: hover/click a marker → see key info → click through to the variety detail page. Visually it must feel like part of the editorial layout, not a third-party widget.

## Visual & layout

1. **Full-viewport width.** The map breaks out of the page's max-width container and spans the entire window. Implementation: position the map's wrapper `absolute` inside the hero section with `left: 50%; right: 50%; margin: 0 -50vw; width: 100vw`. The hero section itself stays inside the normal container so the title text sits at the same left margin as the rest of the page.

2. **Map as backdrop, text overlays.** The hero is a single relative-positioned block (no two-column grid). The map sits at `z-index: 1` filling the hero; the title/subtitle/tagline sit at `z-index: 3` flowing in normal left-aligned layout on top. The text wrapper has `pointer-events: none` so drag-pan works through it; interactive elements (none in the hero today) would need `pointer-events: auto` re-enabled individually.

3. **No gradient overlay between map and text.**

4. **Transparency blends the map into the page.**
   - Landmasses: wrap all country `<path>` elements in a `<g class="hm-lands">` and set `opacity: 0.18`. Land fill is `--paper` cream; ocean is transparent, so the page background (`--paper` in light mode, near-black wine in dark mode) shows through everywhere.
   - Markers: wrap all `<circle>` elements in a `<g class="hm-markers">` and set `opacity: 0.55`. Marker stroke is `rgba(245,240,232,0.5)`. On hover the active marker goes to full opacity and `r: 6`; sibling markers dim slightly via `.hm-markers:hover .hm-marker:not(:hover) { opacity: 0.7 }` to focus attention.
   - Country borders use `vector-effect: non-scaling-stroke` at `0.4px` with 40% alpha — barely there, just enough to read continents.

5. **Marker color by wine type.** Three classes drive fill color: `hm-marker` (red, default `#8b3a44`), `hm-marker-white` (`#c8a96b` gold), `hm-marker-rose` (`#c47070` pink). Each has a brighter hover variant.

6. **Projection.** d3-geo `geoNaturalEarth1`, fit to a fixed SVG viewBox (`1000 × 520`). The SVG uses `preserveAspectRatio="xMidYMid meet"` and fills 100% of its wrapper, so the map scales to fit the viewport while keeping continent proportions stable.

## Interactivity

7. **Default zoom is pre-zoomed (1.7×), centered.** On mount, apply `transform="translate(tx, ty) scale(1.7)"` to an inner `<g class="hm-viewport">`, with `tx = -VB_W * 0.7/2`, `ty = -VB_H * 0.7/2` so the zoom is centered, not anchored to a corner. This makes Europe / Americas read as a confident, full-bleed background instead of a small atlas.

8. **Pan via pointer drag.** Use Pointer Events (`pointerdown` / `pointermove` / `pointerup`) so mouse, trackpad, and touch all work. Convert pixel deltas to SVG units using `VB_W / svg.getBoundingClientRect().width`. Clamp `tx ∈ [-VB_W*(s-1), 0]` and `ty ∈ [-VB_H*(s-1), 0]` so the map can't be dragged off-screen. Set `svg.style.cursor` to `grab` / `grabbing`.

9. **No zoom.** No wheel handler, no pinch handler, no buttons. `MIN_SCALE === MAX_SCALE === 1.7`. The cursor must never trap the page's scroll wheel. This was an explicit reversal of an earlier "wheel-zoom with cursor anchor" implementation — the trapped-scroll UX was unacceptable.

## Marker click → info tooltip

11. **HTML tooltip, not SVG.** The popup is a `<div class="hero-map-popup">` sibling of the SVG inside the same wrapper, positioned absolutely with JS. This is critical so the popup can use real HTML typography (Cormorant Garamond italic, Noto Serif SC) matching the rest of the site — SVG `<text>` cannot.

12. **Tooltip contents (in this order):**
    - Region badge chip (small uppercased label like "经典产区"), 1px wine-red border
    - Region name English (Cormorant Garamond italic, 22px)
    - Region name Chinese (Noto Serif SC, 12px, faded)
    - Thin divider
    - Type chip (small dot color-coded red/gold/pink + label like "红葡萄 · Red")
    - Variety name English (Cormorant italic) and Chinese (Noto Serif SC) on separate lines
    - Card tagline (one-liner from `card_tagline`)
    - Meta row: `原产 {origin}` and price `¥min – max`
    - "查看详情 →" link to `/{slug}`
    - Close button (`×`) in the top-right corner

13. **Tooltip positioning.** When a marker is clicked, the tooltip is shown then measured (`offsetWidth` / `offsetHeight`); it places itself centered above the clicked marker, 12px above. If it would clip the top edge, flip to below. Horizontal position is clamped 6px inside the wrapper bounds. Recomputed every click — no scroll-following, no live re-position on pan.

14. **Click vs drag disambiguation.** Track a `moved` flag in the pointer-move handler. If pointer moves > ~1 SVG-unit between down and up, treat as a drag and suppress the marker click. Marker `pointerup` listener calls `e.stopPropagation()` so the document-level "click-outside dismiss" doesn't fire.

15. **Dismiss the tooltip on:** the close button, `Escape` key, or pointerdown outside the tooltip and outside any marker.

## Data flow

16. **Marker data is generated at build time.** In the Astro component frontmatter:
    - Load the `varieties` content collection
    - Filter to `status: 'live'`
    - Flatten each variety's 3 regions
    - Look up each region's `[lat, lng]` in a hand-curated `src/data/region-coords.ts` keyed by `region.name_en`
    - Project to SVG `(x, y)` using the same `geoNaturalEarth1` projection
    - Emit each marker as a `<circle>` with `data-*` attributes for every field the tooltip needs (`data-slug`, `data-variety-en`, `data-variety-cn`, `data-type`, `data-type-label`, `data-tagline`, `data-origin`, `data-price-min`, `data-price-max`, `data-region-en`, `data-region-cn`, `data-region-badge`)
    - Warn (`console.warn`) at build time for any region missing a coord entry

17. **No d3-geo or topojson code on the client.** Projection runs only in the Astro frontmatter (Node, build time). The client receives static `<path d="…">` strings for ~177 countries, ~48 `<circle>` elements, and ~80 lines of vanilla JS for pan + tooltip. No external runtime dependencies, no tile fetches, no API calls.

18. **Country geometry source.** `world-atlas/countries-110m.json` (TopoJSON, ~100KB at build time), decoded with `topojson-client`'s `feature()` to GeoJSON, then run through `d3-geo`'s `geoPath(projection)` to produce one SVG path string per country. The 110m simplification level is intentional — clean continent silhouettes, no political detail to look at.

19. **Overlapping marker jitter.** After projection, scan markers in order: if a marker is within 5 SVG units of an already-placed marker, push it outward along an expanding spiral (12 angles × 2 rings) until it has space. This keeps the 6 French regions and 4 Italian regions individually clickable without overlapping circles.

## Stack

20. **Dependencies:** `d3-geo`, `topojson-client`, `world-atlas` (+ TypeScript types). All three are build-time only — nothing ships to the client. Earlier attempts used Leaflet + CartoDB tiles; both were removed because raster tiles read as a third-party widget inside the editorial layout, the tile chrome (zoom buttons, attribution bar) couldn't be hidden cleanly, and a CartoDB support overlay surfaced through the tiles.

## Critical files

- `src/components/HeroMap.astro` — projection at build time + client pan/tooltip script
- `src/data/region-coords.ts` — region-name → `[lat, lng]` lookup (one entry per unique `name_en` across the content collection)
- `src/pages/index.astro` — hero section structure (`.cover` with `.cover-bg` backdrop + `.cover-text` overlay)
- `src/styles/global.css` — `.cover`, `.cover-bg`, `#hero-map`, `.hm-lands`, `.hm-markers`, `.hm-marker`, `.hm-marker-{red,white,rose}`, `.hero-map-popup` and its children, `.hero-map-hint`. Plus a `--paper-rgb` token added to `:root` and the dark-mode block so `rgba(var(--paper-rgb), α)` works in both themes.

## Verification checklist

- Map spans the full viewport at every breakpoint; no hard edge between map and page background.
- All ~48 markers visible, dense France/Italy cluster readable.
- Drag pans smoothly on mouse, trackpad, and touch; pan is clamped to map bounds.
- Two-finger trackpad scroll over the map scrolls the page normally — map does **not** consume wheel events.
- Click any marker → tooltip appears with correct region, variety, tagline, origin, price; "查看详情 →" navigates to `/{slug}`.
- ESC / outside-click / close-button all dismiss the tooltip.
- Production build (`dist/index.html`) contains all country paths and marker data inlined; network tab on load shows zero requests to any tile or map service.
- Build console shows no "missing coords for region" warnings.