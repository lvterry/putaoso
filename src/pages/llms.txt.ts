const llmsTxt = `﻿# Putaoso

> Putaoso (葡萄搜) is a Chinese-language static field guide to wine grape varieties.

The site helps readers compare grape varieties, understand flavor profiles, learn representative regions, and find approachable bottles and food pairings. It is fully static and generated from structured Astro content.

## Core Pages

- [Homepage](https://putaoso.com/): Editorial cover, interactive region map, variety picker, and full variety index.
- [Variety comparison](https://putaoso.com/compare): Client-side comparison table for selected live grape varieties.
- [RSS feed](https://putaoso.com/rss.xml): Feed of published variety guide entries.
- [Variety API](https://putaoso.com/api/varieties.json): Machine-readable JSON for live variety data.

## Representative Variety Guides

- [Cabernet Sauvignon](https://putaoso.com/cabernet-sauvignon): 赤霞珠 guide.
- [Pinot Noir](https://putaoso.com/pinot-noir): 黑皮诺 guide.
- [Riesling](https://putaoso.com/riesling): 雷司令 guide.
- [Chardonnay](https://putaoso.com/chardonnay): 霞多丽 guide.
- [Marselan](https://putaoso.com/marselan): 马瑟兰 guide.
- [Longyan](https://putaoso.com/longyan): 龙眼 guide.

## Machine-Readable Discovery

- [Sitemap index](https://putaoso.com/sitemap-index.xml): XML sitemap index.
- [Robots policy](https://putaoso.com/robots.txt): Crawler policy and sitemap location.
- [API catalog](https://putaoso.com/.well-known/api-catalog): Linkset catalog of public machine-readable resources.
- [Security contact](https://putaoso.com/.well-known/security.txt): Security contact metadata.
`;

export function GET() {
  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
