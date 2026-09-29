---
name: prototype-viewer
description: 创建、维护和预览基于 React、Ant Design 与本地 Mock 数据的三栏桌面端原型查看器；适用于原型页面、目录、说明文档和离线产物的整理与校验。
---

# 形影随拍后台 · Ant Design 原型查看器

## 项目定位

这是一个可独立分发的桌面后台原型查看器：左侧目录、中间 React 原型、右侧说明文档。业务页面遵循 `figma-ant-design-admin` 规范，使用本地 Mock 数据，不连接真实接口。

- 离线入口：`index.html`
- 目录数据：`nav.json`，离线产物为 `nav.js`
- React 应用：`react-app/`
- 查看器入口页：`pages/*.html`
- 页面说明：`desc/*.md` 与 `desc/*.html`

页面可按两种来源维护：独立静态页仍采用“文件即页面”；配套 React 原型发布的 PRD 页面由原型项目自动生成并同步，查看器不再成为这些页面的人工维护源。

## PC 页面规范

- 技术栈固定为 React + TypeScript + Vite + Ant Design。
- 使用 `ConfigProvider` 统一 Token，中文语言使用 `zh_CN`。
- 页面不包含左侧业务导航栏，只保留 58px 顶栏与内容区。
- 主内容区左右及底部边距为 20px；白卡圆角 4px；控件高 32px。
- 表头和数据行高约 48px，表格底部左侧显示总数，分页位于右侧。
- 右抽屉按 `xiaomifeng-share.html` 基线使用 720px，头部 56px、底部约 56px、45% 黑色遮罩，主体独立滚动。
- 列表页使用“64px 筛选卡 + 12px 间距 + 满高列表卡”；列表工具栏为 56px。
- 二级详情使用“52px 返回区 + 蓝色摘要区 + 明细表格卡”的层级结构。
- 二级详情使用独立 Hash 路由，提供明确的返回列表入口。
- 查询、重置、标签筛选、分页、详情、取消确认、表单校验和提交反馈必须可交互。

## 当前示例

1. `admin-list`：订单列表。
2. `admin-form`：参照 `xiaomifeng-share.html` 的“新增推广方”右抽屉。
3. `admin-detail`：参照 `xiaomifeng-share.html` 的“线下对公结算详情”页面。

示例间跳转优先通过 `window.parent.postMessage({ type: 'gotoNode', id }, '*')` 联动查看器；单独打开 React 应用时回退到 Hash 路由。

## 与原型项目打通

当查看器有明确配套的 React 原型项目时，以原型项目的页面清单为唯一配置源。清单应同时定义 PRD 文件、Hash 路由、展示模式（`screen` / `drawer`）和查看器目录元数据。

- `screen`：查看器加载无业务侧栏的完整页面；
- `drawer`：查看器加载专用 `/demo/export/*` 路由导出的真实右抽屉，Drawer 默认打开且背景遮罩可见；不得在查看器侧注入 CSS 改造页面状态；
- 原型项目提供单一发布命令，完成构建、PRD HTML 导出、`pages/` / `desc/` 同步、`nav.json` / `nav.js` / `desc/*.html` 生成与校验；
- 页面重命名或删除时，只允许发布脚本根据自身上次的发布记录清理已管理的旧文件，不能删除独立页面或查看器框架资源。

发布后的 `pages/`、`desc/`、目录数据属于构建产物，不手动修改；需要改页面、PRD、分组或排序时回到原型项目页面清单。

## 开发流程

1. 若页面由配套原型项目管理，在原型项目执行其发布命令；不要手动复制 HTML 或 Markdown。
2. 仅独立静态页面直接放入 `pages/`，对应说明放入 `desc/`，再执行 `python3 scripts/sync_project.py .`。
3. 执行 `cd react-app && npm run check && npm run build`。
4. 构建脚本会把 JS/CSS 内联到 `react-app/dist/index.html`，并清理重复的 `dist/assets/`，保证 `file://` 离线打开且不重复打包。
5. 分享给团队时执行 `python3 scripts/export_single_file.py . --force`，生成 `share/prototype-viewer.html`；该文件内联查看器、React 原型和说明文档，可单独发送并离线双击打开。
6. 需要发送精简项目目录时执行 `python3 scripts/export_release.py .`。

## 边界

- 不增加登录、权限、埋点、真实接口或移动端示例。
- 不使用 Vue 或 Element Plus 编写业务示例页；Vue 只用于最外层查看器自身。
- 不修改查看器框架文件，除非需求明确涉及目录、面板或文档查看能力。
- 单文件导出只保证本 Skill 的 React 跳转页和自包含说明文档；自定义页面若引用额外本地资源，应先将资源内联后再导出。
