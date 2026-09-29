// 将页面、PRD 与目录片段安全发布到配套 prototype-viewer。
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync,
  rmSync, writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, 'prototype-pages.json');
const safeId = /^[a-z][a-z0-9-]*$/;

function fail(message) {
  throw new Error(`发布失败：${message}`);
}

function readConfig() {
  if (!existsSync(configPath)) fail(`找不到 ${configPath}`);
  let config;
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch (error) { fail(`页面清单不是合法 JSON：${error.message}`); }
  if (!safeId.test(config?.sourceId || '')) fail('sourceId 必须是 kebab-case');
  if (typeof config?.viewer?.projectPath !== 'string' || !config.viewer.projectPath) fail('viewer.projectPath 未配置');
  if (!Array.isArray(config.groups) || !Array.isArray(config.pages)) fail('必须配置 groups 与 pages 数组');
  const groups = new Set();
  for (const group of config.groups) {
    if (!safeId.test(group?.id || '') || !group.title || !Number.isInteger(group.order) || groups.has(group.id)) fail('groups 中存在非法或重复项');
    groups.add(group.id);
  }
  const pages = new Set();
  const docs = new Set();
  for (const page of config.pages) {
    if (!safeId.test(page?.id || '') || pages.has(page.id)) fail('pages 中存在非法或重复 id');
    if (!/^[^/\\]+\.md$/.test(page.doc || '') || docs.has(page.doc)) fail(`页面 ${page.id} 的 doc 必须是唯一的 Markdown 文件名`);
    if (!page.title || !groups.has(page.parent) || !Number.isInteger(page.order)) fail(`页面 ${page.id} 的 parent、title 或 order 无效`);
    if (!['screen', 'drawer'].includes(page.mode) || typeof page.hash !== 'string' || !page.hash.startsWith('#/')) fail(`页面 ${page.id} 的 mode 或 hash 无效`);
    if (page.mode === 'drawer' && !page.hash.startsWith('#/demo/export/')) fail(`抽屉页 ${page.id} 必须使用 #/demo/export/ 路由`);
    pages.add(page.id); docs.add(page.doc);
  }
  return config;
}

function inside(base, target) {
  const rel = relative(base, target);
  return rel && rel !== '..' && !rel.startsWith(`..${sep}`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error || result.status !== 0) fail(`${command} ${args.join(' ')} 未成功执行`);
}

function inlineBuild() {
  const dist = join(root, 'dist');
  const assetDir = join(dist, 'assets');
  const index = join(dist, 'index.html');
  if (!existsSync(index)) fail('未找到 dist/index.html，请先执行 npm run build');
  const assets = existsSync(assetDir) ? new Set(readdirSync(assetDir)) : new Set();
  const asset = (file) => readFileSync(join(assetDir, file), 'utf8');
  let html = readFileSync(index, 'utf8');
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/g, (all, file) => assets.has(file) ? `<style>${asset(file)}</style>` : all);
  html = html.replace(/<script[^>]*type="module"[^>]*src="\.\/assets\/([^"]+)"[^>]*>\s*<\/script>/g, (all, file) => assets.has(file) ? `<script type="module">\n${asset(file)}\n</script>` : all);
  return html;
}

function pageHtml(html, page) {
  const boot = `<script>if(!location.hash)location.hash=${JSON.stringify(page.hash)};</script>`;
  const staticStyle = '<style>body.prd-static-page .app-sider{display:none!important}body.prd-static-page .app-workspace{width:100%!important}</style>';
  return html
    .replace('<body>', `<body class="prd-static-page">${staticStyle}${boot}`)
    .replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);
}

function fragment(config) {
  const groups = config.groups.map((group) => ({ ...group, children: [] }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (const page of config.pages) {
    const id = `${config.sourceId}--${page.id}`;
    byId.get(page.parent).children.push({
      id, title: page.title, order: page.order, templateType: page.mode,
      htmlPath: `.published/${config.sourceId}/pages/${page.id}.html`,
      mdPath: `.published/${config.sourceId}/desc/${page.doc}`,
      children: [],
    });
  }
  return { sourceId: config.sourceId, tree: groups };
}

function leafIds(fragmentData) {
  const ids = [];
  const walk = (nodes) => nodes.forEach((node) => { if (node.htmlPath) ids.push(node.id); walk(node.children || []); });
  walk(fragmentData?.tree || []);
  return ids;
}

function main() {
  const config = readConfig();
  const viewer = resolve(root, config.viewer.projectPath);
  if (!existsSync(join(viewer, '.prototype-viewer.json'))) fail(`目标不是受控查看器：${viewer}`);
  const publishedRoot = join(viewer, '.published');
  const target = join(publishedRoot, config.sourceId);
  if (!inside(publishedRoot, target)) fail('发布目标路径异常');
  const html = inlineBuild();
  const stage = join(publishedRoot, `.${config.sourceId}-stage-${process.pid}`);
  const backup = join(publishedRoot, `.${config.sourceId}-backup-${process.pid}`);
  const previous = existsSync(join(target, 'nav.fragment.json')) ? JSON.parse(readFileSync(join(target, 'nav.fragment.json'), 'utf8')) : null;
  mkdirSync(join(stage, 'pages'), { recursive: true });
  mkdirSync(join(stage, 'desc'), { recursive: true });
  for (const page of config.pages) {
    const doc = join(root, 'docs', page.doc);
    if (!existsSync(doc)) fail(`找不到 PRD：docs/${page.doc}`);
    writeFileSync(join(stage, 'pages', `${page.id}.html`), pageHtml(html, page), 'utf8');
    copyFileSync(doc, join(stage, 'desc', page.doc));
  }
  writeFileSync(join(stage, 'nav.fragment.json'), `${JSON.stringify(fragment(config), null, 2)}\n`, 'utf8');
  if (existsSync(target)) renameSync(target, backup);
  renameSync(stage, target);
  try {
    run('python3', ['scripts/sync_project.py', '.', '--verbose'], viewer);
    run('python3', ['scripts/validate.py', '.', '--quiet'], viewer);
    if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    rmSync(target, { recursive: true, force: true });
    if (existsSync(backup)) renameSync(backup, target);
    // 恢复查看器目录数据；失败时保留原错误供调用者处理。
    try { run('python3', ['scripts/sync_project.py', '.'], viewer); } catch { /* noop */ }
    throw error;
  }
  // 只清理由本发布源不再声明的说明 HTML。
  const current = new Set(leafIds(fragment(config)));
  for (const id of leafIds(previous)) {
    if (!current.has(id)) rmSync(join(viewer, 'desc', `${id}.html`), { force: true });
  }
  console.log(`✅ 已发布 ${config.pages.length} 个页面到 ${viewer}`);
}

try { main(); } catch (error) { console.error(`❌ ${error.message}`); process.exit(1); }
