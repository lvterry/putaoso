import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const root = process.cwd();
const contentDir = path.join(root, 'src/content/varieties');
const coordsFile = path.join(root, 'src/data/region-coords.json');
const outputDir = path.join(root, 'weapp/miniprogram/data');
const jsonOutputFile = path.join(outputDir, 'varieties.json');
const moduleOutputFile = path.join(outputDir, 'varieties.js');

const regionCoords = JSON.parse(fs.readFileSync(coordsFile, 'utf8'));

const files = fs
  .readdirSync(contentDir)
  .filter((file) => file.endsWith('.md'))
  .sort();

const errors = [];

const varieties = files
  .map((file) => {
    const slug = file.replace(/\.md$/, '');
    const source = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const data = matter(source).data;

    return {
      slug,
      ...data,
      regions: (data.regions ?? []).map((region) => {
        const coord = regionCoords[region.name_en];

        if (!coord) {
          console.warn(`Missing region coordinate for ${region.name_en} (${slug})`);
          return region;
        }

        return {
          ...region,
          coordinate: {
            latitude: coord[0],
            longitude: coord[1],
          },
        };
      }),
    };
  })
  .sort((a, b) => a.number - b.number);

// === 校验 ===

const slugSet = new Set();
const numberSet = new Set();

for (const v of varieties) {
  const id = `${v.slug}`;

  if (slugSet.has(v.slug)) errors.push(`${id}: duplicate slug`);
  slugSet.add(v.slug);

  if (numberSet.has(v.number)) errors.push(`${id}: duplicate number ${v.number}`);
  numberSet.add(v.number);

  if (!['live', 'draft', 'planned'].includes(v.status)) {
    errors.push(`${id}: invalid status "${v.status}"`);
  }

  for (const [field, list] of [
    ['regions', v.regions],
    ['bottles', v.bottles],
    ['similar', v.similar],
  ]) {
    if (!Array.isArray(list) || list.length !== 3) {
      errors.push(`${id}: expected exactly 3 ${field}, got ${list?.length ?? 0}`);
    }
  }

  if (v.type === 'red') {
    if (typeof v.palate?.tannin !== 'number' || !v.palate?.tannin_label) {
      errors.push(`${id}: red variety must have palate.tannin and palate.tannin_label`);
    }
  } else if (v.type === 'white' || v.type === 'rose') {
    if (typeof v.palate?.sweetness !== 'number' || !v.palate?.sweetness_label) {
      errors.push(`${id}: ${v.type} variety must have palate.sweetness and palate.sweetness_label`);
    }
  } else {
    errors.push(`${id}: invalid type "${v.type}"`);
  }
}

// 与网站行为一致：similar.slug 不存在或非 live 时小程序展示纯文本不跳转，
// 所以这里只警告不报错（网站详情页同样允许指向尚未收录的品种）
for (const v of varieties) {
  for (const s of v.similar ?? []) {
    if (!slugSet.has(s.slug)) {
      console.warn(`Warning: ${v.slug} similar.slug "${s.slug}" has no variety entry (rendered as plain text)`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}

// varieties.json 是导出产物的事实来源；小程序运行时通过 varieties.js 读取，
// 因为原生小程序的 require 不支持 JSON 模块。打包时 varieties.json 被
// project.config.json 的 packOptions.ignore 排除，避免包体重复。
fs.mkdirSync(outputDir, { recursive: true });
const json = JSON.stringify(varieties, null, 2);
fs.writeFileSync(jsonOutputFile, `${json}\n`);
fs.writeFileSync(
  moduleOutputFile,
  `/* 自动生成：npm run weapp:data，不要手动编辑 */\nmodule.exports = ${json};\n`
);

const liveCount = varieties.filter((v) => v.status === 'live').length;
console.log(
  `Exported ${varieties.length} varieties (${liveCount} live) to ${path.relative(root, jsonOutputFile)}`
);
