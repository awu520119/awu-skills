# 模板维护与发布

仅在发布、修改技能模板/脚本或升级旧项目时读取对应部分；普通页面迭代按入口流程执行。

## 模板维护

默认模板为轻量列表，完整示例通过 `--examples` 从 `examples/business/` 复制。订单示例位于 `src/features/order-management/`，入口为 `src/pages/OrderListPage.tsx`，数据在 `src/mock/orders.ts`，媒体随功能打包。修改保持独立于来源项目，并同步对应 `docs/` 文档。

设计配置维护见[组件约定](components.md)。修改模板后，从仓库根目录运行 `node --test admin-prototype/tests/*.test.mjs`；再在隔离生成的基础项目和 `--examples` 项目中运行 `npm ci --include=dev`、`npm run format:check`、`npm run export:html`，按[浏览器验收](browser-check.md)检查场景及截图。改动浏览器运行器时运行 `<python> -B -m unittest discover -s admin-prototype/tests -p 'test_browser_check.py'`；改动发布器时用隔离查看器验证发布。依赖、构建产物和浏览器不放回技能包。

修改入口或组件选择规则后，按[生成任务评估](generation-evals.md)复测真实生成任务；模板回归不能证明模型多次调用都遵守了流程。

## 发布与评审

当前任务或持续有效授权包含发布时，沿用已确认目标；首次接入、更换目标或扩大范围且尚未授权时再确认。初始化可传 `--viewer <查看器路径>`，也可在 `prototype-pages.json` 配置 `viewer.projectPath`，然后运行 `npm run publish:viewer`（已含构建）。未配置查看器时，新建与离线导出仍可使用。

`prototype-pages.json` 登记页面 ID、标题、说明文档、Hash 路由及模式，`src/pages/registry.tsx` 绑定组件；菜单与路由自动生成。文档位于 `docs/`，允许子目录及多页共用一个 PRD。图片支持 Markdown 直接/引用式及 HTML img，相对路径以文档目录解析，仅允许读取 `docs/` 内资源；缺失、越界路径或越界符号链接在替换发布前失败。

发布隐藏 `.app-sider`，由查看器目录切换页面；独立运行及离线导出保留导航。其他侧栏选择器按项目实际布局调整。发布器只调用目标查看器的公开脚本，不读取另一技能目录；由 `receive_publication.py` 在项目锁内替换 `.published/<source-id>/`，同步 `nav.json`、`nav.js` 和说明 HTML，不改手动源文件，失败保留原发布结果。业务继续在源项目维护。

独立抽屉评审先增加复用真实组件的路由，再登记为 drawer。评审导出用 `--review=<页面 ID>`，文件名为 `review-<页面 ID>.html`。页面可配置 `ready: { "selector": "[data-review=detail]", "text": "订单详情" }`，text 可选；就绪只代表入口渲染，不代表业务验收。发布后核对嵌入布局、目录入口与说明对应。

`scripts/build-html.mjs` 为独立分享和发布共用的内联器，修改时检查资源缺失、外链和分包失败行为。

## 旧项目升级

项目标记 `.admin-prototype.json` 与查看器均要求 `toolkitVersion: 5`，查看器内容仍为 `schemaVersion: 1`。工具版本缺失或不同时不直接运行新发布器。

1. 在原项目创建提交或备份，另建隔离模板作为对照。
2. 按实际结构合并 scripts、锁文件及命令修复；保留业务、PRD、依赖、路由、sourceId 和查看器路径，不整包覆盖。
3. 新发布器调用查看器的 `package_docs.py` 和 `receive_publication.py`。先按查看器维护说明升级，在其虚拟环境安装依赖并运行 `doctor.py --browser`。
4. 运行原项目等效检查，在隔离查看器验证发布与离线文件，通过后才更新工具版本标记；实际发布仍按授权范围执行。

设计格式独立管理。version 2 新增 navigation.darkBackground、darkSubmenu、darkItemText、darkText、darkMuted；旧项目合并这些字段后更新设计版本。接入时按用户选择采用已确认方案或提取原主题值，合并校验、主题映射和必要组件，再让受影响组件读取参数。
