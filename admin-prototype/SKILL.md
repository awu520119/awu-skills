---
name: admin-prototype
description: 按已确认的设计规范创建或迭代 React、Ant Design、本地 Mock 的桌面后台原型，导出离线 HTML；按需发布到已配置的原型查看器。
---

# 后台原型

创建新项目使用内置模板及[设计规范](references/admin-demo.md)，默认采用用户已确认的 `templates/admin/design/system.json`，颜色、字体、布局和组件参数均从该文件读取。迭代先读目标功能的 `AGENTS.md`、`README.md`、页面和直接依赖，沿用其目录、组件及设计稿，只修改本次需求和必要依赖。新增部分与现有页面协调，既有无关问题在交付说明中指出。

## 首次使用

支持 macOS / Linux 的 Bash 环境；Windows 使用 WSL。需要 Node 20.19+ 或 22.12+（不支持 21.x）及 npm。纯后台离线原型无需 Python 或查看器。

```bash
bash <skill目录>/scripts/init-demo.sh my-admin
cd admin-demo-code/my-admin
npm run format:check
npm run export:html
```

得到 `dist/admin-share.html`，可直接打开。开发预览使用 `npm run dev`。默认安装显式包含开发依赖；无需运行 `npm install` 重新解析锁文件。旧项目升级见[维护约定](references/maintenance.md#旧项目升级)。

## 创建与交付

默认初始化轻量列表及本地 Mock。需要主题、订单与飞行任务完整示例时加 `--examples`；示例位于 `examples/business/`，只在选择时复制。

- 新建：`bash <skill目录>/scripts/init-demo.sh <project-name> [--examples] [--no-install]`。默认输出到当前目录的 `admin-demo-code/`；可用 `ADMIN_PROTOTYPE_ROOT` 指定根目录。依赖由模板 `package-lock.json` 声明，初始化会先检查 Node/npm；安装失败保留源码并给出原目录重试命令。
- 迭代：遵循目标项目的路由、Mock 和文件组织，不重新套模板或连接真实后端。新模板使用 `src/pages/`、`src/mock/`；已有功能目录继续用自己的 `pages/`、`components/`、`mock/`。
- 按[验收清单](references/ui-checklist.md)核对实际页面与交互。新模板运行 `npm run format:check`；模板维护测试从技能仓库根目录运行 `node --test admin-prototype/tests/*.test.mjs`。交付离线文件使用下述导出命令（已含类型检查与构建），发布命令也包含构建，不重复运行同一检查；已有项目先识别其类型检查、测试和构建命令，运行与本次改动相关的等效检查；不为符合本技能新增或改名脚本。
- 新模板运行 `npm run export:html` 生成 `dist/admin-share.html`；已有项目使用自己的分享命令。离线文件不依赖查看器。

## 维护设计规范

公共设计参数维护在 `design/system.json`，由 `src/design/system.tsx` 映射为 Ant Design 主题及 CSS 变量；修改后用 `npm run design:check` 校验，业务构建也会自动校验。以后调整默认风格时更新技能模板配置；初始化会完整复制该配置到新项目。

参数范围和结构由 `design/schema.mjs` 校验，数值不在 Markdown 重复维护。新增参数同步更新配置、校验定义及实际使用处；组件使用规则见[组件约定](references/components.md)。旧项目按实际结构合并设计配置和必要样式，不整包覆盖。

## 可选：发布到查看器

当前任务或此前持续有效的授权包含发布时，沿用已确认目标；仅配置路径不等于授权。首次接入、更换目标或扩大发布范围且尚未获授权时再确认。在初始化时传 `--viewer <查看器路径>`，或在 `prototype-pages.json` 配置 `viewer.projectPath`，然后运行 `npm run publish:viewer`。发布器只依赖目标查看器项目的公开文件格式和脚本，不读取另一技能目录；未配置查看器时，新建、构建和离线导出照常运行。

`prototype-pages.json` 统一登记页面 ID、标题、说明、Hash 路由和评审模式；`src/pages/registry.tsx` 只绑定页面组件，路由和菜单自动从清单生成；支持多页面共用 PRD。文档路径、模式及可选 `ready` 就绪检查的格式见[维护约定](references/maintenance.md)。发布页面隐藏模板的左侧业务导航（`.app-sider`），由查看器目录切换页面；独立运行及离线导出保留业务导航。已有项目使用其他侧栏选择器时，按其实际布局调整发布样式。后台提交临时发布包，由查看器 `receive_publication.py` 在项目锁内替换 `.published/<source-id>/`、同步更新 `nav.json`、`nav.js` 和 `desc/*.html`，不改手动源文件。交付分别报告页面打开检查、本次业务操作闭环，以及发布后查看器页面与说明对应检查；未执行项明确列出，渲染成功不等于业务验收通过。已有业务原型继续在源项目修改，查看器不另造一份实现。修改模板或发布脚本时参照[维护约定](references/maintenance.md)。
