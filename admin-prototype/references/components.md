# 公共组件与扩展

| 能力 | 实现入口 | 约定 |
| --- | --- | --- |
| 后台外壳 | `src/layout/AdminShell.tsx` | 布局读取配置，路由由页面清单及 registry 自动生成 |
| 紧凑查询 | `src/components/ui/CompactSearch.tsx` | 点击或 Enter 共用回调，查询后业务负责回到首页 |
| 筛选/列表卡 | `src/components/ui/PageCard.tsx` | 只管理容器与视觉，不接管查询或数据 |
| 表格滚动 | `src/components/ui/useTableScroll.ts` | 按可用高度测量表体，页面滚动模式不设置纵向限高 |
| 列表分页 | `src/components/ui/useTablePagination.ts` | 传入筛选后总数；默认显示总数及容量切换，容量变化回首页，数据减少时限制有效页；筛选和重置调用 resetPage |
| 表单/详情抽屉 | `src/components/ui/DesignDrawer.tsx` | kind 选择表单/详情宽度，固定右侧且不超视口；styles 合并保留边界，业务不覆盖 size、placement 或 wrapper 宽度 |
| 表单布局 | `src/components/ui/DesignForm.tsx` | DesignForm 读取标签位置及字段间距；FormGrid 读取列数及列间距；长内容放在网格外，业务继续使用 Form.Item |
| 表格操作 | `src/components/TableActions.tsx` | 业务提供操作及确认信息，组件处理更多菜单和执行 |

Ant Design 基础组件可直接使用，不为每个组件增加一层无用途的包装。新增、编辑及详情共用现有业务组件，外观参数由设计配置统一提供。

公共规范包括主色、正文、标准控件、卡片、抽屉、表单布局和分页。已有配置字段必须使用对应值，不在 CSS/JSX 再写同义常量。品牌图形、媒体比例、业务列宽及独有状态图形可作为模块特例；新出现的通用排版参数先验证复用需要再进入配置。不可用业务样式覆盖公共组件的尺寸约束来掩盖布局问题。现有项目的特殊组件按本次范围适配，不要求整页重写。

新增组件规范时：

1. 在本表登记实际入口，并补必要的使用条件、状态及交互规则。
2. 若需要公共参数，在 `design/system.json` 添加默认值，在 `design/schema.mjs` 登记字段类型及合法范围。
3. 在 `src/design/system.tsx` 映射主题或 CSS 变量；组件读取配置或变量。已有全局参数默认继承，组件特有参数需命名明确。
4. 在实际页面核对正常、禁用、错误、空数据或长文本中适用的状态，确认独立分享和查看器嵌入效果一致。

“增加步骤条规范”应优先配置 Ant Design Steps；只有形成固定组合和交互时才封装。字段格式版本改变时显式升级与迁移，旧配置不静默忽略未知参数。
