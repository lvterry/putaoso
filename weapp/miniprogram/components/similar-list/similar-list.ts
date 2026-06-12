Component({
  properties: {
    // 页面预先附加 live 字段：{ slug, name_en, name_cn, body, live }
    items: {
      type: Array,
      value: [],
    },
  },
  methods: {
    onTap(event: WechatMiniprogram.TouchEvent) {
      const { slug, live } = event.currentTarget.dataset as { slug: string; live: boolean };
      if (!live) return;
      wx.navigateTo({ url: `/pages/detail/detail?slug=${slug}` });
    },
  },
});
