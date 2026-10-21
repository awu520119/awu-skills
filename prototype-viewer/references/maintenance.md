# 原型查看器维护约定

手动内容由 `nav.manual.json`、`pages/`、`desc/*.md` 管理；发布内容只在 `.published/<sourceId>/`。`scripts/sync_project.py` 负责合并并写入 `nav.json`、`nav.js` 和说明 HTML。`scripts/page_ops.py` 是导航节点校验、路径约束和失败恢复的共同入口；增加目录字段或修改页面操作时先改这里，再检查 `add_page.py`、`rename_page.py`、`remove_page.py`、`validate.py` 和发布同步。不要让页面操作直接修改合并后的导航或其他发布源。

说明页的 DOM 与样式在 `templates/description.html`，Markdown、图片和 Mermaid 渲染在 `scripts/build_desc.py`。保留模板中 `@@...@@` 占位符和对应 Python 值；新增占位符时一起更新，避免导出不完整页面。普通手动页模板放 `templates/pc/`，新模板接入 `add_page.py` 的模板列表。页面离线资源内联位于 `scripts/offline_html.py`，查看器整体单文件打包在 `scripts/export_single_file.py`。新增资源种类时先加缺失、越界与离线导出测试。

查看器本体的布局和导航在 `index.html`、`assets/viewer.css`、`assets/viewer.js`；内置 React 示例在 `react-app/`，它的构建产物由 `react-app/scripts/inline-build.mjs` 生成。初始化脚本复制源码和包内静态资源，不带入旧的构建、分享或发布结果。新查看器首次运行时同步手动目录；只有需要内置 React 示例时才安装并构建 `react-app`。

修改后在技能目录运行：

```bash
python3 -m unittest discover -s tests -v
python3 scripts/sync_project.py .
python3 scripts/validate.py . --strict
python3 scripts/export_single_file.py . --force
```

还应在新初始化的临时查看器里检查手动页新增、改名、移动、删除和失败恢复；需要发布 React 原型时，按 `SKILL.md` 安装声明的浏览器检查依赖并用隔离项目验证发布。`requirements.txt` 只承担 Markdown 渲染；基础脚本使用 Python 标准库。
