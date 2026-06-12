import type { VarietyType } from './data';

const TAG_MAP: Record<string, string> = {
  approachable: '易饮',
  aromatic: '芳香',
  'black-fruit': '黑色水果',
  'black-pepper': '黑胡椒',
  butter: '黄油',
  cherry: '樱桃',
  chocolate: '巧克力',
  citrus: '柑橘',
  'dark-fruit': '深色水果',
  'dried-herb': '干草药',
  earth: '泥土',
  earthy: '泥土味',
  elegant: '优雅',
  floral: '花香',
  'full-body': '饱满',
  grassy: '青草',
  herbal: '草本',
  'high-acid': '高酸',
  'high-tannin': '高单宁',
  honey: '蜂蜜',
  jam: '果酱',
  leather: '皮革',
  light: '轻盈',
  'light-body': '轻盈',
  lychee: '荔枝',
  'medium-tannin': '中单宁',
  mineral: '矿物',
  mint: '薄荷',
  mushroom: '蘑菇',
  oak: '橡木',
  pear: '梨',
  'pencil-shaving': '铅笔屑',
  plum: '李子',
  'red-fruit': '红色水果',
  rose: '玫瑰',
  round: '圆润',
  smoked: '烟熏',
  'soft-tannin': '柔顺单宁',
  spice: '香料',
  'stone-fruit': '核果',
  sweet: '甜',
  tobacco: '烟草',
  violet: '紫罗兰',
  'warm-spice': '暖香料',
  'white-flower': '白花',
  'wild-berry': '野莓',
};

export function tagLabel(tag: string): string {
  return TAG_MAP[tag] || tag.replace(/-/g, ' ');
}

export function typeLabel(type: VarietyType): string {
  return type === 'red' ? '红葡萄' : type === 'white' ? '白葡萄' : '桃红';
}

export function formatNumber(num: number): string {
  return String(num).padStart(3, '0');
}
