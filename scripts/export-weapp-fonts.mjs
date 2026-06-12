import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

// 把 Noto Serif SC 子集化成只含小程序实际用到字符的 WOFF。
// 全量中文字体约 11MB 无法进包，子集化后只有几百 KB。
// 内容（varieties.json）或界面文案新增生僻字后需要重跑：npm run weapp:fonts
// 依赖：python3 + fonttools（python3 -m pip install --user fonttools）

const root = process.cwd();
const miniprogramDir = path.join(root, 'weapp/miniprogram');
const dataFile = path.join(miniprogramDir, 'data/varieties.json');
const outputDir = path.join(miniprogramDir, 'assets/fonts');
const outputFile = path.join(outputDir, 'noto-serif-sc.woff');

const cacheDir = path.join(os.homedir(), '.cache/putaoso-fonts');
const sourceFont = path.join(cacheDir, 'NotoSerifSC-Regular.otf');
const sourceUrl =
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/SubsetOTF/SC/NotoSerifSC-Regular.otf';

if (!fs.existsSync(sourceFont)) {
  console.log(`Downloading Noto Serif SC to ${sourceFont} ...`);
  fs.mkdirSync(cacheDir, { recursive: true });
  const dl = spawnSync('curl', ['-sL', '-o', sourceFont, sourceUrl], { encoding: 'utf8' });
  if (dl.status !== 0 || !fs.existsSync(sourceFont)) {
    throw new Error('Failed to download NotoSerifSC-Regular.otf');
  }
}

// === 收集用到的字符 ===

let text = fs.readFileSync(dataFile, 'utf8');

const collect = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p);
    else if (/\.(wxml|ts|json)$/.test(entry.name)) text += fs.readFileSync(p, 'utf8');
  }
};
collect(path.join(miniprogramDir, 'pages'));
collect(path.join(miniprogramDir, 'components'));
text += fs.readFileSync(path.join(miniprogramDir, 'app.json'), 'utf8');

// 完整 ASCII + 常用中文标点兜底，避免动态拼接的字符缺字
for (let code = 0x20; code <= 0x7e; code += 1) text += String.fromCharCode(code);
text += '，。、；：？！·…—–“”‘’（）《》〈〉【】〔〕％℃×→¥€£°';

const chars = Array.from(new Set(Array.from(text))).filter((c) => !/\s/.test(c));

const tmpCharsFile = path.join(os.tmpdir(), 'putaoso-weapp-font-chars.txt');
fs.writeFileSync(tmpCharsFile, chars.join(''));

// === 子集化 ===

fs.mkdirSync(outputDir, { recursive: true });

const subset = spawnSync(
  'python3',
  [
    '-m',
    'fontTools.subset',
    sourceFont,
    `--text-file=${tmpCharsFile}`,
    '--flavor=woff',
    '--no-hinting',
    '--desubroutinize',
    '--layout-features=*',
    `--output-file=${outputFile}`,
  ],
  { encoding: 'utf8' }
);

if (subset.status !== 0) {
  process.stderr.write(subset.stdout ?? '');
  process.stderr.write(subset.stderr ?? '');
  throw new Error('pyftsubset failed — is fonttools installed? (python3 -m pip install --user fonttools)');
}

fs.rmSync(tmpCharsFile, { force: true });

const sizeKb = (fs.statSync(outputFile).size / 1024).toFixed(0);
console.log(
  `Exported ${chars.length}-char Noto Serif SC subset to ${path.relative(root, outputFile)} (${sizeKb} KB)`
);
