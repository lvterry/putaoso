# 品种对比功能 · 开发计划

> 版本：v1 · 2026-05-27

---

## 一、功能概述

在网站上增加一个「品种对比」工具，用户可以选择 2–4 个葡萄品种，将它们的核心参数并排放在一张表格中，一目了然地比较差异。

典型使用场景：用户在赤霞珠和梅洛之间犹豫该喝哪个，打开对比页，看酸度、单宁、酒体、价格的直观对撞。

---

## 二、对比维度（表格列）

| 维度 | 数据来源字段 | 显示形式 |
|---|---|---|
| 名称 | `name_en` + `name_cn` | 表头（品种列标题） |
| 类型 | `type` | 红 / 白 / 桃红 |
| 原产地 | `origin` | 纯文本 |
| 风味关键词 | `flavors_professional`（取前 5 个词） | 标签 |
| 酸度 | `palate.acidity` + `palate.acidity_label` | 1–5 点 + 中文标签 |
| 单宁 / 甜度 | `palate.tannin` / `palate.sweetness`（根据 type） | 1–5 点 + 中文标签 |
| 酒体 | `palate.body` + `palate.body_label` | 1–5 点 + 中文标签 |
| 入门难度 | `palate.beginner_difficulty` + `palate.beginner_difficulty_label` | 1–5 点 + 中文标签 |
| 价格区间 | `price.min` – `price.max` | ¥120 – ¥250 |
| 配餐 | `pairings`（缩略显示） | 前 2 个配餐项 |
| 风味标签 | `flavor_tags` | 标签组 |

> 设计原则：最多 10 个维度。超过会让表格横向过宽，移动端不可用。

---

## 三、交互流程

```
┌─────────────────────┐
│   首页               │
│  hero 底部「对比」按钮 │
└────────┬────────────┘
         │ 点击
         ▼
┌─────────────────────────────────┐
│      品种选择弹窗 (Modal)         │
│                                 │
│  ┌───────────────────────────┐  │
│  │ ☑ 赤霞珠  Cab Sauvignon   │  │
│  │ ☐ 梅洛    Merlot          │  │
│  │ ☑ 黑皮诺  Pinot Noir      │  │
│  │ ☐ 雷司令  Riesling        │  │
│  │ ...                      │  │
│  │ (最多选 4 个)              │  │
│  │                           │  │
│  │         [ 对比选中的品种 ]   │  │
│  └───────────────────────────┘  │
└────────────────┬────────────────┘
                 │ 点击「对比」
                 ▼
┌─────────────────────────────┐
│     /compare 页面            │
│                             │
│  ┌─────────────────────────┐│
│  │     对比表格             ││
│  │        赤霞珠   黑皮诺   ││
│  │ 酸度    ★★★★☆   ★★★★☆  ││
│  │ 单宁    ★★★★★   ★★★☆☆  ││
│  │ 酒体    ★★★★☆   ★★★☆☆  ││
│  │ ...                    ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### 3.1 入口

- **首页**：hideHeader 模式下，在 hero 右下角放置一个「品种对比」按钮。
- **详情页**：在 `[slug].astro` hero 区附近加一个「加入对比」按钮，点击将该品种加入临时清单并弹出选择弹窗。

> 卡片本身不增加复选框，保持简洁。选择操作集中在弹窗中完成。

### 3.2 品种选择弹窗

- 列出所有 live 品种，每行一个勾选框。
- 用中文名 + 英文名展示，按编号排序。
- 因为品种数量不超过 20 个，不需要搜索功能（未来品种增多再加 typeahead）。
- 最多选 4 个，超出时阻止并提示「最多对比 4 个品种」。
- 确认后跳转到 `/compare` 页，选中结果通过 URL hash 传递（例如 `/compare#cabernet-sauvignon,pinot-noir`）。
- 弹窗用 HTML `<dialog>` 原生实现，保证可访问性。

### 3.3 对比清单

- 选择结果通过 URL hash 传递，不使用 `localStorage`（更符合静态站点模式，且天然支持分享链接）。
- 从 `/compare` 页也可以重新打开弹窗修改选择。
- 如果通过详情页「加入对比」进入，预设已勾选当前品种 + 引导用户再选 1–3 个。

### 3.4 对比页 `/compare`

- 从 URL hash 读取 slug 列表。
- 如果 hash 为空或无效，显示空状态引导 + 重新打开选择弹窗。
- 如果只有 1 个，正常渲染（相当于该品种的参数一览）。
- 2–4 个品种并排显示。
- 页面提供「修改对比品种」按钮，重新唤起选择弹窗。

---

## 四、技术方案

### 4.1 架构

```
静态构建                         客户端运行时
───────────                     ──────────────
build 时预生成                   页面加载后执行
varieties.json ────────────────► compare.astro 内联 <script>
（包含所有 live 品种的          ● 读取 localStorage
 精简数据，约 30KB）            ● 动态渲染表格
                                ● 响应交互事件
```

因为项目是纯静态 Astro 站点（`astro.config.mjs` 无 SSR 适配器），对比页无法做服务端查询参数。方案：

1. **构建期**：生成一个 `/api/varieties.json` 数据文件，包含所有 live 品种的对比所需字段。
2. **客户端**：`/compare` 页面从 `localStorage` 恢复已选品种，从 JSON 中提取数据渲染表格。

### 4.2 数据文件

在 `src/pages/api/varieties.json.ts`（或 build hook）中生成一个静态 JSON：

