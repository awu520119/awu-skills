# 模板维护

订单初始化示例来自小蜜蜂项目订单管理页，包含筛选、可折叠统计、状态页签、订单详情及飞行任务详情。实现位于 `src/features/order-management/`，入口为 `src/pages/OrderListPage.tsx`，独立数据位于 `src/mock/orders.ts`；媒体示例随包放在该功能的 `assets/` 中。修改时保持模板不依赖来源项目，并同步 `docs/订单列表PRD.md`。

`templates/admin/src/App.tsx` 管路由；页面、Mock、共享组件分别在 `src/pages/`、`src/mock/`、`src/components/`，视觉值集中在 `src/theme.ts` 和 `src/styles.css`。表格操作复用 `TableActions`，固定右侧操作列并设置匹配的 `scroll.x`。新建项目由 `scripts/init-demo.sh` 复制模板并写入独立 `sourceId`。

发布页面只在 `prototype-pages.json` 登记 ID、文档、Hash 路由和模式；文档放 `docs/`。`scripts/build-html.mjs` 是独立导出和查看器发布共用的离线资源内联器；改动时检查资源缺失、外链和分包的失败行为。发布器只调用目标查看器项目内的公开脚本，不读取 `prototype-viewer` 技能目录。

模板修改后，在**隔离生成的项目**中运行 `npm ci`、`npm run format:check`、`npm test`、`npm run check`、`npm run export:html`，并打开导出的 HTML 核对页面。改动发布器时，再用隔离查看器运行 `npm run publish:viewer`。不要把 `node_modules/`、`dist/` 或分享文件放回技能包。
