import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const root = process.cwd();
const contentDir = path.join(root, 'src/content/varieties');
const outputFile = path.join(root, 'ios/Putaoso/Resources/varieties.json');

const files = fs
  .readdirSync(contentDir)
  .filter((file) => file.endsWith('.md'))
  .sort();

const varieties = files
  .map((file) => {
    const slug = file.replace(/\.md$/, '');
    const source = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const parsed = matter(source);
    return {
      slug,
      ...parsed.data,
    };
  })
  .sort((a, b) => a.number - b.number);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(varieties, null, 2)}\n`);

console.log(`Exported ${varieties.length} varieties to ${path.relative(root, outputFile)}`);
