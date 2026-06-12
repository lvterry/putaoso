import type { Palate, VarietyType } from '../../utils/data';

interface PalateRow {
  label: string;
  value: number;
  valueLabel: string;
  dots: boolean[];
}

function row(label: string, value: number, valueLabel: string): PalateRow {
  const dots: boolean[] = [];
  for (let i = 1; i <= 5; i += 1) dots.push(i <= value);
  return { label, value, valueLabel, dots };
}

Component({
  properties: {
    type: {
      type: String,
      value: 'red',
    },
    palate: {
      type: Object,
      value: null,
      observer() {
        this.compute();
      },
    },
  },
  data: {
    rows: [] as PalateRow[],
  },
  methods: {
    compute() {
      const palate = this.data.palate as Palate | null;
      if (!palate) return;
      const type = this.data.type as VarietyType;

      const rows: PalateRow[] = [row('酸度', palate.acidity, palate.acidity_label)];
      if (type === 'red') {
        rows.push(row('单宁', palate.tannin || 0, palate.tannin_label || ''));
      } else {
        rows.push(row('甜度', palate.sweetness || 0, palate.sweetness_label || ''));
      }
      rows.push(row('酒体', palate.body, palate.body_label));
      rows.push(row('入门难度', palate.beginner_difficulty, palate.beginner_difficulty_label));

      this.setData({ rows });
    },
  },
});
