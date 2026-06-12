# 微信小程序迁移计划

## 目标

把当前 Putaoso 的静态葡萄品种图鉴能力迁移到微信小程序，同时保持网站和 iOS App 的现有功能不受影响。

本次迁移的核心不是复用 UI 代码，而是复用内容源、校验规则、图片资产和导出流程。网站继续由 Astro 生成，iOS 继续读取本地 JSON，小程序新增独立项目并读取从同一内容源导出的 JSON。

## 当前功能分析

### 网站

- 首页：封面、世界地图、品种索引卡片、品种对比入口。
- 详情页：品种基本信息、插图、风味、口感四维、价格、配餐、产区、酒款、相似品种、历史介绍。
- 对比页：最多选择 4 个 live 品种，对比类型、原产地、风味、酸度、单宁/甜度、酒体、入门难度、价格、配餐、标签。
- 内容源：`src/content/varieties/*.md` 的 frontmatter。
- 静态 API：`src/pages/api/varieties.json.ts` 为网站对比页提供精简数据。

### iOS App

- 数据：`ios/Putaoso/Resources/varieties.json`，由 `scripts/export-ios-data.mjs` 从网站内容源导出。
- 首页：地图、搜索、品种卡片网格。
- 详情页：基本覆盖网站详情页的核心内容。
- 图片：`public/illustrations/*.svg` 通过 `scripts/export-ios-illustrations.mjs` 转成 JPG。

### 小程序适合承接的功能

- 一期必须：首页地图、品种索引、搜索、品种详情、口感四维、相似品种跳转、本地静态数据读取。
- 一期建议：详情页分享、planned/draft 状态展示、基础错误/空状态。
- 二期再做：品种对比、分享海报。

## 设计原则

1. `src/content/varieties/*.md` 继续作为唯一内容源。
2. 小程序新增旁路项目，不移动现有文件。
3. 不修改 Astro 页面和 iOS 代码路径。
4. 小程序只消费导出的 JSON 和图片资源。
5. 先用原生微信小程序 + TypeScript，避免引入 Taro/uni-app 的额外复杂度。
6. 地图功能使用小程序原生 `map` 组件独立实现，不强行照搬网站 SVG 地图或 iOS MapKit。

## 推荐项目结构

第一阶段使用低风险增量结构：

```txt
putaoso/
  src/
    content/varieties/*.md
    data/region-coords.json
  public/
    illustrations/*.svg
  ios/
    Putaoso/Resources/varieties.json
    Putaoso/Resources/Illustrations/*.jpg
  scripts/
    export-ios-data.mjs
    export-ios-illustrations.mjs
    export-weapp-data.mjs
    export-weapp-assets.mjs
  weapp/
    project.config.json
    miniprogram/
      app.json
      app.ts
      app.wxss
      data/
        varieties.json
      assets/
        illustrations/*.jpg
      pages/
        index/
        detail/
        compare/
        about/
      components/
        variety-card/
        palate-chart/
        section-block/
        price-block/
        similar-list/
        variety-picker/
```

后续如果三端共享内容逻辑变复杂，再考虑重构为：

```txt
packages/
  catalog/
    varieties/*.md
    region-coords.json
    schema.ts
    export.ts
  theme/
apps/
  web/
  ios/
  weapp/
```

短期不建议直接做 monorepo 重构，因为这会影响现有 web 和 iOS 的稳定路径。

## 数据导出方案

### 一期方案

新增 `scripts/export-weapp-data.mjs`，读取：

- `src/content/varieties/*.md`
- `src/data/region-coords.json`

输出：

```txt
weapp/miniprogram/data/varieties.json
```

字段保持 snake_case，与网站 frontmatter 和 iOS JSON 当前格式一致，降低转换成本。

### 可选优化

当品种数量或图片体积增长后，把数据拆成：

```txt
weapp/miniprogram/data/varieties.index.json
weapp/miniprogram/data/varieties.detail.json
```

`varieties.index.json` 只放首页和搜索需要的字段：

```ts
{
  slug,
  number,
  status,
  name_en,
  name_cn,
  aliases,
  type,
  origin,
  card_tagline,
  card_origin_short,
  beginner_friendly,
  has_china_planting,
  flavor_tags,
  occasion_tags
}
```

`varieties.detail.json` 放完整详情字段：

