# 公共组件与扩展

| 能力 | 实现入口 | 约定 |
| --- | --- | --- |
| 后台外壳 | `src/layout/AdminShell.tsx` | 布局读取配置，业务路由在 App.tsx 维护 |
| 紧凑查询 | `src/components/ui/CompactSearch.tsx` | 点击或 Enter 共用回调，查询后业务负责回到首页 |
| 筛选/列表卡 | `src/components/ui/PageCard.tsx` | 只管理容器与视觉，不接管查询或数据 |
| 表格滚动 | `src/components/ui/useTableScroll.ts` | 按可用高度测量表体，页面滚动模式不设置纵向限高 |
| 表单/详情抽屉 | `src/components/ui/DesignDrawer.tsx` | 共享边距、宽度、标题及底栏样式，内容与操作由业务提供 |
| 表格操作 | `src/components/TableActions.tsx` | 业务提供操作及确认信息，组件处理更多菜单和执行 |

Ant Design 基础组件可直接使用，不为每个组件增加一层无用途的包装。新增、编辑及详情共用现有业务组件，外观参数由设计配置统一提供。

新增组件规范时：

1. 在本表登记实际入口，并补必要的使用条件、状态及交互规则。
2. 若需要公共参数，在 `design/system.json` 添加默认值，在 `design/schema.mjs` 登记字段类型及合法范围。
3. 在 `src/design/system.tsx` 映射主题或 CSS 变量；组件读取配置或变量。已有全局参数默认继承，组件特有参数需命名明确。
4. 在实际页面核对正常、禁用、错误、空数据或长文本中适用的状态，确认独立分享和查看器嵌入效果一致。

“增加步骤条规范”应优先配置 Ant Design Steps；只有形成固定组合和交互时才封装。字段格式版本改变时显式升级与迁移，旧配置不静默忽略未知参数。
