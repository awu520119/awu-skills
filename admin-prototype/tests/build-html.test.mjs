import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { readBuildHtml, pageHtml } from '../templates/admin/scripts/build-html.mjs';
import { readConfig, reviewTargets, fragment, documentPath } from '../templates/admin/scripts/publication.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'admin-html-test-'));
  mkdirSync(join(root, 'dist/assets'), { recursive: true });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('export preserves a standalone page and embeds its packaged styles, scripts and media', (t) => {
  const root = fixture(t);
  writeFileSync(
    join(root, 'dist/index.html'),
    `<html><head><title>例子</title><link href='./assets/main.css' rel='stylesheet'></head><body class='existing'><script src='./assets/main.js' type='module'></script><img src='./assets/image.png'></body></html>`,
  );
  writeFileSync(join(root, 'dist/assets/main.css'), 'body{background:url("./image.png")}');
  writeFileSync(join(root, 'dist/assets/main.js'), 'window.value="</script>";');
  writeFileSync(join(root, 'dist/assets/image.png'), 'local-image');
  const html = readBuildHtml(root);
  assert.match(html, /data:image\/png;base64,/);
  assert.match(html, /<\\\/script>/);
  assert.doesNotMatch(html, /(?:href|src)=['"]\.\/assets/);
  const page = pageHtml(html, { hash: '#/orders', title: 'A < B & C' });
  assert.match(page, /body class='existing'/);
  assert.match(page, /A &lt; B &amp; C/);
  assert.match(page, /__PROTOTYPE_INITIAL_ROUTE__="#\/orders"/);
  assert.doesNotMatch(page, /data-viewer-layout/);
  const published = pageHtml(html, { hash: '#/orders', title: '订单' }, { viewer: true });
  assert.match(published, /data-viewer-layout/);
  assert.match(published, /\.app-sider\{display:none!important\}/);
});

test('missing resources and split bundles fail before writing a broken share file', (t) => {
  const root = fixture(t);
  const index = join(root, 'dist/index.html');
  writeFileSync(index, '<body><script src="./assets/missing.js"></script></body>');
  assert.throws(() => readBuildHtml(root), /资源缺失/);
  writeFileSync(index, '<body><script src="./assets/main.js" type="module"></script></body>');
  writeFileSync(join(root, 'dist/assets/main.js'), 'import("./extra.js");');
  assert.throws(() => readBuildHtml(root), /分包/);
});

test('one manifest drives publication and stable review page names', (t) => {
  const root = fixture(t);
  const config = {
    sourceId: 'demo',
    viewer: { projectPath: '' },
    groups: [{ id: 'group', title: '模块', order: 0 }],
    pages: [
      {
        id: 'order-list',
        title: '订单',
        parent: 'group',
        order: 1,
        hash: '#/orders',
        mode: 'screen',
        doc: '订单.md',
      },
    ],
  };
  const file = join(root, 'prototype-pages.json');
  writeFileSync(file, JSON.stringify(config));
  const read = readConfig(root, { requireViewer: false });
  assert.equal(reviewTargets(read, 'order-list')[0].file, 'review-order-list.html');
  assert.throws(() => reviewTargets(read, 'orders'), /不支持/);
  assert.equal(reviewTargets(read, 'order-list')[0].hash, '#/orders');
  assert.throws(() => readConfig(root), /未配置/);
  config.pages[0].id = 'group';
  writeFileSync(file, JSON.stringify(config));
  assert.throws(() => readConfig(root, { requireViewer: false }), /重复/);
});

test('pages can share a nested PRD and use existing hash routes and readiness checks', (t) => {
  const root = fixture(t);
  const page = {
    id: 'list',
    title: '列表',
    parent: 'group',
    order: 1,
    hash: '#/orders',
    mode: 'screen',
    doc: 'settlement/shared.md',
  };
  const config = {
    sourceId: 'demo',
    viewer: { projectPath: '' },
    groups: [{ id: 'group', title: '模块', order: 0 }],
    pages: [
      page,
      {
        ...page,
        id: 'detail',
        mode: 'drawer',
        hash: '#/orders/detail',
        ready: { selector: '[data-review="detail"]', text: '详情' },
      },
    ],
  };
  const file = join(root, 'prototype-pages.json');
  writeFileSync(file, JSON.stringify(config));
  const read = readConfig(root, { requireViewer: false });
  assert.equal(read.pages[0].doc, read.pages[1].doc);
  assert.equal(read.pages[1].hash, '#/orders/detail');
  assert.deepEqual(fragment(read).tree[0].children[1].ready, read.pages[1].ready);
  config.pages[1].ready = { selector: '' };
  writeFileSync(file, JSON.stringify(config));
  assert.throws(() => readConfig(root, { requireViewer: false }), /ready/);
  delete config.pages[1].ready;
  for (const doc of ['../escape.md', '/absolute.md', 'nested/../escape.md', 'nested\\escape.md']) {
    config.pages[0].doc = doc;
    writeFileSync(file, JSON.stringify(config));
    assert.throws(() => readConfig(root, { requireViewer: false }), /doc/);
  }
});

test('document references cannot escape through a symlink', (t) => {
  const root = fixture(t);
  mkdirSync(join(root, 'docs'));
  const outside = fixture(t);
  writeFileSync(join(outside, 'secret.md'), 'outside');
  symlinkSync(outside, join(root, 'docs', 'linked'));
  assert.throws(() => documentPath(root, 'linked/secret.md'), /越界/);
});

test('the template lockfile contains each optional native dependency', () => {
  const { packages } = JSON.parse(
    readFileSync(new URL('../templates/admin/package-lock.json', import.meta.url), 'utf8'),
  );
  for (const [parent, info] of Object.entries(packages)) {
    for (const [name, version] of Object.entries(info.optionalDependencies || {})) {
      const entry = packages[`${parent}/node_modules/${name}`] || packages[`node_modules/${name}`];
      assert.ok(entry, `Missing optional lock entry: ${parent} -> ${name}@${version}`);
    }
  }
});
