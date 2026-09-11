---
name: prototype-viewer
description: 将 HTML 文件或 Vite 静态产物与可选 Markdown 说明发布到独立的三栏原型查看器。适用于初始化、更新、整理和预览原型集合；不负责开发 React 或其他业务页面。
---

# Prototype Viewer

把已完成的静态页面组织成可浏览的原型项目：左侧目录、中间页面预览、右侧说明文档。查看器零前端依赖，通过本地 HTTP 服务运行。

## 输入与产物

- 页面源可以是单个 `.html`，或包含 `index.html` 的静态目录/Vite `dist/`。
- 说明文档为可选 Markdown；未提供时保留空白说明区，不臆造内容。
- 默认项目目录为 `./prototype-viewer`，结构为 `index.html`、`nav.json`、`pages/<id>/` 和 `docs/<id>.md/.html`。

## 工作流

1. 确认页面源、可选说明文档和目标查看器目录。已有项目时直接更新，不重复初始化。
2. 发布页面：

   ```bash
   python3 <skill目录>/scripts/publish.py ./prototype-viewer \
     --init --source ./dist --doc ./page.md \
     --id order-list --title "订单列表"
   ```

   `id` 使用 kebab-case。同一 `id` 已存在时，只有用户明确要求更新才追加 `--replace`。
3. 页面需要分组时追加 `--parent <id> --parent-title <标题> --create-parent`。
4. 发布后启动预览：

   ```bash
   python3 <skill目录>/scripts/preview.py ./prototype-viewer --node order-list
   ```

   仅在用户明确要求打开浏览器时使用 `--open`。
5. 返回预览地址和生成文件位置。没有实际查看页面时，不声称完成视觉验收。

## 边界

- 只发布已构建的静态产物，不修改业务页面源码，也不触发其他页面开发 skill。
- 单个 HTML 依赖相对资源时，应传入包含资源的整个目录。
- Markdown 只做基础离线渲染；复杂图表或交互文档需由输入文件自行提供。
- 不覆盖已有节点或项目文件，除非用户明确授权更新。
