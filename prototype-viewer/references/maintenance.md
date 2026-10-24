# 查看器维护

查看器只管理手动 HTML、Markdown 和外部发布包，不包含业务 React 应用或 Vue / Element Plus 页面模板。`pages/`、`desc/` 默认为空；`shell/` 仅维护查看器 React 外壳，初始化时不复制到用户项目。

## 外壳与运行资源

React 外壳源码为 `shell/viewer.jsx`，使用本地 React/React DOM；`shell/package-lock.json` 固定维护构建依赖。维护者需要 Node 20.19+ 或 22.12+，在隔离目录复制 `shell/` 后执行 `npm ci --include=dev`、`npm run build`；将输出的 `assets/viewer.js` 放回技能。`assets/viewer.css` 管外壳样式，`index.html` 是静态入口。发布技能必须包含已构建的外壳；日常用户不安装 Node。

保留目录搜索、分组折叠、URL 节点定位及前进后退、三栏折叠与拖拽、大纲联动、跨页跳转和手机预览。`viewer-bridge.js` 只提供跳转及设备上报，不注入业务 UI API。消息只接受当前原型或说明 iframe 的来源。

## 内容与工具

- `update.sh` 是日常单命令入口：自动选择项目 `.venv`，调用现有导出器完成同步、校验和分享更新，不复制同步逻辑。只需同步、不更新分享时直接运行 `sync_project.py`。
- `nav.manual.json`、`pages/`、`desc/*.md` 是手动源；`.published/<source-id>/` 是外部发布源。`sync_project.py` 是唯一目录同步入口，`build_desc.py` 可单独按 `--id` 渲染说明。HTML 路径唯一，Markdown 可共享。
- 页面操作使用 `add_page.py`、`rename_page.py`、`remove_page.py`，共用校验、项目锁、事务恢复与引用更新；嵌套调用复用外层事务；删除计划包含后代文件及空分组清理。共享说明仍被引用时不删除或移动。
- `package_docs.py` 为发布项目打包 PRD 及图片；`receive_publication.py` 负责发布包接收与回滚，发布方不再直接维护查看器生成物；受控资源解析在 `resource_paths.py`。说明渲染在 `build_desc.py`，离线内联与导出在 `offline_html.py`、`export_single_file.py`。
- 导出只打包已同步的独立 HTML 与说明，无业务框架专用分支；缺资源或失败时保留旧分享文件。图片使用受控目录内的相对路径。

## 验证与升级

在技能目录运行 `python3 -m unittest discover -s tests -v` 和 `python3 tests/browser_workflows.py`（默认使用 Chrome；没有 Chrome 时设置 `PROTOTYPE_BROWSER_CHANNEL=chromium`）；初始化隔离查看器，验证首次新增页面、同步、严格校验和离线导出。修改外壳时用浏览器检查目录搜索、前进后退、折叠、拖拽、大纲、消息来源和跨页跳转；验证发布使用隔离后台项目，不写实际查看器。构建依赖、缓存和分享文件不放进技能包。

工具版本为 `toolkitVersion: 5`，内容结构保持 `schemaVersion: 1`。升级已生成项目时先提交或备份，初始化隔离新查看器作对照：

1. 保留 `nav.manual.json`、手动 `pages/`、`desc/*.md`、业务资源与 `.published/`；对比更新 `update.sh`、工具脚本、Python 依赖、说明模板和外壳入口/资源，不整包覆盖。
2. 旧内置业务示例需要保留时，先转换为独立 HTML；确认不再引用后再移除旧 `react-app/`、Vue / Element Plus 专用资源及示例导航。
3. 更新脚本后先运行 `python3 scripts/migrate_legacy.py .`，从原导航登记说明生成物，将旧 `.desc.js` 移入项目内备份目录。以后只维护 `.generated-desc.json` 记录的生成物；该清单随项目保留。同步入口统一为 `sync_project.py`，不再使用 `sync_nav.py`、`sync_desc.py`；新增页面不再接受业务模板参数。说明路径继续使用 `desc/`，无需迁移目录名。
4. 在项目 `.venv` 安装所需依赖，检查环境、严格校验、离线导出与浏览器行为，通过后将工具版本更新为 5。工具更新不自动修改业务内容或触发实际发布。

项目锁使用 macOS/Linux/WSL 的文件锁；进程退出自动释放，`.viewer.lock` 文件可以保留，不要在任务运行时删除。单独渲染说明同样使用锁。
