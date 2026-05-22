export type SceneComposition = 'still-life' | 'vineyard' | 'slope' | 'estate';

export type SceneMotif =
  | 'apple'
  | 'apricot'
  | 'blackcurrant'
  | 'cedar'
  | 'cherry'
  | 'citrus'
  | 'cypress'
  | 'flint'
  | 'flower'
  | 'grass'
  | 'herb'
  | 'ice'
  | 'lychee'
  | 'oak'
  | 'pear'
  | 'pepper'
  | 'plum'
  | 'rose'
  | 'stone'
  | 'violet';

export type SceneLandmark =
  | 'andes'
  | 'chateau'
  | 'china-estate'
  | 'coast'
  | 'cypress'
  | 'helan'
  | 'ice-vines'
  | 'mosel'
  | 'old-vines'
  | 'plateau'
  | 'terrace';

export interface VarietySceneProfile {
  composition: SceneComposition;
  time: 'morning' | 'midday' | 'dusk' | 'night' | 'winter';
  palette: {
    skyTop: string;
    skyBottom: string;
    ground: string;
    soil: string;
    accent: string;
    grape: string;
    grapeHighlight: string;
    wine: string;
    wineGlow: string;
  };
  wineStyle: 'pale' | 'gold' | 'copper' | 'ruby' | 'garnet' | 'purple' | 'ice-red';
  grapeShape: 'tight' | 'loose' | 'small' | 'plump';
  landmark: SceneLandmark;
  motifs: SceneMotif[];
}

