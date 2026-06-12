Component({
  properties: {
    // { slug, name_cn, name_en, type } 的列表（只含 live 品种）
    varieties: {
      type: Array,
      value: [],
    },
    selected: {
      type: Array,
      value: [] as string[],
      observer() {
        this.sync();
      },
    },
  },
  observers: {
    varieties() {
      this.sync();
    },
  },
  data: {
    chips: [] as Array<{ slug: string; name_cn: string; name_en: string; type: string; picked: boolean }>,
  },
  methods: {
    sync() {
      const selected = (this.data.selected || []) as string[];
      const varieties = (this.data.varieties || []) as Array<{
        slug: string;
        name_cn: string;
        name_en: string;
        type: string;
      }>;
      this.setData({
        chips: varieties.map((v) => ({ ...v, picked: selected.indexOf(v.slug) !== -1 })),
      });
    },
    onToggle(event: WechatMiniprogram.TouchEvent) {
      const { slug } = event.currentTarget.dataset as { slug: string };
      this.triggerEvent('toggle', { slug });
    },
  },
});
