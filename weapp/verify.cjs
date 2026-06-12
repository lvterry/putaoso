/* 临时验证脚本：用 miniprogram-automator 启动微信开发者工具，
 * 编译项目并依次访问首页、详情页、对比页，输出页面内容与控制台错误。
 * 运行：node weapp/verify.cjs
 */
const path = require('path');
const automator = require('miniprogram-automator');

const errors = [];

async function main() {
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: path.resolve(__dirname),
  });

  miniProgram.on('console', (msg) => {
    if (msg.type === 'error') errors.push(msg.args.join(' '));
  });
  miniProgram.on('exception', (exc) => {
    errors.push(`${exc.message}`);
  });

  // 首页
  const index = await miniProgram.reLaunch('/pages/index/index');
  await index.waitFor(1500);
  const title = await (await index.$('.title')).text();
  const cards = await index.$$('.grid-item');
  const markers = await index.data('markers');
  console.log(`INDEX ok: title=${title} cards=${cards.length} markers=${markers.markers.length}`);

  // 搜索
  const input = await index.$('.search-input');
  await input.input('Bordeaux');
  await index.waitFor(600);
  const filtered = await index.data('cards');
  console.log(`SEARCH "Bordeaux": ${filtered.cards.map((c) => c.slug).join(',')}`);
  await input.input('不存在的品种xyz');
  await index.waitFor(600);
  const none = await index.data('cards');
  console.log(`SEARCH empty state: ${none.cards.length} results`);

  // 详情页
  const detail = await miniProgram.navigateTo('/pages/detail/detail?slug=cabernet-sauvignon');
  await detail.waitFor(1500);
  const heroEn = await (await detail.$('.hero-en')).text();
  const palateRows = await detail.$$('.palate-row');
  const regionCards = await detail.$$('.region-card');
  const bottleCards = await detail.$$('.bottle-card');
  const similarItems = await detail.$$('.similar-item');
  console.log(
    `DETAIL ok: hero=${heroEn} palateRows=${palateRows.length} regions=${regionCards.length} bottles=${bottleCards.length} similar=${similarItems.length}`
  );

  // 白葡萄详情（甜度展示）
  const white = await miniProgram.redirectTo('/pages/detail/detail?slug=riesling');
  await white.waitFor(1200);
  const whiteRows = await white.data('v');
  console.log(`DETAIL white ok: ${whiteRows.v.slug} sweetness=${whiteRows.v.palate.sweetness}`);

  // 未知 slug → 缺省页
  const missing = await miniProgram.redirectTo('/pages/detail/detail?slug=not-a-grape');
  await missing.waitFor(800);
  const missingTitle = await (await missing.$('.missing-title')).text();
  console.log(`MISSING ok: ${missingTitle}`);

  await miniProgram.close();

  if (errors.length > 0) {
    console.error('CONSOLE ERRORS:');
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log('ALL CHECKS PASSED, no console errors');
}

main().catch((error) => {
  console.error('VERIFY FAILED:', error.message || error);
  process.exit(1);
});
