/**
 * 品种对比 · 纯函数工具
 *
 * 功能：
 * - 从 URL hash 解析品种 slug 列表
 * - 校验 slug 是否在合法列表中
 * - 将 slug 列表编码为 hash
 */

/** 从 URL hash 解析 slug 列表（如 "#a,b,c" → ["a","b","c"]） */
export function parseHash(hash: string): string[] {
  const raw = hash.replace(/^#/, '').trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 将 slug 列表编码为 URL hash */
export function encodeHash(slugs: string[]): string {
  return '#' + slugs.join(',');
}

/** 从合法品种列表中过滤出 hash 中的有效 slug，并去重、保留顺序 */
export function resolveSlugs(
  hashSlugs: string[],
  allSlugs: string[],
): string[] {
  const valid = new Set(allSlugs);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const slug of hashSlugs) {
    const s = slug.trim();
    if (valid.has(s) && !seen.has(s)) {
      seen.add(s);
      result.push(s);
    }
  }
  return result;
}
