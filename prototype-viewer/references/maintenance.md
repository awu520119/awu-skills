# 查看器维护

`nav.manual.json`、`pages/` 和 `desc/*.md` 属于手动内容；`.published/<source-id>/` 属于外部发布源。`scripts/sync_project.py` 合并并生成导航与说明，`scripts/page_ops.py` 管校验和失败恢复。说明渲染在 `scripts/build_desc.py`，离线资源内联在 `scripts/offline_html.py` 与 `export_single_file.py`；前端外壳是 `index.html`、`assets/viewer.css`、`assets/viewer.js`。

模板在 `templates/pc/` 和 `templates/description.html`，本地资源在 `assets/`；内置 React 示例源码在 `react-app/`，依赖由其锁文件安装。初始化脚本只复制源码与静态资源，不带入 `node_modules/`、`dist/`、缓存或旧发布结果。修改模板或路径格式时，同步检查页面操作、严格校验与离线导出。

回归：在技能目录运行 `python3 -m unittest discover -s tests -v`；再初始化**隔离查看器**，运行 `python3 scripts/sync_project.py .`、`python3 scripts/validate.py . --strict`。要验证默认示例的离线导出，先在隔离查看器的 `react-app/` 中运行 `npm ci && npm run build`，再导出。验证发布时使用隔离原型项目，不写入技能目录。
