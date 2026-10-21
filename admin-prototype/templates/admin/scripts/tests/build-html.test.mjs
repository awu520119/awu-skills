import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { readBuildHtml, pageHtml } from '../build-html.mjs';
import { readConfig, reviewTargets } from '../publication.mjs';

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

test('one manifest drives publication and old/new review page names', (t) => {
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
  assert.equal(reviewTargets(read, 'orders')[0].file, 'review-orders.html');
  assert.equal(reviewTargets(read, 'order-list')[0].hash, '#/orders');
  assert.throws(() => readConfig(root), /未配置/);
  config.pages[0].id = 'group';
  writeFileSync(file, JSON.stringify(config));
  assert.throws(() => readConfig(root, { requireViewer: false }), /重复/);
});
