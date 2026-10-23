---
name: prototype-viewer
description: 创建和维护三栏原型查看器，管理手动 HTML/Markdown 和外部原型项目发布页，并导出离线单文件。
---

# 原型查看器

左侧目录、中间原型、右侧说明。运行 `bash <skill目录>/scripts/init-viewer.sh <destination>` 新建项目；模板、脚本和离线静态资源都在本技能内，不读取其他技能或个人机器上的项目。初始化后在目标目录执行以下步骤。

## 手动内容

默认订单列表示例包含筛选、可折叠统计、状态页签、分页、订单详情与飞行任务详情；源码位于 `react-app/src/features/order-management/`，数据和媒体均随技能包提供。

- 运行 `python3 -m pip install -r requirements.txt` 安装 Markdown 渲染依赖。
- 编辑 `nav.manual.json`、`pages/<id>.html`、`desc/<id>.md`；需要起页时可使用 `scripts/add_page.py`，改名或删除使用对应脚本，删除前先运行 `--dry-run`。
- 运行 `python3 scripts/sync_project.py .` 合并目录并生成 `nav.json`、`nav.js`、`desc/<id>.html`。这些是生成物，不手改。

## 离线分享与可选发布

- 运行 `python3 scripts/export_single_file.py . --force`，得到 `share/prototype-viewer.html`。默认手动示例页引用技能内的 `react-app/`；浏览或导出这些示例页前，在该目录运行 `npm ci && npm run build`。仅使用纯 HTML 页面时无需构建 React 示例。
- 外部原型项目可按查看器的 `.published/<source-id>/` 格式发布；查看器本身不依赖该项目或其他技能目录。发布项目负责写入和浏览器检查，查看器运行 `sync_project.py` 合并；手动内容与发布内容的 ID、路径冲突会报错。
- 若使用需要浏览器检查的发布器，先在查看器安装 `requirements-browser.txt` 并运行 `python3 -m playwright install chromium`。查看器目录不会替换业务页自身的导航。

维护脚本时参照[维护约定](references/maintenance.md)。
