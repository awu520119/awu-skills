# 后台原型项目约定

React + TypeScript + Vite + Ant Design，Hash 路由、本地 Mock，不连接真实后端。

- 先读目标页面及直接依赖，只改本次需求及必要依赖。普通迭代沿用项目设计；明确要求迁移规范时对指定范围应用目标设计。
- 页面在 `src/pages/`，数据在 `src/mock/`，外壳在 `src/layout/`，公共组件在 `src/components/`。`prototype-pages.json` 管元数据，`src/pages/registry.tsx` 绑定组件，路由和菜单自动生成。
- 公共视觉参数来自 `design/system.json`，由 `src/design/system.tsx` 映射主题与 CSS 变量。新增参数同步 schema 和实际映射。复用查询、卡片、表格操作、`useTablePagination`、`DesignForm`/`FormGrid` 和 `DesignDrawer`，不覆盖抽屉宽度及视口边界。
- 修改页面时同步相关 `ui-checks.json` 操作及结果断言。运行 `npm run format:check`、`npm run export:html`，得到 `dist/admin-share.html`；导出含配置校验、类型检查和构建。
- 构建不代替页面验收：在双视口检查布局、截图和本次业务闭环。使用 admin-prototype 共享工具时读取其 `references/browser-check.md`，也可使用等效检查。交付只报告已执行结果，浏览器不可用时标记“视觉与交互验收未完成”。
- 发布需有当前或持续有效的授权，沿用已确认的 `viewer.projectPath`，运行 `npm run publish:viewer`，核对查看器页面与说明。路径配置本身不代表授权；业务继续在源项目修改。
