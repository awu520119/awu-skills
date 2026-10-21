import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const safeId = /^[a-z][a-z0-9-]*$/;
const fail = (message) => {
  throw new Error(message);
};

export function readConfig(root, { requireViewer = true } = {}) {
  const configPath = join(root, 'prototype-pages.json');
  if (!existsSync(configPath)) fail(`找不到 ${configPath}`);
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    fail(`页面清单不是合法 JSON：${error.message}`);
  }
  if (!safeId.test(config?.sourceId || '')) fail('sourceId 必须是 kebab-case');
  if (
    requireViewer &&
    (typeof config?.viewer?.projectPath !== 'string' || !config.viewer.projectPath)
  )
    fail('viewer.projectPath 未配置');
  if (!Array.isArray(config.groups) || !Array.isArray(config.pages))
    fail('必须配置 groups 与 pages 数组');
  const groups = new Set();
  for (const group of config.groups) {
    if (
      !safeId.test(group?.id || '') ||
      !group.title ||
      !Number.isInteger(group.order) ||
      groups.has(group.id)
    )
      fail('groups 中存在非法或重复项');
    groups.add(group.id);
  }
  const pages = new Set();
  const docs = new Set();
  for (const page of config.pages) {
    if (!safeId.test(page?.id || '') || pages.has(page.id) || groups.has(page.id))
      fail('pages 中存在非法或重复 id');
    if (!/^[^/\\]+\.md$/.test(page.doc || '') || docs.has(page.doc))
      fail(`页面 ${page.id} 的 doc 必须是唯一的 Markdown 文件名`);
    if (!page.title || !groups.has(page.parent) || !Number.isInteger(page.order))
      fail(`页面 ${page.id} 的 parent、title 或 order 无效`);
    if (
      !['screen', 'drawer'].includes(page.mode) ||
      typeof page.hash !== 'string' ||
      !page.hash.startsWith('#/')
    )
      fail(`页面 ${page.id} 的 mode 或 hash 无效`);
    if (page.mode === 'drawer' && !page.hash.startsWith('#/demo/export/'))
      fail(`抽屉页 ${page.id} 必须使用 #/demo/export/ 路由`);
    pages.add(page.id);
    docs.add(page.doc);
  }
  return config;
}

export function fragment(config) {
  const groups = config.groups.map((group) => ({
    ...group,
    id: `${config.sourceId}--${group.id}`,
    children: [],
  }));
  const byId = new Map(config.groups.map((group, index) => [group.id, groups[index]]));
  for (const page of config.pages) {
    const id = `${config.sourceId}--${page.id}`;
    byId.get(page.parent).children.push({
      id,
      title: page.title,
      order: page.order,
      templateType: page.mode,
      routeHash: page.hash,
      htmlPath: `.published/${config.sourceId}/pages/${page.id}.html`,
      mdPath: `.published/${config.sourceId}/desc/${page.doc}`,
      children: [],
    });
  }
  return { sourceId: config.sourceId, tree: groups };
}

export function leafIds(fragmentData) {
  const ids = [];
  const walk = (nodes) =>
    nodes.forEach((node) => {
      if (node.htmlPath) ids.push(node.id);
      walk(node.children || []);
    });
  walk(fragmentData?.tree || []);
  return ids;
}

// Old review aliases remain available; all new pages come from the publication manifest.
export function reviewTargets(config, review) {
  const aliases = { 'theme-list': 'themes', 'order-list': 'orders' };
  const targets = config.pages.map((page) => ({
    ...page,
    alias: aliases[page.id] || page.id,
    file: `review-${aliases[page.id] || page.id}.html`,
  }));
  if (review === 'all') return targets;
  const target = targets.find((page) => page.id === review || page.alias === review);
  if (!target)
    throw new Error(
      `不支持的评审页：${review}。可用值：all, ${targets.map((page) => page.alias).join(', ')}`,
    );
  return [target];
}
