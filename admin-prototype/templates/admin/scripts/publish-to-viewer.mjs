// 将页面、PRD 与目录片段安全发布到配套 prototype-viewer。
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readBuildHtml, pageHtml } from './build-html.mjs';
import { readConfig, fragment, leafIds, safeId } from './publication.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  throw new Error(`发布失败：${message}`);
}

function inside(base, target) {
  const rel = relative(base, target);
  return rel && rel !== '..' && !rel.startsWith(`..${sep}`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error || result.status !== 0) fail(`${command} ${args.join(' ')} 未成功执行`);
}

function snapshotGenerated(viewer) {
  const files = new Map();
  for (const name of ['nav.json', 'nav.js']) {
    const path = join(viewer, name);
    if (existsSync(path)) files.set(name, readFileSync(path));
  }
  const desc = join(viewer, 'desc');
  const descriptions = new Map();
  if (existsSync(desc)) {
    for (const name of readdirSync(desc).filter((name) => name.endsWith('.html'))) {
      descriptions.set(name, readFileSync(join(desc, name)));
    }
  }
  return { files, descriptions };
}

function restoreGenerated(viewer, sourceId, snapshot) {
  for (const name of ['nav.json', 'nav.js']) {
    const path = join(viewer, name);
    if (snapshot.files.has(name)) writeFileSync(path, snapshot.files.get(name));
    else if (existsSync(path)) rmSync(path);
  }
  const desc = join(viewer, 'desc');
  for (const name of readdirSync(desc).filter((name) => name.endsWith('.html'))) {
    if (name.startsWith(`${sourceId}--`) && !snapshot.descriptions.has(name))
      rmSync(join(desc, name));
  }
  for (const [name, content] of snapshot.descriptions) writeFileSync(join(desc, name), content);
}

function main() {
  const config = readConfig(root);
  const viewer = resolve(root, config.viewer.projectPath);
  if (!existsSync(join(viewer, '.prototype-viewer.json'))) fail(`目标不是受控查看器：${viewer}`);
  const publishedRoot = join(viewer, '.published');
  const target = join(publishedRoot, config.sourceId);
  if (!inside(publishedRoot, target)) fail('发布目标路径异常');
  for (const page of config.pages) {
    if (!existsSync(join(root, 'docs', page.doc))) fail(`找不到 PRD：docs/${page.doc}`);
  }
  const html = readBuildHtml(root);
  mkdirSync(publishedRoot, { recursive: true });
  const lockPath = join(publishedRoot, '.publish-lock');
  let lock;
  try {
    lock = openSync(lockPath, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') fail(`查看器已有发布任务；若确认没有任务运行，再检查 ${lockPath}`);
    fail(`无法创建发布锁：${error.message}`);
  }
  closeSync(lock);
  let stage;
  const backup = join(publishedRoot, `.${config.sourceId}-backup-${process.pid}`);
  let movedOriginal = false;
  let movedStage = false;
  let published = false;
  let snapshotGeneratedBefore;
  try {
    stage = mkdtempSync(join(publishedRoot, `.${config.sourceId}-stage-`));
    if (existsSync(backup)) fail(`备份目录已存在，请先检查：${backup}`);
    const previous = existsSync(join(target, 'nav.fragment.json'))
      ? JSON.parse(readFileSync(join(target, 'nav.fragment.json'), 'utf8'))
      : null;
    snapshotGeneratedBefore = snapshotGenerated(viewer);
    mkdirSync(join(stage, 'pages'));
    mkdirSync(join(stage, 'desc'));
    for (const page of config.pages) {
      writeFileSync(join(stage, 'pages', `${page.id}.html`), pageHtml(html, page), 'utf8');
      copyFileSync(join(root, 'docs', page.doc), join(stage, 'desc', page.doc));
    }
    writeFileSync(
      join(stage, 'nav.fragment.json'),
      `${JSON.stringify(fragment(config), null, 2)}\n`,
      'utf8',
    );
    run('python3', ['scripts/smoke_published.py', stage], viewer);
    if (existsSync(target)) {
      renameSync(target, backup);
      movedOriginal = true;
    }
    renameSync(stage, target);
    movedStage = true;
    run('python3', ['scripts/sync_project.py', '.', '--verbose'], viewer);
    const current = new Set(leafIds(fragment(config)));
    for (const id of leafIds(previous)) {
      if (
        !id.startsWith(`${config.sourceId}--`) ||
        !safeId.test(id.slice(config.sourceId.length + 2))
      ) {
        fail(`上次发布记录包含非法节点 id：${id}`);
      }
      if (!current.has(id)) rmSync(join(viewer, 'desc', `${id}.html`), { force: true });
    }
    published = true;
  } catch (error) {
    if (movedOriginal || movedStage) {
      try {
        if (movedStage) rmSync(target, { recursive: true });
        if (movedOriginal) renameSync(backup, target);
        restoreGenerated(viewer, config.sourceId, snapshotGeneratedBefore);
      } catch (rollbackError) {
        fail(
          `${error.message}；自动恢复失败：${rollbackError.message}。原发布备份保留在 ${backup}`,
        );
      }
    }
    throw error;
  } finally {
    if (stage && existsSync(stage)) rmSync(stage, { recursive: true, force: true });
    rmSync(lockPath, { force: true });
  }
  if (published && existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  console.log(`✅ 已发布 ${config.pages.length} 个页面到 ${viewer}`);
}

try {
  main();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
