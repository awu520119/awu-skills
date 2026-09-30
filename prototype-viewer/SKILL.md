---
name: prototype-viewer
description: 创建和维护三栏原型查看器，合并手动 HTML/Markdown 页面与 React Demo 发布页，并导出离线查看文件。
---

# 原型查看器

左侧目录、中间原型、右侧说明。新建时运行 `bash <skill目录>/scripts/init-viewer.sh <destination>`。业务页视觉遵循 `figma-ant-design-admin` 的后台规范；查看器自带示例不覆盖原型项目的设计稿。

## 内容归属

- 手动内容：`pages/<id>.html`、`desc/<id>.md`，目录只改 `nav.manual.json`。
- React 原型项目发布内容：`.published/<source-id>/`，在原型项目运行 `npm run publish:viewer`；不要在查看器内复制或编辑这些文件。
- 生成物：`nav.json`、`nav.js`、`desc/<id>.html`；不要手改。同步时合并两类内容，ID 和内容路径冲突必须报错。

## 手动页面

直接编辑上述三个手动文件后，在查看器根目录运行 `python3 scripts/sync_project.py .`；该命令生成目录与说明并严格校验。只改页面或 Markdown 内容时也用同一命令。

需要辅助命令时可用 `scripts/add_page.py`、`rename_page.py`、`remove_page.py`；它们只处理手动目录和 `pages/`、`desc/`，不能修改发布页。删除前先用 `--dry-run` 查看目标。

## 离线分享

同步后运行 `python3 scripts/export_single_file.py . --force`，生成 `share/prototype-viewer.html`。仅引用 React 示例的手动页才需要先构建 `react-app/`；自定义页引用额外本地资源时需先内联资源。

发布 React 原型前需有 Python Playwright 与 Chromium。首次安装：`python3 -m pip install playwright && python3 -m playwright install chromium`；之后仍只需运行原型项目的发布命令。
