# 后台原型项目约定

React + TypeScript + Vite + Ant Design，Hash 路由和本地 Mock；不连接真实后端。

- 先读目标页面、路由和直接依赖。页面放 `src/pages/`，Mock 放 `src/mock/`，复用交互放 `src/components/`；公共设计值在 `src/theme.ts` 和 `src/styles.css`。
- 列表采用筛选卡与列表卡；查询框有主色搜索图标，主操作放列表工具行。只在有真实汇总数据时增加统计卡。
- 页面改动后运行 `npm run format:check`、`npm test`、`npm run check`、`npm run build`。分享运行 `npm run export:html`，输出 `dist/admin-share.html`。
- 可选查看器发布只读取 `prototype-pages.json`；配置 `viewer.projectPath` 后运行 `npm run publish:viewer`。页面、PRD 与 Hash 路由在该清单和 `docs/` 中同步维护。
