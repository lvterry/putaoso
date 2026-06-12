// 微信打包不收字体文件，字体以 base64 data URL 嵌在 JS 模块里
// （scripts/export-weapp-fonts.mjs 生成）
const FONT_FAMILY = 'Noto Serif SC';
const FONT_DATA_URL: string = require('./assets/fonts/noto-serif-sc.js');

App({
  onLaunch() {
    wx.loadFontFace({
      family: FONT_FAMILY,
      global: true,
      source: `url("${FONT_DATA_URL}")`,
      scopes: ['webview', 'native'],
      fail: (err) => console.warn('loadFontFace failed:', err),
    });
  },
});
