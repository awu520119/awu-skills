---
name: figma-ant-design-admin
description: 使用 React、Ant Design 和 Mock 数据创建或迭代“形影随拍后台”风格的桌面端 Demo。适用于后台列表、表单、详情、抽屉、弹窗和管理流程原型；不适用于 Vue、Element Plus、移动端或官网页面。
---

# Figma Ant Design 后台 Demo

用于快速创建和迭代可运行的桌面端后台 Demo。默认纯前端、使用 Mock 数据，不连接真实后端。

## 关键路径

- Demo 项目：`<项目根>/admin-demo-code/<project-name>/`
- 后台规范：`specs/admin-demo.md`
- React + Ant Design 模板：`templates/admin/`
- 自检、初始化和构建脚本：`scripts/`

项目根默认为当前工作目录，可通过任务专用环境变量 `FIGMA_ADMIN_ROOT` 指定。项目名必须使用 kebab-case。

## 工作流

### 1. 自检

先运行：

```bash
bash <skill目录>/scripts/list-demos.sh
```

- `STATE=NO_DEMO_CODE` 或 `STATE=EMPTY_DEMO_CODE`：当前没有可用 Demo，可初始化新项目。
- `STATE=HAS_PROJECTS`：先检查目标项目的 `AGENTS.md` 和 `src/`，再继续迭代。

用户已经明确要求新建 Demo 时，可直接初始化，无需等待选择。

### 2. 初始化

先读 `specs/admin-demo.md`，再运行：

```bash
bash <skill目录>/scripts/init-demo.sh <project-name>
```

脚本把 `templates/admin/` 复制到 `admin-demo-code/<project-name>/`，排除 `node_modules` 和 `dist`，随后安装依赖。只需要复制模板时追加 `--no-install`。

### 3. 开发迭代

1. 读取目标项目的 `AGENTS.md` 和实际代码，不能只依据历史说明。
2. 若任务目录提供完整页面截图、Figma CSS 或组件状态图，先逐张检查并按 `specs/admin-demo.md` 的优先级提取布局依据。
3. 按 `specs/admin-demo.md` 实现需求。
4. 使用真实 Ant Design 组件完成可交互 Demo；不把 Figma 绝对坐标直接复制为页面布局。
5. 运行项目的 `npm run check` 和 `npm run build`；需要视觉核对时启动 `npm run dev`，使用与设计稿一致的视口截图比对。
6. 有实质进度后，更新目标项目 `AGENTS.md` 的“当前进度”。

### 4. 构建

```bash
bash <skill目录>/scripts/build-demo.sh <project-name>
```

构建产物位于 `admin-demo-code/<project-name>/dist/`。

## 约束

- 技术栈固定为 React + TypeScript + Vite + Ant Design。
- 默认纯前端和 Mock 数据；用户明确要求接入现有接口时，以目标项目约定为准。
- 优先修改已有 Demo；不要因为小改动重复初始化项目。
- 只实现需求与演示闭环需要的页面、状态和交互，不增加无关模块或重型依赖。
- 在已有业务仓库中工作时，遵循仓库结构，不强制复制本模板或创建 `admin-demo-code/`。
