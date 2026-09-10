---
name: figma-ant-design-prototype
description: 将 HTML 或 Vite 静态产物与对应 PRD 发布到自包含的原型查看器，并提供本地 HTTP 预览。适用于发布、更新和整理可浏览原型；不负责开发 React 页面。
---

# HTML Demo 发布到原型查看器

把页面 Demo 和 PRD 组织成一个可复用的原型项目：左侧页面导航，中间 HTML 预览，右侧 PRD 预览。

## 适用范围

- 页面源：单个 `.html` 文件、包含 `index.html` 的静态目录，或 Vite 构建后的 `dist/`。
- PRD：用户提供的 Markdown 文件。可以自动发现同名 `.md`、`prd.md`、`PRD.md`，不明确时使用 `--prd`。
- 项目：本 Skill 可自行初始化，不需要其他项目、Skill、Node.js 或 Python Markdown 依赖。
- 本 Skill 只负责发布和预览，不代替页面开发，也不把 HTML 中的 Mock 行为臆测成完整业务规则。

## 每次调用的处理规则

1. 先确定页面源、PRD 和原型项目目录。用户未指定时，优先使用当前目录下明确提到的 HTML/PRD，并将 `./prototype-project` 作为原型项目目录。
2. 原型项目不存在时，使用 `--init`；已经存在时不要重复初始化。
3. 根据页面文件名生成 kebab-case `id`；需要稳定命名时显式传 `--id`。标题优先使用 PRD 一级标题，其次使用 HTML `<title>`。
4. 首次发布使用普通发布；同一 `id` 已存在且用户要同步修改时，必须加 `--replace`。
5. 发布成功后启动 `preview.py`，返回查看器地址、选中节点和生成文件位置。没有实际打开浏览器时，不声称完成视觉验收。

## 标准工作流

### 首次初始化并发布

```bash
python3 scripts/publish_demo.py \
  ./prototype-project \
  --init \
  --source ./order-list.html \
  --prd ./order-list.md \
  --id order-list \
  --title "订单列表"
```

### 发布到已有项目

```bash
python3 scripts/publish_demo.py \
  ./prototype-project \
  --source ./order-list.html \
  --prd ./order-list.md \
  --id order-list \
  --title "订单列表"
```

### 更新同一页面

```bash
python3 scripts/publish_demo.py \
  ./prototype-project \
  --source ./order-list.html \
  --prd ./order-list.md \
  --id order-list \
  --replace
```

### 发布带资源的静态目录

当 HTML 依赖 CSS、JS、图片或字体时，传入整个目录，不要只传 `index.html`：

```text
order-list/
├── index.html
├── assets/
├── styles.css
└── app.js
```

```bash
python3 scripts/publish_demo.py \
  ./prototype-project \
  --source ./order-list \
  --prd ./order-list-prd.md \
  --id order-list
```

### 启动预览

```bash
python3 scripts/preview.py \
  ./prototype-project \
  --node order-list \
  --open
```

如果不使用 `--open`，复制终端输出的 `http://127.0.0.1:4173/` 地址到浏览器即可。按 `Ctrl+C` 停止服务。

## 项目结构约定

```text
prototype-project/
├── index.html                    # 内置原型查看器
├── nav.json                      # 页面和分组导航
├── nav.js                        # 发布时同步生成
├── pages/<id>/index.html         # 页面入口及其静态资源
└── desc/<id>.md/.html            # 原始 PRD 和可展示的 PRD 页面
```

发布脚本会复制页面资源、更新导航、生成 PRD 展示页，并执行内置完整性校验。原型查看器必须通过 HTTP 访问，避免 `file://` 下的 iframe 和 `fetch` 限制。

## 分组页面

当需要把页面放入导航分组时：

```bash
python3 scripts/publish_demo.py \
  ./prototype-project \
  --source ./order-list.html \
  --prd ./order-list.md \
  --id order-list \
  --parent orders \
  --parent-title "订单管理" \
  --create-parent
```

## PRD 规则

- PRD 必须由用户提供，或用户明确要求本次生成；没有 PRD 时不要根据 Demo 臆造业务规则。
- 推荐结构和字段见 [references/prd-template.md](references/prd-template.md)。
- 在 PRD 中区分“Demo 已实现”“原型展示”“PRD 约定”和“待确认”。

## 交付检查

- 页面入口存在于 `pages/<id>/index.html`，资源相对路径保持可用。
- 原始 PRD 存在于 `desc/<id>.md`，展示页存在于 `desc/<id>.html`。
- `nav.json`、`nav.js` 和页面文件使用同一个 `id`。
- 发布命令成功返回并通过内置校验。
- 预览服务通过 HTTP 启动；只做结构检查时，明确说明没有完成视觉验收。

完整的手工操作示例见 [操作手册.md](../操作手册.md)。
