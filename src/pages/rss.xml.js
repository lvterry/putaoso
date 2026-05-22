import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const all = await getCollection('varieties');
  const live = all.filter((v) => v.data.status === 'live');

  return rss({
    title: '葡萄搜 · 葡萄品种图鉴',
    description: '一本随手翻的葡萄品种图鉴。慢慢读，找到属于你的那一颗。',
    site: context.site,
    items: live.map((v) => {
      const d = v.data;
      const desc = `${d.name_cn}（${d.name_en}）— ${d.card_tagline} ${d.flavors_professional}`.slice(0, 155);
      return {
        title: `${d.name_cn} ${d.name_en}`,
        description: desc,
        pubDate: d.publishedAt ?? new Date(),
        link: new URL(`/${v.slug}`, context.site).toString(),
      };
    }),
  });
}
