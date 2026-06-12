const FONT_FAMILY = 'Noto Serif SC';
const FONT_PATH = '/assets/fonts/noto-serif-sc.woff';

App({
  onLaunch() {
    // 打包内的 Noto Serif SC 子集（scripts/export-weapp-fonts.mjs 生成）。
    // 基础库 2.25.3 起支持代码包路径；两种写法做兼容，失败则静默回退系统衬线字体。
    const load = (source: string, onFail?: () => void) => {
      wx.loadFontFace({
        family: FONT_FAMILY,
        global: true,
        source,
        scopes: ['webview', 'native'],
        fail: onFail,
      });
    };
    load(`url("${FONT_PATH}")`, () => load(FONT_PATH));
  },
});
