---
name: prototype-viewer
description: 创建和维护三栏原型查看器，合并手动 HTML/Markdown 页面与 React Demo 发布页，并导出离线查看文件。
---

# 原型查看器

左侧目录、中间原型、右侧说明。新建时运行 `bash <skill目录>/scripts/init-viewer.sh <destination>`。本技能的目录、模板、示例和本地资源均包含在技能目录内，无需读取其他技能或历史项目；已有业务页沿用其自身设计。手动页直接使用内置模板，资源路径按生成后的 `pages/` 位置解析。

## 环境与初始化

基础工具为 Bash、Python 3；同步说明需要 Python Markdown，首次在查看器根目录运行 `python3 -m pip install -r requirements.txt`。Node.js 与 npm 仅用于构建内置 React 示例；按 `react-app/package.json` 安装依赖并运行 `npm run build`。不依赖全局 npm 包或个人机器上的构建产物。

Mermaid 图的 SVG 转换可选使用 `mmdc`；缺少时保留可读源码，不阻断普通文档。浏览器检查是可选发布流程的要求，普通手动页同步无需浏览器。

## 内容归属

- 手动内容：`pages/<id>.html`、`desc/<id>.md`，目录只改 `nav.manual.json`。
- React 原型项目发布内容：`.published/<source-id>/`，在原型项目运行 `npm run publish:viewer`；不要在查看器内复制或编辑这些文件。
- 生成物：`nav.json`、`nav.js`、`desc/<id>.html`；不要手改。同步时合并两类内容，ID 和内容路径冲突必须报错。

## 手动页面

直接编辑上述三个手动文件后，在查看器根目录运行 `python3 scripts/sync_project.py .`；该命令生成目录与说明并严格校验。只改页面或 Markdown 内容时也用同一命令。

需要辅助命令时可用 `scripts/add_page.py`、`rename_page.py`、`remove_page.py`；它们只处理手动目录和 `pages/`、`desc/`，不能修改发布页。删除前先用 `--dry-run` 查看目标。

## 离线分享

同步后运行 `python3 scripts/export_single_file.py . --force`，生成 `share/prototype-viewer.html`。仅引用 React 示例的手动页才需要先构建 `react-app/`；导出脚本会自动内联自定义页的本地样式、脚本与图片，并对缺失或外部资源报错。

发布 React 原型前在查看器根目录运行 `python3 -m pip install -r requirements-browser.txt` 和 `python3 -m playwright install chromium`；之后只需运行原型项目的发布命令。查看器导航负责评审目录，不替代或隐藏业务页自身的业务侧栏。

维护脚本与扩展新页面时参照[维护约定](references/maintenance.md)，修改后运行其中的回归命令。