```ts
// 结构
interface VarietyCompareData {
  slug: string;
  name_en: string;
  name_cn: string;
  type: 'red' | 'white' | 'rose';
  origin: string;
  flavors: string[];          // 前 5 个风味词
  palate: { ... };
  price: { min: number; max: number };
  pairings: string[];
  flavor_tags: string[];
}
```

> 仅包含对比维度需要的字段，排除 hero_scene、history 等重字段，控制 JSON 体积。

### 4.3 状态传递

纯 vanilla JS，不用框架。状态通过 URL hash 传递，天然支持分享：

```
URL: /compare#cabernet-sauvignon,pinot-noir,syrah
解析: hash.slice(1).split(',')
```

对比页渲染时：
1. 解析 URL hash，取 slug 列表
2. fetch `/api/varieties.json`
3. 筛选、排序后渲染表格
4. 弹窗修改选择后，更新 hash 并重新渲染（不刷新页面）

---

## 五、文件清单

| 文件 | 用途 |
|---|---|
| `src/pages/compare.astro` | 对比页主页面 |
| `src/pages/api/varieties.json.ts` | 构建时生成品种数据 JSON |
| `src/components/CompareTable.astro` | 对比表格组件（客户端渲染） |
| `src/components/VarietyPicker.astro` | 品种选择弹窗（checkbox 列表 `<dialog>`） |
| `src/data/compare-helpers.ts` | 对比相关纯函数工具（hash 解析等） |
| `src/styles/compare.css` | 对比页 + 弹窗独立样式 |

### 修改已有文件

| 文件 | 修改内容 |
|---|---|
| `src/styles/global.css` | 追加弹窗遮罩、对比入口按钮等基础样式 |
| `src/pages/index.astro` | hero 区增加「品种对比」按钮 |
| `src/pages/[slug].astro` | hero 区增加「加入对比」按钮 |

---

## 六、实现步骤

### Phase 1：数据层（0.5 天）

1. 创建 `src/pages/api/varieties.json.ts`，`getStaticPaths` + `getCollection` 生成精简 JSON。
2. 验证 `https://putaoso.com/api/varieties.json` 可访问。
3. 创建 `src/data/compare-helpers.ts`，封装 hash 解析等工具函数。

### Phase 2：品种选择弹窗（0.5 天）

1. 创建 `src/components/VarietyPicker.astro`——原生 `<dialog>` + checkbox 列表。
2. 列出所有 live 品种（中文名 + 英文名，按编号排序）。
3. 最多选 4 个逻辑 + 超出提示。
4. 确认按钮拼接 hash 跳转 `/compare`。

### Phase 3：对比页骨架 + 表格（1 天）

1. 创建 `/compare` 页，基础布局（继承 BaseLayout，containerWidth = wide）。
2. 从 URL hash 恢复选择，fetch JSON 渲染对比表格。
3. 完成所有 10 个对比维度的行渲染。
4. 口感维度用 dot bar（复用 Palate 视觉语言）。
5. 表格内嵌「修改品种」按钮，唤起 VarietyPicker 弹窗。

### Phase 4：移动端响应式（0.5 天）

1. 移动端表格改为竖向堆叠卡片——每个品种一张卡，维度纵向排列。
2. 弹窗在移动端的适配（宽度、间距、触控目标大小）。

### Phase 5：首页 & 详情页接入（0.5 天）

1. 首页 hero 区增加「品种对比」按钮。
2. 详情页 hero 区增加「加入对比」按钮（预设勾选当前品种 + 弹窗）。
3. 空状态、单品种态、4 品种上限制提示。
4. 视觉校对（间距、字号、动效）。

---

## 七、响应式策略

| 断点 | 表格布局 |
|---|---|
| ≥ 1024px | 完整横向表头 + 竖列并排 |
| 768 – 1023px | 保留横向滚动，或减维度为 6 个核心维度 |
| < 768px | 堆叠卡片式：每个品种一张卡片，维度纵向排列 |

移动端优先考虑**堆叠卡片**而非横向滚动，因为触摸拖拽体验差。

---

## 八、边界情况

| 场景 | 处理 |
|---|---|
| localStorage 为空 | 显示空状态引导 |
| localStorage 中有已下线品种 | 过滤掉，不显示 |
| 选中超过 4 个 | Toast 提示「最多 4 个」，阻止添加 |
| 选中 0 个时跳转 /compare | 空状态引导页 |
| fetch JSON 失败 | 错误提示 + 重试按钮 |
| 用户在另一个 tab 修改了选择 | 监听 `storage` 事件，实时同步 |
| 所有选中项被删除 | 回到空状态 |
| 从 URL hash 恢复选择（分享链接） | 解析 hash，加载对应品种 |

---

## 九、视觉方向

与现有设计系统保持一致：
- 字体：Cormorant Garamond（标题/英文）+ Noto Serif SC（正文）+ JetBrains Mono（数据/标签）
- 色彩：`var(--wine)` 用于高亮列，`var(--rule)` 用于表格分隔线
- 口感维度复用现有的 dot bar 组件风格
- 选中的品种列用 `var(--highlight)` 或浅底强调
- 保持留白和呼吸感，不要变成 Excel 那样的密集表格

---

## 十、未来扩展（不在本期）

- 雷达图 / 蛛网图可视化口感四维
- 按属性筛选「找出酸度 ≥ 4 且单宁 ≥ 4 的红葡萄」的推荐功能
- 分享对比结果生成图片
- 品种「相似度」评分
