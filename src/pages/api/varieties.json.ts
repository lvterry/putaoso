import { getCollection, type CollectionEntry } from 'astro:content';

export type VarietyCompareData = {
  slug: string;
  name_en: string;
  name_cn: string;
  type: 'red' | 'white' | 'rose';
  origin: string;
  flavors_professional: string;
  palate: {
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
  };
  price: { min: number; max: number };
  pairings: string[];
  flavor_tags: string[];
  number: number;
};

export async function GET() {
  const all = await getCollection('varieties');
  const live = all.filter((v) => v.data.status === 'live');

  const data: VarietyCompareData[] = live
    .sort((a, b) => a.data.number - b.data.number)
    .map((entry) => {
      const d = entry.data;
      return {
        slug: entry.slug,
        name_en: d.name_en,
        name_cn: d.name_cn,
        type: d.type,
        origin: d.origin,
        flavors_professional: d.flavors_professional,
        palate: {
          acidity: d.palate.acidity,
          acidity_label: d.palate.acidity_label,
          tannin: d.palate.tannin,
          tannin_label: d.palate.tannin_label,
          sweetness: d.palate.sweetness,
          sweetness_label: d.palate.sweetness_label,
          body: d.palate.body,
          body_label: d.palate.body_label,
          beginner_difficulty: d.palate.beginner_difficulty,
          beginner_difficulty_label: d.palate.beginner_difficulty_label,
        },
        price: { min: d.price.min, max: d.price.max },
        pairings: d.pairings,
        flavor_tags: d.flavor_tags,
        number: d.number,
      };
    });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
