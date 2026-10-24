// Give every generated project an independent package and publication identity.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const [project, name, viewer] = process.argv.slice(2);
if (!project || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name || ''))
  throw new Error('缺少有效项目路径或 kebab-case 项目名');
for (const file of ['package.json', 'package-lock.json']) {
  const path = join(project, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  data.name = name;
  if (data.packages?.['']) data.packages[''].name = name;
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}
const path = join(project, 'prototype-pages.json');
const config = JSON.parse(readFileSync(path, 'utf8'));
config.sourceId = name;
config.viewer.projectPath = viewer ? relative(project, viewer) || '.' : '';
writeFileSync(path, JSON.stringify(config, null, 2) + '\n');

writeFileSync(join(project, '.admin-prototype.json'), JSON.stringify({ toolkitVersion: 5 }) + '\n');
