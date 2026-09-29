// 将 Vite 构建产物内联为可离线双击打开的完整项目单页。
// 默认输出 dist/admin-share.html；评审页通过 --review=<name> 或 --review=all 输出。
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const dist = join(root, 'dist');
const assetDir = join(dist, 'assets');
const review = process.argv.find((arg) => arg.startsWith('--review='))?.split('=')[1];

if (!existsSync(join(dist, 'index.html'))) {
  console.error('未找到 dist/index.html，请先执行 npm run build');
  process.exit(1);
}

const assets = existsSync(assetDir) ? readdirSync(assetDir) : [];
const readAsset = (file) => readFileSync(join(assetDir, file), 'utf8');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/g,
  (_all, file) => (assets.includes(file) ? `<style>${readAsset(file)}</style>` : _all),
);
html = html.replace(
  /<script[^>]*type="module"[^>]*src="\.\/assets\/([^"]+)"[^>]*>\s*<\/script>/g,
  (_all, file) => (assets.includes(file) ? `<script type="module">\n${readAsset(file)}\n</script>` : _all),
);

const shareFile = join(dist, 'admin-share.html');
writeFileSync(shareFile, html);
console.log(`已生成：${shareFile}`);

// 新增评审场景时，在此表增加文件名与 Hash 路由；评审路由应优先复用后台 Layout。
const reviewPages = {
  orders: { file: 'review-orders.html', hash: '#/orders' },
};

if (review) {
  const targets = review === 'all' ? Object.values(reviewPages) : reviewPages[review] ? [reviewPages[review]] : null;
  if (!targets) {
    console.error(`不支持的评审页：${review}。可用值：all, ${Object.keys(reviewPages).join(', ')}`);
    process.exit(1);
  }
  const marker = '<script type="module">';
  for (const target of targets) {
    const reviewHtml = html.replace(marker, `<script>if(!location.hash)location.hash='${target.hash}';</script>\n${marker}`);
    const output = join(dist, target.file);
    writeFileSync(output, reviewHtml);
    console.log(`已生成评审页：${output}`);
  }
}
