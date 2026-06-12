import { getAllVarieties, getLiveVarieties, Variety } from '../../utils/data';
import { typeLabel } from '../../utils/format';

interface Card {
  slug: string;
  name_cn: string;
  name_en: string;
  card_tagline: string;
  card_origin_short: string;
  type: string;
  typeText: string;
  live: boolean;
}

interface RegionVariety {
  slug: string;
  name_cn: string;
  name_en: string;
  type: string;
  typeText: string;
  live: boolean;
  tagline: string;
}

interface RegionInfo {
  markerId: number;
  name_en: string;
  name_cn: string;
  latitude: number;
  longitude: number;
  varieties: RegionVariety[];
}

function toCard(v: Variety): Card {
  return {
    slug: v.slug,
    name_cn: v.name_cn,
    name_en: v.name_en,
    card_tagline: v.card_tagline,
    card_origin_short: v.card_origin_short,
    type: v.type,
    typeText: typeLabel(v.type),
    live: v.status === 'live',
  };
}

function matches(v: Variety, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (v.name_cn.toLowerCase().indexOf(q) !== -1) return true;
  if (v.name_en.toLowerCase().indexOf(q) !== -1) return true;
  if (v.origin.toLowerCase().indexOf(q) !== -1) return true;
  if (v.card_origin_short.toLowerCase().indexOf(q) !== -1) return true;
  if ((v.aliases || []).some((a) => a.toLowerCase().indexOf(q) !== -1)) return true;
  // 产区英文名也可搜（如 Bordeaux）
  if (v.regions.some((r) => r.name_en.toLowerCase().indexOf(q) !== -1)) return true;
  if (v.regions.some((r) => r.name_cn.toLowerCase().indexOf(q) !== -1)) return true;
  return false;
}

/** 按产区聚合 live 品种，重叠坐标做轻微经度偏移避免完全遮挡 */
function buildRegions(): RegionInfo[] {
  const byRegion: Record<string, RegionInfo> = {};
  const order: string[] = [];

  getLiveVarieties().forEach((v) => {
    v.regions.forEach((r) => {
      if (!r.coordinate) return;
      if (!byRegion[r.name_en]) {
        byRegion[r.name_en] = {
          markerId: 0,
          name_en: r.name_en,
          name_cn: r.name_cn,
          latitude: r.coordinate.latitude,
          longitude: r.coordinate.longitude,
          varieties: [],
        };
        order.push(r.name_en);
      }
      byRegion[r.name_en].varieties.push({
        slug: v.slug,
        name_cn: v.name_cn,
        name_en: v.name_en,
        type: v.type,
        typeText: typeLabel(v.type),
        live: v.status === 'live',
        tagline: v.card_tagline,
      });
    });
  });

  const seen: Record<string, number> = {};
  return order.map((key, index) => {
    const info = byRegion[key];
    info.markerId = index;
    const coordKey = `${info.latitude.toFixed(1)},${info.longitude.toFixed(1)}`;
    const dupes = seen[coordKey] || 0;
    seen[coordKey] = dupes + 1;
    if (dupes > 0) {
      info.longitude += 0.8 * dupes;
      info.latitude -= 0.4 * dupes;
    }
    return info;
  });
}

Page({
  regions: [] as RegionInfo[],

  data: {
    query: '',
    cards: [] as Card[],
    total: 0,
    markers: [] as Array<Record<string, unknown>>,
    mapAvailable: true,
    selectedRegion: null as RegionInfo | null,
  },

  onLoad() {
    const all = getAllVarieties();
    this.regions = buildRegions();

    this.setData({
      cards: all.map(toCard),
      total: all.length,
      markers: this.regions.map((r) => ({
        id: r.markerId,
        latitude: r.latitude,
        longitude: r.longitude,
        iconPath: '/assets/marker.png',
        width: 20,
        height: 20,
        title: r.name_cn,
      })),
    });
  },

  onSearchInput(event: WechatMiniprogram.Input) {
    const query = event.detail.value;
    const filtered = getAllVarieties().filter((v) => matches(v, query));
    this.setData({ query, cards: filtered.map(toCard) });
  },

  onClearSearch() {
    this.setData({ query: '', cards: getAllVarieties().map(toCard) });
  },

  onMarkerTap(event: WechatMiniprogram.MarkerTap) {
    const markerId = event.detail.markerId;
    const region = this.regions.filter((r) => r.markerId === markerId)[0] || null;
    this.setData({ selectedRegion: region });
  },

  onMapTap() {
    if (this.data.selectedRegion) this.setData({ selectedRegion: null });
  },

  onCloseRegion() {
    this.setData({ selectedRegion: null });
  },

  onNoop() {
    // 吞掉 tooltip 卡片自身的点击，避免触发地图的关闭逻辑
  },

  onMapError() {
    this.setData({ mapAvailable: false, selectedRegion: null });
  },

  onRegionVarietyTap(event: WechatMiniprogram.TouchEvent) {
    const { slug, live } = event.currentTarget.dataset as { slug: string; live: boolean };
    if (!live) {
      wx.showToast({ title: '即将推出', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/detail/detail?slug=${slug}` });
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: '葡萄搜 · 一本随手翻的葡萄品种图鉴',
      path: '/pages/index/index',
    };
  },
});
