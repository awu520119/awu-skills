# 查看器内置 React 示例

React + TypeScript + Vite + Ant Design，使用 Hash 路由和本地 Mock。此目录只是查看器默认手动页面的内部示例，与外部发布项目无关。

- 先读目标页面及其直接依赖；路由在 `src/App.tsx`，页面在 `src/pages/`，Mock 在 `src/mock/`，公共视觉在 `src/theme.ts` 和 `src/styles.css`。
- 不连接真实后端或增加演示无关功能。修改后运行 `npm run check`、`npm run build`。
- 构建命令生成可离线打开的 `dist/index.html`；生成物和 `node_modules/` 不放入技能包。
