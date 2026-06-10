import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceDir = path.join(root, 'public/illustrations');
const outputDir = path.join(root, 'ios/Putaoso/Resources/Illustrations');
const size = '1600';
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

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'putaoso-ios-illustrations-'));
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
    ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', renderedFile, '--out', outputFile],
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

for (const file of fs.readdirSync(outputDir)) {
  if ((file.endsWith('.png') || file.endsWith('.jpg')) && !expected.has(file)) {
    fs.rmSync(path.join(outputDir, file));
  }
}

console.log(
  generated === 0
    ? `iOS illustrations are up to date in ${path.relative(root, outputDir)}`
    : `Exported ${generated} iOS illustrations to ${path.relative(root, outputDir)}`
);
