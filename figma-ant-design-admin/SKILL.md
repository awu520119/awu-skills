---
name: figma-ant-design-admin
description: 使用 React、Ant Design 和 Mock 数据创建或迭代“形影随拍后台”风格的桌面端 Demo；可向配套 prototype-viewer 发布页面和 PRD。
---

# Figma Ant Design 后台 Demo

创建或迭代可运行的桌面后台 Demo。默认使用纯前端 Mock 数据，不连接真实后端。

## 资源

- 实现视觉和交互前，读取 [后台规范](references/admin-demo.md)；列表页必须遵循其中的筛选和固定列约定。
- 新建独立 Demo 时使用 `templates/admin/` 和 `scripts/init-demo.sh`。
- Demo 默认位于 `<项目根>/admin-demo-code/<project-name>/`；可用 `FIGMA_ADMIN_ROOT` 指定项目根。

## 工作流

1. 先检查当前目录。已有 Demo 或业务仓库时，读取其 `AGENTS.md`、路由和实际代码，直接迭代，不复制模板。
2. 新建独立 Demo 时，读取后台规范并运行：

   ```bash
   bash <skill目录>/scripts/init-demo.sh <project-name>
   ```

   项目名使用 kebab-case；仅复制模板时追加 `--no-install`。已有受控查看器时追加 `--viewer <查看器路径>`，初始化页面清单和发布目标。
3. 有截图、Figma CSS 或组件状态图时，先提取信息层级、容器尺寸和交互状态，再实现页面。使用真实 Ant Design 组件，不照搬画布绝对坐标。没有明确设计稿覆盖时，按规范的列表筛选与表格细节实现，不沿用 Ant Design 示例中常见的“查询”按钮式筛选。
4. 只实现演示闭环需要的页面、状态和交互。完成后运行 `npm run check` 与 `npm run build`；需要视觉核对时按设计稿视口截图比对。
5. 迭代已有 Demo 后，简要更新其 `AGENTS.md` 当前进度。

## 静态分享与评审

需要离线评审时，复用 Vite 构建产物，将引用的 CSS/JS 内联为完整项目单页；需要逐页评审时，以目标 Hash 注入生成独立 HTML。完整分享页保留全部 Hash 路由，独立页必须复用真实 React 页面或专用导出路由。导出前运行类型检查和构建，并确认单页可离线打开。

## PRD 查看器发布

当用户同时提供原型项目和配套原型查看器，并要求消除人工复制时，原型项目是其发布内容的唯一源头；查看器仍可拥有独立手动内容。

- 在原型项目维护 `prototype-pages.json`，统一声明 PRD 文件、Hash 路由、`screen` / `drawer` 模式，以及该发布源的页面 ID、标题、分组和排序；不要让这些信息分别手工维护。
- `screen` 用于完整业务页：导出时隐藏原型业务侧栏，保留必要的页面主体；`drawer` 必须落到专门的 `/demo/export/*` 路由，路由不渲染后台 Layout，并以真实 Ant Design Drawer 默认打开、右侧固定、遮罩开启的状态导出。不要通过导出后的 CSS 将 Drawer 摊平成普通卡片。
- 项目提供 `npm run publish:viewer`：先检查并构建，再将自包含页面、Markdown 和目录片段发布至查看器 `.published/<source-id>/`，最后触发查看器同步和校验。发布前必须确认查看器根目录存在 `.prototype-viewer.json`；只清理本发布源不再声明的说明产物。
- 发布后验证实际渲染：`screen` 无业务侧栏；`drawer` 无业务侧栏、Drawer 默认打开且遮罩可见。不得修改查看器手动维护的 `pages/`、`desc/` 或 `nav.manual.json`。

未提供配套查看器时，仍只负责项目内的离线分享和评审 HTML，不推断外部发布目录。

## 边界

- 技术栈固定为 React、TypeScript、Vite 和 Ant Design。
- 用户明确要求接入已有接口时，遵循目标仓库的数据层与权限约定。
- 不增加无关页面、重型依赖、登录、权限、埋点或状态持久化。
- 在已有业务仓库中工作时遵循其目录结构，不强制创建 `admin-demo-code/`。
- 默认负责页面开发、构建和项目内离线分享；仅在用户明确提供配套查看器并要求打通时，负责该查看器的受控发布链路。
