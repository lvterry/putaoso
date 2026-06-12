import { getVariety, isLive, Variety } from '../../utils/data';
import { formatNumber, typeLabel } from '../../utils/format';

// 与网站 [slug].astro 的 regionBadgeLabels 保持一致
const REGION_BADGE_MAP: Record<string, string> = {
  'The Heartland': '核心产区',
  'The Origin': '发源地',
  'The New World': '新世界',
  'The Accessible': '亲民入门',
  'The Classic': '经典产区',
  'The Powerful': '强劲风格',
  'The Portuguese Side': '葡萄牙一侧',
  'The Crisp Style': '清爽风格',
  'The Rich Style': '丰腴风格',
  'The Old World': '旧世界',
  'The Mineral': '矿物风格',
  'The Capital Side': '京城周边',
  'The Coastal Edge': '海岸边缘',
  'The China Flagship': '中国标杆',
  'The Frontier': '前沿产区',
  'The Coastal Voice': '海岸表达',
  'The Intense': '浓郁风格',
  'The Hidden Gem': '隐藏宝藏',
  'The Holy Land': '圣地',
  'Across the Rhine': '莱茵河对岸',
  'The Grand': '顶级表达',
  'The Altitude': '高海拔',
  'The New Burgundy': '新勃艮第',
  'The Southernmost': '南境产区',
  'The Pure Expression': '纯粹表达',
  'The Blend Partner': '混酿搭档',
  'The Italian Voice': '意式表达',
  'The Super-Tuscan': '超级托斯卡纳',
  'The Value': '性价比之选',
  'The Ice Wine Heartland': '冰酒核心',
  'The Western Trial': '西部尝试',
  'The Northern Reach': '北方延伸',
  'The Western Reach': '西部延伸',
  'The Blend': '混酿风格',
  'The Bold': '豪放风格',
  'The Old Country': '旧大陆故乡',
};

Page({
  data: {
    missing: false,
    v: null as Variety | null,
    numberStr: '',
    typeText: '',
    aliasText: '',
    parentsText: '',
    parentsNote: '',
    illustration: '',
    showIllustration: true,
    regions: [] as Array<Record<string, unknown>>,
    similar: [] as Array<Record<string, unknown>>,
  },

  onLoad(options: Record<string, string | undefined>) {
    const slug = options.slug || '';
    const v = getVariety(slug);

    if (!v || v.status !== 'live') {
      // 分享出去的 planned/draft 链接也不能出现坏页面
      this.setData({ missing: true });
      wx.setNavigationBarTitle({ title: '即将推出' });
      return;
    }

    wx.setNavigationBarTitle({ title: v.name_cn });

    this.setData({
      v,
      numberStr: formatNumber(v.number),
      typeText: typeLabel(v.type),
      aliasText: v.aliases && v.aliases.length > 0 ? v.aliases.join(' · ') : '',
      parentsText: v.parents && v.parents.p1 && v.parents.p2 ? `${v.parents.p1} × ${v.parents.p2}` : '',
      parentsNote: (v.parents && v.parents.note) || '',
      illustration: `/assets/illustrations/${v.slug}.jpg`,
      regions: v.regions.map((r) => ({
        ...r,
        badgeUpper: r.badge.toUpperCase(),
        badgeCn: REGION_BADGE_MAP[r.badge] || '',
      })),
      similar: v.similar.map((s) => ({ ...s, live: isLive(s.slug) })),
    });
  },

  onIllustrationError() {
    this.setData({ showIllustration: false });
  },

  onBackHome() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    const v = this.data.v;
    if (!v) {
      return {
        title: '葡萄搜 · 一本随手翻的葡萄品种图鉴',
        path: '/pages/index/index',
      };
    }
    return {
      title: `${v.name_cn} ${v.name_en} · 葡萄搜`,
      path: `/pages/detail/detail?slug=${v.slug}`,
      imageUrl: `/assets/illustrations/${v.slug}.jpg`,
    };
  },
});