export const VARIETY_SCENES = {
  'cabernet-sauvignon': {
    composition: 'still-life',
    time: 'night',
    palette: {
      skyTop: '#24110f',
      skyBottom: '#6f3d2f',
      ground: '#21100d',
      soil: '#5a3b25',
      accent: '#c28c5c',
      grape: '#25101f',
      grapeHighlight: '#713148',
      wine: '#4b1019',
      wineGlow: '#9b2832',
    },
    wineStyle: 'garnet',
    grapeShape: 'tight',
    landmark: 'chateau',
    motifs: ['blackcurrant', 'cedar', 'oak'],
  },
  'cabernet-franc': {
    composition: 'still-life',
    time: 'dusk',
    palette: {
      skyTop: '#5b3026',
      skyBottom: '#c58b62',
      ground: '#2c1812',
      soil: '#6b4a32',
      accent: '#d39a63',
      grape: '#4a1628',
      grapeHighlight: '#b14b55',
      wine: '#8b2638',
      wineGlow: '#dd6c66',
    },
    wineStyle: 'ruby',
    grapeShape: 'loose',
    landmark: 'terrace',
    motifs: ['cherry', 'herb', 'grass'],
  },
  'cabernet-gernischt': {
    composition: 'estate',
    time: 'dusk',
    palette: {
      skyTop: '#c98561',
      skyBottom: '#6e514b',
      ground: '#3e2f22',
      soil: '#6a4a34',
      accent: '#d5a15f',
      grape: '#341022',
      grapeHighlight: '#8e334b',
      wine: '#5a1320',
      wineGlow: '#b14149',
    },
    wineStyle: 'garnet',
    grapeShape: 'tight',
    landmark: 'coast',
    motifs: ['blackcurrant', 'herb', 'stone'],
  },
  grenache: {
    composition: 'estate',
    time: 'dusk',
    palette: {
      skyTop: '#e29b67',
      skyBottom: '#9c6146',
      ground: '#4a3522',
      soil: '#8a613f',
      accent: '#e0b56a',
      grape: '#562039',
      grapeHighlight: '#b04b62',
      wine: '#8a2732',
      wineGlow: '#dc705d',
    },
    wineStyle: 'ruby',
    grapeShape: 'plump',
    landmark: 'plateau',
    motifs: ['herb', 'stone', 'cherry'],
  },
  chardonnay: {
    composition: 'vineyard',
    time: 'morning',
    palette: {
      skyTop: '#efe4c9',
      skyBottom: '#b7bfa8',
      ground: '#4d5c35',
      soil: '#7c704d',
      accent: '#e3c66c',
      grape: '#d3d68d',
      grapeHighlight: '#fff3b0',
      wine: '#d9b64a',
      wineGlow: '#fff0a6',
    },
    wineStyle: 'gold',
    grapeShape: 'plump',
    landmark: 'chateau',
    motifs: ['apple', 'citrus', 'flint'],
  },
  beibinghong: {
    composition: 'slope',
    time: 'winter',
    palette: {
      skyTop: '#dce6ed',
      skyBottom: '#8fa2aa',
      ground: '#2f383a',
      soil: '#4c5354',
      accent: '#dce9ef',
      grape: '#4a0f22',
      grapeHighlight: '#d64a64',
      wine: '#9e1d30',
      wineGlow: '#ff7581',
    },
    wineStyle: 'ice-red',
    grapeShape: 'small',
    landmark: 'ice-vines',
    motifs: ['ice', 'cherry', 'stone'],
  },
  gewurztraminer: {
    composition: 'slope',
    time: 'dusk',
    palette: {
      skyTop: '#edc7b5',
      skyBottom: '#b48c80',
      ground: '#56513b',
      soil: '#7f6650',
      accent: '#e6b1b0',
      grape: '#c8788d',
      grapeHighlight: '#f0b8bf',
      wine: '#d8a94c',
      wineGlow: '#ffe1a0',
    },
    wineStyle: 'gold',
    grapeShape: 'plump',
    landmark: 'terrace',
    motifs: ['lychee', 'rose', 'flower'],
  },
  longyan: {
    composition: 'still-life',
    time: 'morning',
    palette: {
      skyTop: '#e8dcbf',
      skyBottom: '#aebc9a',
      ground: '#3e3223',
      soil: '#7a684b',
      accent: '#d8be73',
      grape: '#c8cf8e',
      grapeHighlight: '#f6eeb0',
      wine: '#c7a744',
      wineGlow: '#f5df86',
    },
    wineStyle: 'gold',
    grapeShape: 'loose',
    landmark: 'china-estate',
    motifs: ['pear', 'apple', 'stone'],
  },
  merlot: {
    composition: 'estate',
    time: 'dusk',
    palette: {
      skyTop: '#c78a6a',
      skyBottom: '#704235',
      ground: '#453322',
      soil: '#745335',
      accent: '#d6a06b',
      grape: '#3b1329',
      grapeHighlight: '#8e3855',
      wine: '#6f1b2a',
      wineGlow: '#c45a5f',
    },
    wineStyle: 'garnet',
    grapeShape: 'plump',
    landmark: 'chateau',
    motifs: ['plum', 'cherry', 'oak'],
  },
  marselan: {
    composition: 'vineyard',
    time: 'morning',
    palette: {
      skyTop: '#d9c7a3',
      skyBottom: '#897b69',
      ground: '#49512f',
      soil: '#8b6842',
      accent: '#d8a247',
      grape: '#24102d',
      grapeHighlight: '#6d2a78',
      wine: '#42122f',
      wineGlow: '#9b3488',
    },
    wineStyle: 'purple',
    grapeShape: 'tight',
    landmark: 'helan',
    motifs: ['blackcurrant', 'violet', 'stone'],
  },
  'pinot-grigio': {
    composition: 'vineyard',
    time: 'morning',
    palette: {
      skyTop: '#e5d9bd',
      skyBottom: '#aeb49d',
      ground: '#4f603c',
      soil: '#75684d',
      accent: '#d9a87f',
      grape: '#b9766b',
      grapeHighlight: '#e7ad9a',
      wine: '#d4bd62',
      wineGlow: '#f8e599',
    },
    wineStyle: 'copper',
    grapeShape: 'loose',
    landmark: 'terrace',
    motifs: ['pear', 'apple', 'stone'],
  },
  'pinot-noir': {
    composition: 'vineyard',
    time: 'morning',
    palette: {
      skyTop: '#e7d5c2',
      skyBottom: '#9ca58e',
      ground: '#44513a',
      soil: '#6e5a43',
      accent: '#cf8e6e',
      grape: '#651d34',
      grapeHighlight: '#c34b5f',
      wine: '#a83240',
      wineGlow: '#ef8a7d',
    },
    wineStyle: 'ruby',
    grapeShape: 'small',
    landmark: 'terrace',
    motifs: ['cherry', 'flower', 'stone'],
  },
  riesling: {
    composition: 'slope',
    time: 'morning',
    palette: {
      skyTop: '#dce1d4',
      skyBottom: '#8d9990',
      ground: '#303736',
      soil: '#555c5c',
      accent: '#cbd486',
      grape: '#c7d78b',
      grapeHighlight: '#eff4b6',
      wine: '#c6c95d',
      wineGlow: '#f3f1a2',
    },
    wineStyle: 'pale',
    grapeShape: 'tight',
    landmark: 'mosel',
    motifs: ['flint', 'citrus', 'stone'],
  },
  malbec: {
    composition: 'estate',
    time: 'dusk',
    palette: {
      skyTop: '#d89a68',
      skyBottom: '#634056',
      ground: '#3c3028',
      soil: '#835f45',
      accent: '#c99767',
      grape: '#251032',
      grapeHighlight: '#74307a',
      wine: '#35102f',
      wineGlow: '#8c3277',
    },
    wineStyle: 'purple',
    grapeShape: 'plump',
    landmark: 'andes',
    motifs: ['plum', 'violet', 'stone'],
  },
  sangiovese: {
    composition: 'estate',
    time: 'dusk',
    palette: {
      skyTop: '#d9976a',
      skyBottom: '#93523c',
      ground: '#4c3a25',
      soil: '#9b6540',
      accent: '#cf8a54',
      grape: '#5a1c2e',
      grapeHighlight: '#b6404e',
      wine: '#8f2330',
      wineGlow: '#d65b55',
    },
    wineStyle: 'ruby',
    grapeShape: 'loose',
    landmark: 'cypress',
    motifs: ['cherry', 'cypress', 'stone'],
  },
  'sauvignon-blanc': {
    composition: 'slope',
    time: 'midday',
    palette: {
      skyTop: '#dce5d7',
      skyBottom: '#9bb39b',
      ground: '#4d6540',
      soil: '#66715f',
      accent: '#c6d85f',
      grape: '#c8d983',
      grapeHighlight: '#f0f6ac',
      wine: '#c8c84a',
      wineGlow: '#f5ee86',
    },
    wineStyle: 'pale',
    grapeShape: 'tight',
    landmark: 'terrace',
    motifs: ['citrus', 'grass', 'flint'],
  },
  tempranillo: {
    composition: 'estate',
    time: 'dusk',
    palette: {
      skyTop: '#c8895b',
      skyBottom: '#70473d',
      ground: '#4f3928',
      soil: '#9b6039',
      accent: '#bc7b45',
      grape: '#3d1429',
      grapeHighlight: '#8f3448',
      wine: '#6a1926',
      wineGlow: '#bd5553',
    },
    wineStyle: 'garnet',
    grapeShape: 'tight',
    landmark: 'plateau',
    motifs: ['oak', 'cherry', 'stone'],
  },
  zinfandel: {
    composition: 'vineyard',
    time: 'morning',
    palette: {
      skyTop: '#e0a66c',
      skyBottom: '#986348',
      ground: '#4d3f27',
      soil: '#815b36',
      accent: '#d38b4a',
      grape: '#42142d',
      grapeHighlight: '#9d3856',
      wine: '#7d1d31',
      wineGlow: '#d75f63',
    },
    wineStyle: 'garnet',
    grapeShape: 'plump',
    landmark: 'old-vines',
    motifs: ['plum', 'blackcurrant', 'oak'],
  },
  viognier: {
    composition: 'vineyard',
    time: 'morning',
    palette: {
      skyTop: '#ead3ae',
      skyBottom: '#b89f7b',
      ground: '#56623a',
      soil: '#80694c',
      accent: '#e2ad66',
      grape: '#d1c77b',
      grapeHighlight: '#f7eaa7',
      wine: '#d6a84c',
      wineGlow: '#ffe4a3',
    },
    wineStyle: 'gold',
    grapeShape: 'plump',
    landmark: 'terrace',
    motifs: ['apricot', 'flower', 'stone'],
  },
  syrah: {
    composition: 'slope',
    time: 'dusk',
    palette: {
      skyTop: '#9b7d70',
      skyBottom: '#3e3e45',
      ground: '#2d3032',
      soil: '#585759',
      accent: '#a77b63',
      grape: '#22101f',
      grapeHighlight: '#6e2a50',
      wine: '#3d1027',
      wineGlow: '#91365e',
    },
    wineStyle: 'purple',
    grapeShape: 'tight',
    landmark: 'terrace',
    motifs: ['pepper', 'blackcurrant', 'stone'],
  },
} satisfies Record<string, VarietySceneProfile>;
