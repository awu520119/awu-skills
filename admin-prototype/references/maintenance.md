# 模板维护

默认模板为轻量列表；通过 `--examples` 可选的完整业务示例位于 `examples/business/`。订单示例来自小蜜蜂项目订单管理页，包含筛选、可折叠统计、状态页签、订单详情及飞行任务详情。实现位于 `src/features/order-management/`，入口为 `src/pages/OrderListPage.tsx`，独立数据位于 `src/mock/orders.ts`；媒体示例随包放在该功能的 `assets/` 中。修改时保持模板不依赖来源项目，并同步 `docs/订单列表PRD.md`。

`prototype-pages.json` 管页面元数据，`src/pages/registry.tsx` 绑定组件，`templates/admin/src/App.tsx` 自动生成路由，`src/layout/AdminShell.tsx` 管外壳；页面、Mock、共享组件分别在 `src/pages/`、`src/mock/`、`src/components/`。视觉参数集中在 `design/system.json`，由 `src/design/system.tsx` 映射为 Ant Design 主题与 CSS 变量。组件约定见[components.md](components.md)。表格操作复用 `TableActions`，固定右侧操作列并设置匹配的 `scroll.x`。新建项目由 `scripts/init-demo.sh` 复制模板并写入独立 `sourceId`。

模板默认设计使用用户已确认并保存在 `design/system.json` 的方案。参数类型与范围由 `design/schema.mjs` 校验，`npm run design:check` 可单独检查，构建也会自动执行。新增参数后同步更新配置、校验定义及主题或布局映射，在真实业务页面核对，并检查独立分享及隐藏侧栏的查看器发布效果。

业务迭代仅调整本次需求及必要依赖，无关既有问题只指出；业务页面持续在源项目维护。已有项目按其实际等效命令验证，不新增脚本迎合技能。

发布页面只在 `prototype-pages.json` 登记 ID、文档、Hash 路由和模式；文档放 `docs/`，允许子目录和多页面共用同一 PRD；发布复制时去重，仍拒绝越界路径及越界符号链接。`scripts/build-html.mjs` 是独立导出和查看器发布共用的离线资源内联器；改动时检查资源缺失、外链和分包的失败行为。发布器只调用目标查看器项目内的公开脚本，不读取 `prototype-viewer` 技能目录。发布源位于 `.published/<source-id>/`；同步还更新 `nav.json`、`nav.js` 和说明 HTML，不改手动源文件。

基础模板默认登记示例列表；完整示例登记主题和订单两个列表入口。需要独立抽屉评审时，先增加复用真实组件的路由，再登记为 drawer；已有项目可沿用自己的评审路由。页面可配置 `ready: { "selector": "[data-review=detail]", "text": "订单详情" }`，其中 `text` 可选。就绪检查通过只证明入口能渲染，不证明业务闭环或查看器中说明对应正确。当前任务或持续有效的发布授权可沿用已确认目标；路径配置本身不构成授权。

模板修改后，从仓库根目录运行 `node --test admin-prototype/tests/*.test.mjs`；再在**隔离生成的项目**中运行 `npm ci --include=dev`、`npm run format:check`、`npm run export:html`（已含类型检查和构建），并打开导出的 HTML 核对页面。改动发布器时，再用隔离查看器运行 `npm run publish:viewer`。不要把 `node_modules/`、`dist/` 或分享文件放回技能包。


## 旧项目升级

新生成项目用 `.admin-prototype.json` 标记 `toolkitVersion: 5`；查看器标记也必须为工具版本 5，内容结构仍为 `schemaVersion: 1`。缺少工具版本或版本不同的项目，不直接运行新发布器。

1. 在原项目创建提交或备份，另外初始化隔离的新模板作为对照。
2. 对比合并 `scripts/`、锁文件修复及 `package.json` 的命令改动；保留原项目依赖、业务源码、PRD、`sourceId` 和查看器路径，不整包覆盖。
3. 新发布器使用目标查看器公开的 `package_docs.py` 打包 PRD 及引用图片，并调用 `receive_publication.py` 提交发布包；先按查看器维护说明升级，再在其虚拟环境安装依赖并运行 `doctor.py --browser`。
4. 运行原项目等效检查，在隔离查看器验证发布与离线文件；通过后再将项目工具标记更新为 5。业务项目升级和实际发布按用户授权范围执行。

本次设计配置升级为 version 2：新增 navigation.darkBackground、darkSubmenu、darkItemText、darkText、darkMuted，将原有深色导航值显式保存；旧项目合并这些默认字段后再更新 version。设计格式与发布工具版本分别管理。为旧项目接入时，按用户选择使用已确认方案或从原主题提取现有值，合并参数校验、主题映射及必要组件，再逐个让已有组件读取参数。保留原路由、业务逻辑和依赖版本。

发布图片支持 Markdown 直接/引用式图片及 HTML img，相对路径以 PRD 所在目录解析，仅允许读取 `docs/` 内的图片；包内保留相对目录结构，缺失资源在替换原发布前失败。

评审导出统一使用 `--review=<页面 ID>`，文件名为 `review-<页面 ID>.html`；旧 themes/orders 别名不再保留。基础模板与 `--examples` 生成项目都应构建验证。
