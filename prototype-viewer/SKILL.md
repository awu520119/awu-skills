---
name: prototype-viewer
description: 创建和维护独立运行的三栏原型查看器，管理手动 HTML/Markdown、接收后台原型发布，并导出离线单文件。
---

# 原型查看器

左侧目录、中间原型、右侧说明。业务原型由 `admin-prototype` 或其他源项目创建并发布；查看器负责展示和内容维护，不另建业务应用。外壳使用预构建的 React 静态资源，日常使用无需 Node、CDN 或源项目。手动内容保留在 `pages/`、`desc/`。

## 首次使用

支持 macOS / Linux 的 Bash 环境，Windows 使用 WSL；需要 Python 3.10+。默认创建空查看器：

```bash
bash <skill目录>/scripts/init-viewer.sh my-viewer
cd my-viewer
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/doctor.py
.venv/bin/python scripts/add_page.py . --id first-page --title 首页
bash update.sh
```

编辑 `pages/first-page.html` 和 `desc/first-page.md` 后运行 `bash update.sh`：一次完成目录合并、说明渲染、严格校验和离线分享更新。脚本自动选择项目 `.venv`，可从任意工作目录调用；完成后刷新已打开的查看器。得到可直接打开的 `share/prototype-viewer.html`。下文 `python3` 均在激活 `.venv` 后执行，或替换为 `.venv/bin/python`。

## 内容维护与发布

- 手动源文件为 `nav.manual.json`、`pages/`、`desc/*.md`；页面说明可省略。已有页面直接编辑后运行 `update.sh`；新增文件需先登记 `nav.manual.json`，或用下述新增脚本生成并登记，不自动猜测目录分组。`add_page.py` 只生成最小 HTML 和 Markdown，不附带业务 UI 框架。改名、删除使用对应脚本，先用 `--dry-run` 查看计划。
- `python3 scripts/sync_project.py .` 合并手动内容与 `.published/<source-id>/`，生成 `nav.json`、`nav.js` 和说明 HTML；生成物不手改；`.generated-desc.json` 记录归属，同步只清理登记过的失效说明 HTML。导出会自动同步。
- 发布项目负责构建发布包，由 `receive_publication.py` 接收；查看器在同一项目锁内替换 `.published/<source-id>/`、同步和失败回滚。手动更新、增删改与发布共用该锁。节点 ID、HTML 路径冲突会报错，多页面可共用同一 Markdown。
- 发布校验默认优先使用已安装的 Google Chrome，无需下载 Playwright 浏览器；用 `python3 scripts/doctor.py --browser` 检查。没有 Chrome 时，可设置 `PROTOTYPE_BROWSER_CHANNEL=chromium`，再在虚拟环境执行 `python3 -m playwright install chromium`。
- 图片限于手动说明的 `desc/`、`assets/` 或当前发布源的 `desc/`；缺图、越界资源与不支持的模块依赖明确报错。分享失败保留旧文件。
- 手动 HTML 可引入 `assets/viewer-bridge.js`，通过 `gotoNode(id, fallback)` 跳转；`<meta name="device" content="mobile">` 可启用手机预览。改名更新已识别引用，动态引用按报告人工复核。

交付分别说明实际完成的页面打开、业务闭环和目录/原型/说明对应检查；明确未执行项。外壳维护、工具升级见[维护约定](references/maintenance.md)。
