Component({
  properties: {
    // 由页面预先组装的卡片数据：
    // { slug, numberStr, name_cn, name_en, card_tagline, card_origin_short, type, typeText, live }
    card: {
      type: Object,
      value: null,
    },
  },
  methods: {
    onTap() {
      const card = this.data.card as { slug: string; live: boolean } | null;
      if (!card) return;
      if (!card.live) {
        wx.showToast({ title: '即将推出', icon: 'none' });
        return;
      }
      wx.navigateTo({ url: `/pages/detail/detail?slug=${card.slug}` });
    },
  },
});
