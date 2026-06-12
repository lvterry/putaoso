import { getLiveVarieties, Variety } from '../../utils/data';
import { tagLabel, typeLabel } from '../../utils/format';

const MAX_SELECTED = 4;

interface CompareCard {
  slug: string;
  name_cn: string;
  name_en: string;
  type: string;
  typeText: string;
  origin: string;
  flavors_professional: string;
  palate: Variety['palate'];
  priceText: string;
  pairings: string[];
  tags: string[];
}

function toCompareCard(v: Variety): CompareCard {
  return {
    slug: v.slug,
    name_cn: v.name_cn,
    name_en: v.name_en,
    type: v.type,
    typeText: typeLabel(v.type),
    origin: v.origin,
    flavors_professional: v.flavors_professional,
    palate: v.palate,
    priceText: `¥${v.price.min} – ${v.price.max}`,
    pairings: v.pairings,
    tags: v.flavor_tags.map(tagLabel),
  };
}

Page({
  data: {
    options: [] as Array<{ slug: string; name_cn: string; name_en: string; type: string }>,
    selected: [] as string[],
    cards: [] as CompareCard[],
  },

  onLoad() {
    this.setData({
      options: getLiveVarieties().map((v) => ({
        slug: v.slug,
        name_cn: v.name_cn,
        name_en: v.name_en,
        type: v.type,
      })),
    });
  },

  onToggle(event: WechatMiniprogram.CustomEvent<{ slug: string }>) {
    const { slug } = event.detail;
    const selected = this.data.selected.slice();
    const at = selected.indexOf(slug);

    if (at !== -1) {
      selected.splice(at, 1);
    } else {
      if (selected.length >= MAX_SELECTED) {
        wx.showToast({ title: `最多对比 ${MAX_SELECTED} 个品种`, icon: 'none' });
        return;
      }
      selected.push(slug);
    }

    const bySlug: Record<string, Variety> = {};
    getLiveVarieties().forEach((v) => {
      bySlug[v.slug] = v;
    });

    this.setData({
      selected,
      cards: selected.map((s) => toCompareCard(bySlug[s])),
    });
  },

  onGoDetail(event: WechatMiniprogram.TouchEvent) {
    const { slug } = event.currentTarget.dataset as { slug: string };
    wx.navigateTo({ url: `/pages/detail/detail?slug=${slug}` });
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: '品种对比 · 葡萄搜',
      path: '/pages/compare/compare',
    };
  },
});
