# 葡萄搜 · Putaoso

一本随手翻的葡萄品种图鉴。慢慢读，找到属于你的那一颗。

## 项目结构

```
putaoso/
├── src/
│   ├── content/
│   │   ├── config.ts                  # 内容 schema（Zod 校验）
│   │   └── varieties/                 # 每个品种一个 .md
│   │       ├── cabernet-sauvignon.md
│   │       ├── pinot-noir.md
│   │       ├── merlot.md
│   │       ├── riesling.md
│   │       └── (其他占位)
│   ├── components/
│   │   ├── Scene.astro                # 场景图路由
│   │   ├── Palate.astro               # 口感四维（红/白切换）
│   │   └── scenes/                    # 4 个独立 SVG 场景
│   ├── layouts/
│   │   └── BaseLayout.astro           # 公共布局
│   ├── pages/
│   │   ├── index.astro                # 首页
│   │   └── [slug].astro               # 品种页（动态路由）
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 开发命令

```bash
npm install          # 安装依赖
npm run dev          # 本地开发服务器 → http://localhost:4321
npm run build        # 构建到 ./dist
npm run preview      # 预览构建产物
```

## 写一个新品种

复制任意已有的 `.md` 文件改字段。schema 强制要求所有必填字段都填写，错了 `npm run build` 会立刻报错。

最关键的字段决策：

- **`type`**：red / white / rose 三选一。决定第二个口感维度是 tannin 还是 sweetness。
- **`status`**：live / draft / planned。**只有 live 才会生成品种页**，draft/planned 在首页只显示为占位卡片。
- **`number`**：决定在首页索引中的排序。永远递增，不要复用。
- **`hero_scene`**：四选一（study-still-life / vineyard-dawn / chateau-sundown / slate-slope）。新场景需要先在 `src/components/scenes/` 增加 SVG 组件，并在 schema 的 enum 和 `Scene.astro` 路由器里都加上。

## 行内强调

`pairing_intro`、`caveat`、`history[]` 三个字段支持 `**xxx**` 加粗（会被渲染成酒红色 + 中字重的强调）。其他字段是纯文本。

## 部署

构建产物在 `./dist`，是纯静态 HTML/CSS。可以直接部署到 Cloudflare Pages、Vercel、Netlify、GitHub Pages、或任何静态主机。
