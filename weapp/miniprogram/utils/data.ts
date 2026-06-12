export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Region {
  name_en: string;
  name_cn: string;
  badge: string;
  body: string;
  coordinate?: Coordinate;
}

export interface Bottle {
  name_en: string;
  name_cn: string;
  price: number;
  body: string;
}

export interface Similar {
  slug: string;
  name_en: string;
  name_cn: string;
  body: string;
}

export interface Palate {
  acidity: number;
  acidity_label: string;
  tannin?: number;
  tannin_label?: string;
  sweetness?: number;
  sweetness_label?: string;
  body: number;
  body_label: string;
  beginner_difficulty: number;
  beginner_difficulty_label: string;
}

export type VarietyType = 'red' | 'white' | 'rose';
export type VarietyStatus = 'live' | 'draft' | 'planned';

export interface Variety {
  slug: string;
  number: number;
  status: VarietyStatus;
  publishedAt?: string;
  name_en: string;
  name_cn: string;
  aliases?: string[];
  type: VarietyType;
  origin: string;
  parents?: { p1?: string; p2?: string; note?: string };
  hero_quote: string;
  hero_scene: string;
  hero_scene_caption: string;
  flavors_professional: string;
  flavors_casual: string[];
  history: string[];
  palate: Palate;
  price: { min: number; max: number };
  caveat: string;
  pairing_intro: string;
  pairings: string[];
  avoid: string;
  regions: Region[];
  bottles: Bottle[];
  similar: Similar[];
  flavor_tags: string[];
  occasion_tags: string[];
  beginner_friendly: boolean;
  has_china_planting: boolean;
  card_tagline: string;
  card_origin_short: string;
}

const all: Variety[] = require('../data/varieties.js');

export function getAllVarieties(): Variety[] {
  return all;
}

export function getLiveVarieties(): Variety[] {
  return all.filter((v) => v.status === 'live');
}

export function getVariety(slug: string): Variety | undefined {
  return all.find((v) => v.slug === slug);
}

export function isLive(slug: string): boolean {
  const v = getVariety(slug);
  return !!v && v.status === 'live';
}
