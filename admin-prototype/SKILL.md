---
name: admin-prototype
description: 按已确认的设计规范创建或迭代 React、Ant Design、本地 Mock 的桌面后台原型，导出离线 HTML；按需发布到已配置的原型查看器。
---

# 后台原型

使用 React、TypeScript、Ant Design、Hash 路由和本地 Mock，不连接真实后端。只修改本次需求及必要依赖。

## 确定基准与实现

- 新建采用内置模板及 `design/system.json`；普通迭代先读目标项目的 `AGENTS.md`、相关说明、页面和直接依赖，沿用现有结构与设计。用户明确要求统一或迁移规范时，对指定范围应用目标规范。
- 编写 UI 前读取[设计规范](references/admin-demo.md)、[组件约定](references/components.md)及项目设计配置。复用适用组件；公共参数通过主题和 CSS 变量生效，业务特例留在模块内。
- 新模板的 `prototype-pages.json` 登记页面、文档和 Hash 路由，`src/pages/registry.tsx` 绑定组件，菜单和路由自动生成。修改页面后同步登记及相关 `ui-checks.json` 场景；已有项目使用自己的等效机制。

## 新建项目

需要 Bash（Windows 使用 WSL）、Node 20.19+ 或 22.12+（不支持 21.x）及 npm。

```bash
bash <skill目录>/scripts/init-demo.sh <project-name>
cd admin-demo-code/<project-name>
```

默认生成轻量列表；需要完整业务示例时加 `--examples`，跳过安装用 `--no-install`，指定输出根目录用 `ADMIN_PROTOTYPE_ROOT`。依赖安装失败保留源码，在生成目录重试 `npm ci --include=dev`。开发预览用 `npm run dev`。

## 验证与交付

1. 新模板运行 `npm run format:check`、`npm run export:html`，得到 `dist/admin-share.html`。导出已含配置校验、类型检查和构建；已有项目运行等效命令。
2. 按[验收清单](references/ui-checklist.md)检查最终文件、双视口截图和本次业务操作。使用共享工具时读[浏览器验收](references/browser-check.md)，也可沿用项目等效检查。失败修复后重新导出，复查受影响页面。
3. 交付文件、实际检查结果、报告或截图位置及未覆盖项。配置校验和构建成功不代表页面合规；浏览器不可用时标记“视觉与交互验收未完成”。

## 按需操作

- **发布或独立评审页**：仅在任务需要时读[发布说明](references/maintenance.md#发布与评审)。沿用当前或持续有效的发布授权及目标；仅配置查看器路径不代表授权。业务仍在源项目维护。
- **修改模板、脚本或升级旧项目**：读[维护约定](references/maintenance.md)。维护测试和生成稳定性评估不属于普通业务迭代的必跑流程。
