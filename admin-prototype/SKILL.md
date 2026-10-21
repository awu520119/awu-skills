---
name: admin-prototype
description: 创建或迭代 React、Ant Design、本地 Mock 的桌面后台原型，使用统一黑色业务导航与视觉规范，导出离线 HTML；按需发布到用户配置的原型查看器。
---

# 后台原型

用于可静态构建的桌面后台页面。先读[后台设计规范](references/admin-demo.md)，按业务选择列表、详情页、详情抽屉或新增编辑抽屉。默认保留黑色业务导航侧栏；用户的设计稿和项目约定优先。

规范、模板与脚本均在本技能内。无需读取历史项目、外部截图或其他技能；用户提供资料是补充输入。技术工具依赖由模板 `package.json` 声明，不能将机器上已有的缓存当作可移植资源。

## 创建与迭代

- 新建独立项目：运行 `bash <skill目录>/scripts/init-demo.sh <project-name> [--no-install]`，项目名为 kebab-case。默认在当前目录的 `admin-demo-code/` 下生成，也可通过 `ADMIN_PROTOTYPE_ROOT` 设置生成根目录。
- 迭代已有项目：先读项目 `AGENTS.md`（若有）、路由、`src/pages/`、`src/mock/`、`src/theme.ts`，按现状修改，不重新套模板。
- 实现前确定页面模式、主要操作、筛选触发方式、表格密度及抽屉宽度；统一写入公共 Token 或样式，避免每页临时调参。
- 页面和 Mock 分别放 `src/pages/`、`src/mock/`；需要配套说明时放 `docs/`。只实现演示需要的交互，不连接真实后端。
- 完成后按[验收清单](references/ui-checklist.md)检查布局与操作，运行 `npm test`、`npm run format:check`、`npm run check` 和 `npm run build`；有项目进度约定时同步更新。截图核对实际视口，修复溢出、错位和错误提示遮挡。
- 单页分享运行 `npm run export:html`，输出 `dist/admin-share.html`；交付可直接打开的 HTML。该命令包含构建，不依赖查看器。

## 可选：发布到查看器

仅用户要求发布且目标为受控查看器时使用。已有查看器可在初始化时传 `--viewer <查看器路径>`，或在 `prototype-pages.json` 配置 `viewer.projectPath`；不要假定某个兄弟目录存在，也不要求预先安装其他 skill。

项目运行 `npm run publish:viewer`。页面 ID、标题、PRD、Hash 路由、分组、`screen` / `drawer` 模式只在 `prototype-pages.json` 登记。发布所需的 Python Markdown、Playwright 和 Chromium 由目标查看器声明。

- `screen` 保留完整业务页面和黑色导航；`drawer` 使用专用 `#/demo/export/*` 路由，以真实 Ant Design Drawer 默认展开并显示遮罩。
- 发布命令负责构建、离线资源与浏览器检查、同步和失败恢复。发布内容只进入查看器 `.published/<source-id>/`；手动 `pages/`、`desc/`、`nav.manual.json` 不属于原型项目。

增加页面或修改构建、发布脚本时参照[维护约定](references/maintenance.md)，页面清单与回归命令以该文件为准。
