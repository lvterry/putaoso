const FONT_FAMILY = 'Noto Serif SC';
const FONT_PKG_PATH = '/assets/fonts/noto-serif-sc.woff';
const FONT_USER_PATH = `${wx.env.USER_DATA_PATH}/noto-serif-sc.woff`;

App({
  onLaunch() {
    this.loadFont();
  },

  loadFont() {
    // 真机的 loadFontFace 不支持代码包路径，先把字体复制到用户目录，
    // 用 wxfile:// 路径加载；复制或加载失败时逐级回退，最终静默落回系统衬线字体。
    const load = (source: string, onFail?: (err: unknown) => void) => {
      wx.loadFontFace({
        family: FONT_FAMILY,
        global: true,
        source,
        scopes: ['webview', 'native'],
        fail: onFail || ((err) => console.warn('loadFontFace failed:', err)),
      });
    };

    let userPathReady = false;
    try {
      const fsm = wx.getFileSystemManager();
      try {
        fsm.accessSync(FONT_USER_PATH);
      } catch (e) {
        fsm.copyFileSync(FONT_PKG_PATH, FONT_USER_PATH);
      }
      userPathReady = true;
    } catch (e) {
      console.warn('font copy to user path failed:', e);
    }

    const tryPackagePath = () =>
      load(`url("${FONT_PKG_PATH}")`, () => load(FONT_PKG_PATH));

    if (userPathReady) {
      load(`url("${FONT_USER_PATH}")`, tryPackagePath);
    } else {
      tryPackagePath();
    }
  },
});
