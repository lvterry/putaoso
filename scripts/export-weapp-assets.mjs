import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceDir = path.join(root, 'public/illustrations');
const outputDir = path.join(root, 'weapp/miniprogram/assets/illustrations');
// 小程序主包有体积上限（还要给字体子集留空间），渲染尺寸和压缩率都比 iOS 版更保守
const size = '800';
const jpegQuality = '62';
const outputExtension = 'jpg';

const svgFiles = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith('.svg'))
  .sort();

fs.mkdirSync(outputDir, { recursive: true });

let generated = 0;
const expected = new Set();

for (const file of svgFiles) {
  const slug = file.replace(/\.svg$/, '');
  const sourceFile = path.join(sourceDir, file);
  const outputFile = path.join(outputDir, `${slug}.${outputExtension}`);
  expected.add(`${slug}.${outputExtension}`);

  const sourceStat = fs.statSync(sourceFile);
  const outputStat = fs.existsSync(outputFile) ? fs.statSync(outputFile) : null;

  if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
    continue;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'putaoso-weapp-illustrations-'));
  const result = spawnSync('qlmanage', ['-t', '-s', size, '-o', tmpDir, sourceFile], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`Failed to render ${file} with qlmanage`);
  }

  const renderedFile = path.join(tmpDir, `${file}.png`);
  if (!fs.existsSync(renderedFile)) {
    throw new Error(`qlmanage did not produce ${path.basename(renderedFile)}`);
  }

  const convertResult = spawnSync(
    'sips',
    ['-s', 'format', 'jpeg', '-s', 'formatOptions', jpegQuality, renderedFile, '--out', outputFile],
    { encoding: 'utf8' }
  );

  if (convertResult.status !== 0) {
    process.stderr.write(convertResult.stdout ?? '');
    process.stderr.write(convertResult.stderr ?? '');
    throw new Error(`Failed to convert ${file} to JPEG`);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  generated += 1;
}

let totalBytes = 0;
for (const file of fs.readdirSync(outputDir)) {
  if ((file.endsWith('.png') || file.endsWith('.jpg')) && !expected.has(file)) {
    fs.rmSync(path.join(outputDir, file));
    continue;
  }
  totalBytes += fs.statSync(path.join(outputDir, file)).size;
}

const totalMb = (totalBytes / 1024 / 1024).toFixed(2);
console.log(
  generated === 0
    ? `Weapp illustrations are up to date in ${path.relative(root, outputDir)} (${totalMb} MB)`
    : `Exported ${generated} weapp illustrations to ${path.relative(root, outputDir)} (${totalMb} MB)`
);

// 主包上限 2MB（不开分包时），插图超标时提前报错而不是等上传失败
if (totalBytes > 1.6 * 1024 * 1024) {
  throw new Error(`Illustrations total ${totalMb} MB — too close to the 2MB main package limit`);
}
