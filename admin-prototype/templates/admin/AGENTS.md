# 后台原型项目约定

React + TypeScript + Vite + Ant Design，Hash 路由和本地 Mock；不连接真实后端。

- 迭代仅修改本次需求及必要依赖；下述视觉规范用于新增部分，保持与现有页面协调，无关问题仅在交付说明中指出。
- 先读目标页面、路由和直接依赖。页面元数据维护 `prototype-pages.json`，组件绑定维护 `src/pages/registry.tsx`；路由、菜单与标题自动生成。页面放 `src/pages/`，Mock 放 `src/mock/`，公共外壳放 `src/layout/`，共享组件放 `src/components/ui/`。
- 公共视觉数值以 `design/system.json` 为准，通过 `src/design/system.tsx` 转成主题及 CSS 变量。复用现有查询、卡片、表格操作和抽屉；业务特殊样式保留在所属模块。
- 默认设计沿用初始化时复制的已确认方案。新增公共参数同步维护 `design/system.json`、`design/schema.mjs` 及主题/布局映射；组件特例留在业务模块。
- `npm run design:check` 校验配置，构建也会自动校验。修改主题或布局后在实际列表、表单及详情中核对受影响的状态。
- 此模板项目先运行 `npm run format:check`；模板维护测试位于技能仓库 `admin-prototype/tests/`，不属于业务项目。交付离线文件时运行 `npm run export:html`（已含类型检查与构建），输出 `dist/admin-share.html`。
- 已有项目使用自身等效的类型检查、测试和构建命令，不为了适配本技能改名脚本。
- 当前任务或持续有效的授权包含发布时，读取 `prototype-pages.json` 并沿用已确认的 `viewer.projectPath`，运行 `npm run publish:viewer`；仅有配置不代表授权。页面、PRD 与 Hash 路由同步维护，多个页面可共用 `docs/` 内同一份 PRD。发布源位于 `.published/<source-id>/`，同步还会更新导航与说明生成物，不改手动源文件。
- 交付分别说明页面打开、业务闭环和查看器对应检查的实际结果及未执行项。
