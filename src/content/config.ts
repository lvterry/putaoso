import { defineCollection, z } from 'astro:content';

const varieties = defineCollection({
  type: 'content',
  schema: z.object({
    // === 基础 ===
    number: z.number().int().positive(),
    status: z.enum(['live', 'draft', 'planned']),
    publishedAt: z.coerce.date().optional(),

    name_en: z.string(),
    name_cn: z.string(),
    aliases: z.array(z.string()).optional(),

    type: z.enum(['red', 'white', 'rose']),
    origin: z.string(),

    parents: z
      .object({
        p1: z.string().optional(),
        p2: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),

    // === Hero ===
    hero_quote: z.string(),
    hero_scene: z.enum([
      'study-still-life',
      'vineyard-dawn',
      'chateau-sundown',
      'slate-slope',
    ]),
    hero_scene_caption: z.string(),

    // === 风味专业版 ===
    flavors_professional: z.string(),
    // === 风味人话版（多段，每段一个元素） ===
    flavors_casual: z.array(z.string()).min(1),

    // === 关于这个品种（多段） ===
    history: z.array(z.string()).min(1),

    // === 口感四维 ===
    palate: z.object({
      acidity: z.number().int().min(1).max(5),
      acidity_label: z.string(),
      // 红葡萄 用 tannin，白葡萄 用 sweetness ——schema 上都做 optional，由 type 决定
      tannin: z.number().int().min(1).max(5).optional(),
      tannin_label: z.string().optional(),
      sweetness: z.number().int().min(1).max(5).optional(),
      sweetness_label: z.string().optional(),
      body: z.number().int().min(1).max(5),
      body_label: z.string(),
      beginner_difficulty: z.number().int().min(1).max(5),
      beginner_difficulty_label: z.string(),
    }),

    // === 价格 ===
    price: z.object({
      min: z.number().int().positive(),
      max: z.number().int().positive(),
    }),
    caveat: z.string(),

    // === 配餐 ===
    pairing_intro: z.string(), // 支持 markdown 内 ** 加粗
    pairings: z.array(z.string()).min(1),
    avoid: z.string(),

    // === 产区 ===
    regions: z
      .array(
        z.object({
          name_en: z.string(),
          name_cn: z.string(),
          badge: z.string(),
          body: z.string(),
        })
      )
      .length(3),

    // === 酒款 ===
    bottles: z
      .array(
        z.object({
          name_en: z.string(),
          name_cn: z.string(),
          price: z.number().int().positive(),
          body: z.string(),
        })
      )
      .length(3),

    // === 相似品种 ===
    similar: z
      .array(
        z.object({
          slug: z.string(),
          name_en: z.string(),
          name_cn: z.string(),
          body: z.string(),
        })
      )
      .length(3),

    // === 筛选标签 ===
    flavor_tags: z.array(z.string()).default([]),
    occasion_tags: z.array(z.string()).default([]),
    beginner_friendly: z.boolean().default(false),
    has_china_planting: z.boolean().default(false),

    // === 索引页/卡片专用 ===
    card_tagline: z.string(), // 网格卡片用的一句话
    card_origin_short: z.string(), // 卡片底部显示的产区简称，如 Bordeaux
  }),
});

export const collections = { varieties };
