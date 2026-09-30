---
name: figma-ant-design-admin
description: 创建或迭代 React、Ant Design、本地 Mock 的形影随拍后台 Demo，并在明确配置查看器时发布原型与 PRD。
---

# 后台 Demo

用于可静态构建的桌面端原型。实现页面前读取[后台规范](references/admin-demo.md)；有设计稿时，以用户需求和设计稿为准。

## 创建与迭代

- 新建独立项目：运行 `bash <skill目录>/scripts/init-demo.sh <project-name> [--viewer <查看器路径>]`。项目名为 kebab-case；只复制模板时可加 `--no-install`。
- 迭代已有项目：先读项目 `AGENTS.md`、路由、`src/pages/`、`src/mock/`、`src/theme.ts`，按现状修改，不重新套模板。
- 将配套 PRD 放在项目 `docs/`，页面和 Mock 分别放在 `src/pages/`、`src/mock/`；只实现演示需要的交互，不连接真实后端。
- 完成后运行 `npm run build`（包含类型检查），并更新项目 `AGENTS.md` 进度。有设计稿时再做视口截图比对。

## 发布到查看器

项目与受控查看器已绑定且用户要求发布时，在原型项目运行 `npm run publish:viewer`。页面 ID、标题、PRD、Hash 路由、分组、`screen` / `drawer` 模式只在 `prototype-pages.json` 登记。

- `screen` 保留完整业务主体；`drawer` 使用专用 `#/demo/export/*` 路由，以真实 Ant Design Drawer 默认展开并显示遮罩。
- 发布命令负责构建、离线资源和浏览器渲染检查、同步与失败恢复。发布内容只进入查看器 `.published/<source-id>/`；查看器手动维护的 `pages/`、`desc/`、`nav.manual.json` 不属于本项目。
