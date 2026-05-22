import { ui, locales, defaultLocale, type Locale } from './ui';

export function isLocale(s: string): s is Locale {
  return (locales as readonly string[]).includes(s);
}

export function getLocaleFromUrl(url: URL | { pathname: string }): Locale {
  const seg = url.pathname.split('/').filter(Boolean)[0] ?? '';
  return isLocale(seg) && seg !== 'zh' ? (seg as Locale) : defaultLocale;
}

export function t(locale: Locale, key: string, arg?: string): string {
  const dict = ui[locale] ?? ui[defaultLocale];
  const fallback = ui[defaultLocale];
  const val = (dict as any)[key] ?? (fallback as any)[key] ?? '';
  return typeof val === 'function' ? val(arg ?? '') : val;
}

export function localizedPath(slug: string, locale: Locale): string {
  const clean = slug.replace(/^\//, '');
  if (locale === defaultLocale) return clean ? `/${clean}` : '/';
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

// Pick a top-level translatable field, falling back to the Chinese source value.
export function pick<T = string>(entry: any, locale: Locale, field: string): T {
  if (locale === defaultLocale) return entry.data[field];
  const override = entry.data.i18n?.[locale]?.[field];
  return (override ?? entry.data[field]) as T;
}

// Merge an array field (regions/bottles/similar) item-by-item.
export function pickArray(
  entry: any,
  locale: Locale,
  field: 'regions' | 'bottles' | 'similar'
): any[] {
  const base: any[] = entry.data[field] ?? [];
  if (locale === defaultLocale) return base;
  const overrides: any[] | undefined = entry.data.i18n?.[locale]?.[field];
  if (!overrides) return base;
  return base.map((item, i) => ({ ...item, ...(overrides[i] ?? {}) }));
}

export function pickPalate(entry: any, locale: Locale) {
  const base = entry.data.palate;
  if (locale === defaultLocale) return base;
  const ov = entry.data.i18n?.[locale]?.palate;
  return ov ? { ...base, ...ov } : base;
}

// Display name for headings/CTAs ("If you like X, try also"):
// zh → Chinese name; other locales → English (Latin) name unless overridden.
export function displayName(entry: any, locale: Locale): string {
  if (locale === defaultLocale) return entry.data.name_cn;
  return entry.data.i18n?.[locale]?.name_en ?? entry.data.name_en;
}

export { locales, defaultLocale, type Locale };
