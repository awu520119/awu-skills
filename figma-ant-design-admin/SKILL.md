---
name: figma-ant-design-admin
description: 使用 React、Ant Design 和 Mock 数据创建或迭代“形影随拍后台”风格的桌面端 Demo。适用于后台列表、表单、详情和管理流程原型；不负责把静态产物发布到原型查看器。
---

# Figma Ant Design 后台 Demo

创建或迭代可运行的桌面后台 Demo。默认使用纯前端 Mock 数据，不连接真实后端。

## 资源

- 实现视觉和交互前，按需读取 [后台规范](references/admin-demo.md)。
- 新建独立 Demo 时使用 `templates/admin/` 和 `scripts/init-demo.sh`。
- Demo 默认位于 `<项目根>/admin-demo-code/<project-name>/`；可用 `FIGMA_ADMIN_ROOT` 指定项目根。

## 工作流

1. 先检查当前目录。已有 Demo 或业务仓库时，读取其 `AGENTS.md`、路由和实际代码，直接迭代，不复制模板。
2. 新建独立 Demo 时，读取后台规范并运行：

   ```bash
   bash <skill目录>/scripts/init-demo.sh <project-name>
   ```

   项目名使用 kebab-case；仅复制模板时追加 `--no-install`。
3. 有截图、Figma CSS 或组件状态图时，先提取信息层级、容器尺寸和交互状态，再实现页面。使用真实 Ant Design 组件，不照搬画布绝对坐标。
4. 只实现演示闭环需要的页面、状态和交互。完成后运行 `npm run check` 与 `npm run build`；需要视觉核对时按设计稿视口截图比对。
5. 迭代已有 Demo 后，简要更新其 `AGENTS.md` 当前进度。

## 边界

- 技术栈固定为 React、TypeScript、Vite 和 Ant Design。
- 用户明确要求接入已有接口时，遵循目标仓库的数据层与权限约定。
- 不增加无关页面、重型依赖、登录、权限、埋点或状态持久化。
- 在已有业务仓库中工作时遵循其目录结构，不强制创建 `admin-demo-code/`。
- 只负责页面开发与构建，不维护原型查看器的目录或说明文档。
