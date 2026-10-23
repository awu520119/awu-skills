---
name: admin-prototype
description: 创建或迭代 React、Ant Design、本地 Mock 的桌面后台原型，导出离线 HTML；按需发布到已配置的原型查看器。
---

# 后台原型

创建新项目时使用内置模板；迭代现有项目时先读目标功能的 `AGENTS.md`、`README.md`、页面及直接依赖，沿用其目录、组件和设计稿。视觉决策参照[设计规范](references/admin-demo.md)，其中列表筛选查询统一使用紧凑搜索组件规范、列宽按内容密度分配，表单抽屉统一使用一致的字段间距和吸底操作栏规范。默认是黑色业务导航、浅灰工作区和白色内容卡。

## 创建与交付

初始化模板内置订单列表示例（筛选、可折叠统计、状态页签、分页、订单详情与飞行任务详情），使用独立本地 Mock 和随包媒体资源。

- 新建：`bash <skill目录>/scripts/init-demo.sh <project-name> [--no-install]`。默认输出到当前目录的 `admin-demo-code/`；可用 `ADMIN_PROTOTYPE_ROOT` 指定根目录。依赖由模板 `package-lock.json` 声明，安装后运行 `npm run check`、`npm run build`。
- 迭代：遵循目标项目的路由、Mock 和文件组织，不重新套模板或连接真实后端。新模板使用 `src/pages/`、`src/mock/`；已有功能目录继续用自己的 `pages/`、`components/`、`mock/`。
- 按[验收清单](references/ui-checklist.md)核对实际页面与交互。新模板运行 `npm run format:check`、`npm test`、`npm run check`、`npm run build`；已有项目按其可用命令验证，至少运行 `npm run check`，页面改动再构建。
- 新模板运行 `npm run export:html` 生成 `dist/admin-share.html`；已有项目使用自己的分享命令。离线文件不依赖查看器。

## 可选：发布到查看器

只有用户要求发布时，才在初始化时传 `--viewer <查看器路径>`，或在 `prototype-pages.json` 配置 `viewer.projectPath`，然后运行 `npm run publish:viewer`。发布器只依赖目标查看器项目的公开文件格式和脚本，不读取另一技能目录；未配置查看器时，新建、构建和离线导出照常运行。

`prototype-pages.json` 是页面 ID、说明文档、Hash 路由和 `screen` / `drawer` 模式的唯一清单。`screen` 保留完整业务页；本模板的 `drawer` 必须登记 `#/demo/export/*` 路由并复用真实 Ant Design Drawer。发布只写目标查看器的 `.published/<source-id>/`，不改其手动页面。修改模板或发布脚本时参照[维护约定](references/maintenance.md)。