```ts
{
  slug,
  hero_quote,
  hero_scene_caption,
  flavors_professional,
  flavors_casual,
  history,
  palate,
  price,
  caveat,
  pairing_intro,
  pairings,
  avoid,
  regions,
  bottles,
  similar
}
```

### 数据校验

导出脚本应至少校验：

- `number` 唯一。
- `slug` 唯一。
- 每个品种有且只有 3 个 `regions`。
- 每个品种有且只有 3 个 `bottles`。
- 每个品种有且只有 3 个 `similar`。
- `type === 'red'` 时必须有 `palate.tannin` 和 `palate.tannin_label`。
- `type === 'white'` 或 `type === 'rose'` 时必须有 `palate.sweetness` 和 `palate.sweetness_label`。
- `status === 'live'` 的详情页可以打开。
- `status === 'draft'` 或 `status === 'planned'` 的详情页不生成或不可跳转。
- `similar.slug` 指向的品种存在；如果目标不是 live，小程序展示纯文本，不跳转。
- 所有 `regions[].name_en` 如果存在坐标配置，则导出 `coordinate`。

## 图片资产方案

当前源文件：

```txt
public/illustrations/*.svg
```

iOS 目标：

```txt
ios/Putaoso/Resources/Illustrations/*.jpg
```

小程序目标：

```txt
weapp/miniprogram/assets/illustrations/*.jpg
```

新增 `scripts/export-weapp-assets.mjs`，从 SVG 导出小程序可直接使用的 JPG 或 PNG。小程序页面使用：

```xml
<image src="/assets/illustrations/{{slug}}.jpg" mode="aspectFill" />
```

一期优先使用本地图片。若包体接近小程序限制，再考虑 CDN。

## 小程序功能计划

### 阶段 1：数据与资源导出

任务：

- 新增 `scripts/export-weapp-data.mjs`。
- 新增 `scripts/export-weapp-assets.mjs`。
- 在 `package.json` 新增命令：

```json
{
  "weapp:data": "node scripts/export-weapp-data.mjs",
  "weapp:assets": "node scripts/export-weapp-assets.mjs",
  "weapp:resources": "npm run weapp:data && npm run weapp:assets"
}
```

验收标准：

- `npm run weapp:resources` 成功。
- 生成 `weapp/miniprogram/data/varieties.json`。
- 生成的小程序品种数量与网站内容源一致。
- JSON 中 live/draft/planned 状态保留正确。
- 不修改 `src/pages/**`、`src/components/**`、`ios/**` 和 `scripts/export-ios-data.mjs`。

### 阶段 2：小程序项目骨架

任务：

- 新增 `weapp/project.config.json`。
- 新增 `weapp/miniprogram/app.json`、`app.ts`、`app.wxss`。
- 新增首页和详情页路由。
- 建立基础主题变量、字体、颜色、间距。

验收标准：

- 微信开发者工具可以导入 `weapp/`。
- 点击编译没有红色错误。
- 首页可以加载。
- 控制台没有数据读取错误。

### 阶段 3：首页地图、索引与搜索

任务：

- 读取 `data/varieties.json`。
- 按 `number` 排序。
- 使用小程序 `map` 组件实现首页产区地图。
- 使用导出的 `regions[].coordinate` 创建 markers。
- marker 点击展示产区、品种、标签和详情入口。
- 坐标重叠时做轻微偏移。
- 地图不可用时保留列表浏览能力。
- 渲染品种卡片。
- 支持搜索中文名、英文名、别名、原产地。
- live 品种可点击进入详情。
- draft/planned 品种显示“即将推出”，不可进入详情。

验收标准：

- 首页展示所有品种。
- 首页地图在真机上正常显示。
- marker 数量与 live 品种的产区数量匹配。
- 点击 marker 能看到正确品种和产区。
- marker 弹层或卡片可以进入对应详情页。
- 地图不可用时首页仍可通过列表浏览。
- 搜索 `Cabernet`、`赤霞珠`、`Bordeaux` 等关键词能返回正确结果。
- live 卡片点击进入详情页。
- draft/planned 卡片不会进入详情页。
- 空搜索结果有明确提示。
- iPhone 和安卓微信真机上布局不溢出、不遮挡。

### 阶段 4：详情页

任务：

