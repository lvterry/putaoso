import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

// 把 Noto Serif SC 子集化成只含小程序实际用到字符的 WOFF2，
// 以 base64 data URL 形式输出成 JS 模块。
// 全量中文字体约 11MB 无法进包；子集化 + CFF→glyf 转换（WOFF2 对
// glyf 轮廓有专门的预变换，比 CFF 小约 20%）后约 255KB。
// 必须走 base64：微信打包代码包按文件类型白名单收文件，
// woff/woff2/ttf 等字体文件不会被打进包，真机上无法用路径加载。
// 内容（varieties.json）或界面文案新增生僻字后需要重跑：npm run weapp:fonts
// 依赖：python3 + fonttools + brotli（python3 -m pip install --user fonttools brotli）

const root = process.cwd();
const miniprogramDir = path.join(root, 'weapp/miniprogram');
const dataFile = path.join(miniprogramDir, 'data/varieties.json');
const outputDir = path.join(miniprogramDir, 'assets/fonts');
const woff2File = path.join(os.tmpdir(), 'putaoso-noto-serif-sc.woff2');
const moduleFile = path.join(outputDir, 'noto-serif-sc.js');

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

// === 子集化 + CFF→glyf + WOFF2 ===

fs.mkdirSync(outputDir, { recursive: true });

const pythonScript = `
import sys
from fontTools.ttLib import newTable
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools import subset

source, chars_file, output = sys.argv[1], sys.argv[2], sys.argv[3]

opts = subset.Options(layout_features=[], hinting=False)
font = subset.load_font(source, opts)
subsetter = subset.Subsetter(opts)
subsetter.populate(text=open(chars_file, encoding="utf-8").read())
subsetter.subset(font)

glyph_order = font.getGlyphOrder()
glyph_set = font.getGlyphSet()
glyf_glyphs = {}
for name in glyph_order:
    tt_pen = TTGlyphPen(glyph_set)
    pen = Cu2QuPen(tt_pen, max_err=1.0, reverse_direction=True)
    glyph_set[name].draw(pen)
    glyf_glyphs[name] = tt_pen.glyph()

glyf = newTable("glyf")
glyf.glyphOrder = glyph_order
glyf.glyphs = glyf_glyphs
font["glyf"] = glyf
font["loca"] = newTable("loca")

font["maxp"].tableVersion = 0x00010000
for attr in (
    "maxZones", "maxTwilightPoints", "maxStorage", "maxFunctionDefs",
    "maxInstructionDefs", "maxStackElements", "maxSizeOfInstructions",
    "maxComponentElements", "maxComponentDepth", "maxPoints", "maxContours",
    "maxCompositePoints", "maxCompositeContours",
):
    setattr(font["maxp"], attr, 0)
font["head"].indexToLocFormat = 0
del font["CFF "]
font.sfntVersion = "\\x00\\x01\\x00\\x00"
font.recalcBBoxes = True

font.flavor = "woff2"
font.save(output)
`;

const result = spawnSync('python3', ['-', sourceFont, tmpCharsFile, woff2File], {
  input: pythonScript,
  encoding: 'utf8',
});

if (result.status !== 0) {
  process.stderr.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  throw new Error(
    'Font subsetting failed — is fonttools installed? (python3 -m pip install --user fonttools brotli)'
  );
}

fs.rmSync(tmpCharsFile, { force: true });

const base64 = fs.readFileSync(woff2File).toString('base64');
fs.rmSync(woff2File, { force: true });
fs.writeFileSync(
  moduleFile,
  `/* 自动生成：npm run weapp:fonts，不要手动编辑 */\nmodule.exports = 'data:font/woff2;base64,${base64}';\n`
);

// 旧的字体文件残留清理（字体文件本就不会被打进代码包）
fs.rmSync(path.join(outputDir, 'noto-serif-sc.woff'), { force: true });
fs.rmSync(path.join(outputDir, 'noto-serif-sc.woff2'), { force: true });

const sizeKb = (fs.statSync(moduleFile).size / 1024).toFixed(0);
console.log(
  `Exported ${chars.length}-char Noto Serif SC subset to ${path.relative(root, moduleFile)} (${sizeKb} KB base64 module)`
);
