# 后台原型项目约定

React + TypeScript + Vite + Ant Design，Hash 路由和本地 Mock；不连接真实后端。

- 先读目标页面、路由和直接依赖。页面放 `src/pages/`，Mock 放 `src/mock/`，复用交互放 `src/components/`；公共设计值在 `src/theme.ts` 和 `src/styles.css`。
- 列表采用筛选卡与列表卡；查询框使用 280×32px、2px 圆角的紧凑搜索组件，右侧为 40px 主色搜索按钮和白色图标；主操作放列表工具行。只在有真实汇总数据时增加统计卡。
- 列宽按内容密度分配：短字段 80–120px、名称/标识 140–200px、长文本最多 320–420px 且截断后可查看全文；固定操作列按实际按钮数收紧，单项约 80px、两项约 120px、含更多菜单不超过 160px，并使 `scroll.x` 与列宽总和一致。
- 表单抽屉正文使用 16/24/24px（上/左右/下）内边距；字段项只保留底部 14px 间距并清零自身 padding，底部操作栏固定吸底，白底、顶部边线并带上方阴影。
- 页面改动后运行 `npm run format:check`、`npm test`、`npm run check`、`npm run build`。分享运行 `npm run export:html`，输出 `dist/admin-share.html`。
- 可选查看器发布只读取 `prototype-pages.json`；配置 `viewer.projectPath` 后运行 `npm run publish:viewer`。页面、PRD 与 Hash 路由在该清单和 `docs/` 中同步维护。
