# 后台原型维护约定

模板的业务入口是 `templates/admin/src/App.tsx`。新增业务页放 `src/pages/`，样例数据及类型放 `src/mock/`；多个页面共用的交互放 `src/components/`。主题管理已将列表编排、表单抽屉、详情抽屉、封面选择和草稿存取拆开，可在对应文件局部修改。视觉基线集中在 `src/theme.ts` 和 `src/styles.css`，不要在页面复制全局尺寸。所有表格操作复用 `TableActions`，操作列设置 `fixed: 'right'` 并为 `Table` 配置列宽总和的 `scroll.x`。

新增需要发布的页面时，同时在 `prototype-pages.json` 登记唯一 ID、标题、分组、PRD 路径、`screen` 或 `drawer` 模式和真实 Hash 路由，并在 `docs/` 放说明。清单驱动发布和评审 HTML；历史 `theme-list`、`order-list` 的评审文件名继续兼容。每个新项目的 `sourceId` 在初始化时设置为项目名，不复用模板身份。未配置查看器时仍可单独导出 HTML。

构建产物的资源内联只修改 `scripts/build-html.mjs`；独立分享调用 `inline-share.mjs`，查看器发布调用 `publish-to-viewer.mjs`。清单校验和目录片段在 `publication.mjs`，新项目身份配置在 `configure-project.mjs`。导出器要求单一 JS 入口，并对资源缺失、外链、分包主动报错；如新增动态 import，须同步完善导出器并增加回归用例。

改动后在生成项目根目录运行：

```bash
npm ci
npm run format:check
npm test
npm run check
npm run export:html
```

用浏览器打开 `dist/admin-share.html`，检查 1440px 和 1920px 下业务侧栏、列表冻结操作列、抽屉字段对齐和完整交互。发布功能在隔离查看器中运行 `npm run publish:viewer`，确认 `.published/<sourceId>/`、导航、说明与离线查看器，并检查发布失败时原结果仍可使用。构建依赖由 `package-lock.json` 锁定；安装要求以 `package.json` 的 Node 版本为准。
