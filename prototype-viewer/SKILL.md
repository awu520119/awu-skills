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

## 开发流程

1. 修改 `react-app/src/` 中的页面、Mock 或主题。
2. 执行 `cd react-app && npm run check && npm run build`。
3. 构建脚本会把 JS/CSS 内联到 `react-app/dist/index.html`，并清理重复的 `dist/assets/`，保证 `file://` 离线打开且不重复打包。
4. 分享给团队时执行 `python3 scripts/export_single_file.py . --force`，生成 `share/prototype-viewer.html`；该文件内联查看器、React 原型和说明文档，可单独发送并离线双击打开。
5. 执行 `python3 scripts/validate.py .` 校验查看器目录、页面和文档。
6. 更新页面节点时，同步修改 `nav.json`、`nav.js`、`pages/` 与 `desc/`，再重新执行构建与导出。

## 边界

- 不增加登录、权限、埋点、真实接口或移动端示例。
- 不使用 Vue/Element Plus 编写业务示例页；Vue 只用于最外层查看器自身。
- 不修改查看器框架文件，除非需求明确涉及目录、面板或文档查看能力。
- 单文件导出只保证本 Skill 的 React 跳转页和自包含说明文档；自定义页面若引用额外本地资源，应先将资源内联后再导出。
