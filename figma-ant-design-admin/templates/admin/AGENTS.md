# 后台 Demo 项目约定

React + TypeScript + Vite + Ant Design；使用 Hash 路由和本地 Mock，可构建为静态文件。

- 开发前读取实际路由、`src/pages/`、`src/mock/` 和 `src/theme.ts`，以代码现状为准。
- 页面放在 `src/pages/`，Mock 放在 `src/mock/`，稳定设计值放在 `src/theme.ts`。
- 不连接真实后端，不增加演示无关的依赖和功能。
- 完成后运行 `npm run check` 和 `npm run build`，并更新下方进度。

## 当前进度

- 已提供订单查询、列表、详情抽屉和取消确认示例。
