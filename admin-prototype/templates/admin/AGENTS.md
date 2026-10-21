# 后台 Demo 项目约定

React + TypeScript + Vite + Ant Design；使用 Hash 路由和本地 Mock，可构建为静态文件。

- 开发前读取实际路由、`src/pages/`、`src/mock/` 和 `src/theme.ts`，以代码现状为准。
- 视觉基线：黑色业务侧栏 220/80px、顶栏 58px、主体边距 20px、卡内 16px、正文 14/22、控件高 32px；金额右对齐、长表格内部滚动、抽屉固定头尾与独立滚动正文。
- 页面放在 `src/pages/`，Mock 放在 `src/mock/`，稳定设计值放在 `src/theme.ts`。
- 不连接真实后端，不增加演示无关的依赖和功能。
- 完成后运行 `npm test`、`npm run format:check`、`npm run check` 和 `npm run build`，并核对 1440 与 1920 视口；需要单文件分享时运行 `npm run export:html`，输出 `dist/admin-share.html`。
- 更新下方进度；发布或导出时保留页面自身的黑色业务导航。
- 配套查看器发布以 `prototype-pages.json` 为唯一清单：页面、PRD、Hash 路由和目录信息只在此维护；执行 `npm run publish:viewer` 将内容发布到目标查看器的受控 `.published/` 目录。
- 扩展业务页面时在 `src/pages/` 添加页面、在 `src/App.tsx` 注册路由；需发布的页面同时更新 `prototype-pages.json` 与相应 `docs/`。导出、发布共用 `scripts/build-html.mjs`，不要分别复制内联逻辑。

## 当前进度

- 已提供黑色可折叠业务导航、主题管理列表、标签管理、主题详情与分步新增编辑抽屉，以及订单查询、详情和取消确认。
- 主题筛选、分页、上下架、封面选择、航线联动、分步校验、发布与本地草稿恢复均可交互。