- 实现标题区：编号、英文名、中文名、别名、hero quote。
- 显示品种插图。
- 实现“它是谁”信息区。
- 实现风味描述区。
- 实现口感四维组件。
- 实现价格、踩雷提示、配餐、产区、酒款、相似品种、历史介绍。
- 支持相似品种跳转。
- 处理 `**bold**` inline markdown。

验收标准：

- 随机抽查 5 个 live 品种，详情字段完整显示。
- 红葡萄显示“单宁”，白/桃红显示“甜度”。
- 价格区间显示正确。
- 产区、酒款、相似品种均为 3 条。
- 相似品种为 live 时可跳转；非 live 时不可跳转。
- `**bold**` 不以原始 markdown 符号暴露给用户。
- 详情页返回首页状态正常。

### 阶段 5：分享

任务：

- 为详情页实现 `onShareAppMessage`。
- 分享标题使用 `name_cn + name_en`。
- 分享路径包含 `slug`。
- 首页分享使用产品名和一句话介绍。

验收标准：

- 真机点击右上角分享，标题正确。
- 分享给自己后打开能进入对应详情页。
- 分享 planned/draft 品种不会出现不可访问页面。

### 阶段 6：品种对比

任务：

- 新增 `pages/compare/compare`。
- 新增品种选择器组件。
- 最多选择 4 个 live 品种。
- 展示类型、原产地、风味、酸度、单宁/甜度、酒体、入门难度、价格、配餐、标签。
- 小程序采用移动端卡片式对比，不照搬网站桌面表格。

验收标准：

- 可选择 1 到 4 个品种。
- 选择第 5 个时有提示并阻止。
- 对比字段与网站 `/compare` 保持一致。
- 混合红葡萄和白葡萄时，单宁/甜度显示逻辑清晰。
- 页面刷新或返回后选择状态符合预期。

### 阶段 7：地图体验增强

任务：

- 优化 marker 聚合或分散策略。
- 优化 marker 点击后的信息卡片动效和可读性。
- 根据真机表现调整地图初始中心点、缩放级别和高度。
- 增加从地图卡片进入详情页后的返回体验优化。

验收标准：

- 重叠产区 marker 不会完全遮挡。
- 首页首屏能同时看见地图和部分列表内容。
- 地图交互不会阻塞首页搜索和列表滚动。
- 从地图进入详情再返回时，首页状态符合预期。

## 不影响 web 和 iOS 的约束

第一阶段只允许新增或修改：

```txt
weapp/**
scripts/export-weapp-data.mjs
scripts/export-weapp-assets.mjs
package.json
package-lock.json
plans/weapp-port-plan.md
```

除非另有明确任务，不应修改：

```txt
src/pages/**
src/components/**
src/content/config.ts
ios/**
scripts/export-ios-data.mjs
scripts/export-ios-illustrations.mjs
```

## 验证命令

每次小程序相关开发后执行：

```bash
npm run build
npm run ios:data
npm run weapp:resources
```

成功标准：

- `npm run build` 通过，说明 Astro 网站构建未破坏。
- `npm run ios:data` 通过，说明 iOS 数据导出未破坏。
- `npm run weapp:resources` 通过，说明小程序数据和资源可生成。

检查变更范围：

```bash
git status --short
```

成功标准：

- 变更集中在小程序目录、导出脚本和计划文件。
- 没有意外修改网站页面、组件或 iOS 源码。

## 微信开发者工具验收

导入路径：

```txt
weapp/
```

验收标准：

- 微信开发者工具能打开项目。
- 点击“编译”无红色错误。
- 模拟器首页能显示品种列表。
- 详情页能打开并正常返回。
- 控制台没有 JSON 读取、图片路径或页面路由错误。

## 真机验收

通过微信开发者工具“预览”生成二维码，使用微信扫码。

验收标准：

- iPhone 真机可打开首页和详情页。
- 安卓真机可打开首页和详情页。
- 列表滚动顺畅。
- 图片加载正常。
- 页面没有明显横向溢出、文字遮挡、按钮不可点。
- 详情页分享路径正确。

## 最终成功定义

小程序创建成功的标准：

- 小程序项目存在于 `weapp/`，可以被微信开发者工具导入。
- 小程序数据来自现有 `src/content/varieties/*.md`。
- 首页地图、搜索、详情页在模拟器和真机可用。
- `npm run build` 仍然通过。
- `npm run ios:data` 仍然通过。
- 小程序改动没有破坏现有网站和 iOS App 的功能路径。
