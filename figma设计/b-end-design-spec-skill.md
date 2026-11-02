---
name: b-end-design-spec
description: 形影随拍 B 端设计规范 skill，基于 Ant Design + 项目已有设计稿提炼，确保后续 UI 设计稿输出的一致性，支持导出标准 HTML 原型。
metadata:
  type: skill
  version: 1.1.0
  project: 形影随拍后台管理系统
  reference: Ant Design 5.x
---

# B 端设计规范 Skill

## 文件头

- **技能名称**：B 端设计规范技能
- **版本**：v1.1.0
- **适用项目**：形影随拍后台管理系统
- **最后更新**：2026-09-02
- **设计依据**：Ant Design 5.x 组件规范 + 项目已有设计稿（账号管理、编辑盒子、订单列表、告警、消息等 40+ 页面）
- **组件参考**：Ant Design（https://ant.design）

---

## 一句话描述

输入页面类型和内容，输出符合形影随拍 B 端规范的 HTML 原型页面，包含正确的颜色、字体、间距、组件样式，可直接用于演示和开发参考。

---

## 输入

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page_type` | string | 是 | 页面类型：list_page / form_page / detail_page / modal / popconfirm / empty_state |
| `page_title` | string | 是 | 页面标题名称 |
| `content_desc` | string | 是 | 页面内容描述（包含哪些表单项、数据字段、操作按钮） |
| `has_filter` | boolean | 否 | 是否需要筛选区域（默认 false） |
| `has_pagination` | boolean | 否 | 是否需要分页器（默认 true，用于列表页） |
| `modal_size` | string | 否 | 弹窗尺寸：small(416px) / medium(520px) / large(600px)，默认 medium |
| `output_format` | string | 否 | 输出格式：css_comment（默认）/ html_tailwind / html_css |

---

## 输入约定

### 1. 画布尺寸
- **桌面端画布**：宽度 1440px，高度 900px
- **左侧导航宽度**：220px
- **主内容区域**：1220px（1440 - 220）

### 2. 页面结构层级
```
页面背景：#F2F4F7
├── 顶部导航栏（Header）：高度 58px，padding 15px 24px
├── 主内容区（Main）：
│   ├── 筛选区（Filter Bar）：可选，高度约 56px
│   ├── 内容区（Content）
│   └── 底部操作区（Footer）：高度 56px（用于表单页）
```

### 3. 字体规范
| 用途 | 字体 | 字号 | 字重 | 行高 |
|------|------|------|------|------|
| 页面标题 | HarmonyOS Sans SC | 18px | 500 | 24px |
| 弹窗标题 | HarmonyOS Sans SC | 16px | 700 | 24px |
| 正文标题 | HarmonyOS Sans SC | 16px | 700 | 24px |
| 正文内容 | HarmonyOS Sans SC | 14px | 400 | 22px |
| 表单标签 | HarmonyOS Sans SC | 14px | 400 | 22px |
| 按钮文字 | HarmonyOS Sans SC | 14px | 400 | 22px |
| 辅助文字 | HarmonyOS Sans SC | 14px | 400 | 22px |
| 数字/徽标 | DIN | 12px | 500 | 22px |

### 4. 颜色系统
```
主色系：
├── 蓝色主色：#2776FF（背景、按钮、选中态）
├── 主色浅底：#E6ECFF（标签背景）
├── 主色边框：#91D5FF（提示框边框）

成功色系：
├── 成功色：#52C41A（成功图标）
├── 成功背景：#F6FFED（成功提示框）
├── 成功边框：#B7EB8F

警告色系：
├── 警告色：#FAAD14（警告图标）
├── 警告背景：#FFFBE6（黄色提示框背景）
├── 警告边框：#FFE58F

错误色系：
├── 错误色：#FF4D4F（错误徽标）

文字色阶：
├── 一级文字：#303338（标题、主要内容）
├── 二级文字：#696C70（次要说明）
├── 三级文字：#8F9499（辅助信息）
├── 四级文字：#B3B8BF（占位符、禁用态）

边框色阶：
├── 一级边框：#D7DAE0（输入框、分隔线）
├── 二级边框：#E9EBF0（内部分割线）

背景色：
├── 页面背景：#F2F4F7
├── 卡片背景：#FFFFFF
├── 输入框背景：#F5F5F5
```

### 5. 间距规范
```
页面级间距：24px（内容四周留白）
组件间距（大）：16px
组件间距（中）：12px
组件间距（小）：8px
元素间距（微）：4px
表单标签与输入框间距：2px
```

### 6. 圆角规范
| 场景 | 圆角值 |
|------|--------|
| 按钮、输入框、提示框 | 2px |
| 弹窗（Modal）、气泡确认 | 4px |
| 消息卡片、浮层 | 8px |
| 头像 | 32.67px（圆形） |
| 徽标/标签 | 10px（胶囊形用9999px） |

### 7. 阴影规范
```
弹窗阴影：
drop-shadow(0px 3px 6px -4px rgba(0,0,0,0.12), 0px 6px 16px rgba(0,0,0,0.08), 0px 9px 28px 8px rgba(0,0,0,0.05))

卡片阴影：
box-shadow: 0px 2px 4px -4px rgba(0,0,0,0.05), 0px 4px 14px rgba(0,0,0,0.08)

按钮次级阴影：
box-shadow: 0px 2px 0px rgba(0,0,0,0.016)

气泡确认阴影：
filter: drop-shadow(0px 2px 8px rgba(0,0,0,0.15))
```

---

## 执行步骤

### 步骤 1：确定页面结构
1. 根据 `page_type` 确定基础布局框架
2. 设置画布尺寸 1440 × 900px
3. 标注左侧导航 220px 预留

### 步骤 2：应用颜色体系
1. 页面背景填充 #F2F4F7
2. 卡片/弹窗背景填充 #FFFFFF
3. 根据内容类型选择文字色阶（一级/二级/三级/四级）
4. 操作类元素使用 #2776FF 主色

### 步骤 3：构建组件（基于 Ant Design 规范）
1. **按钮（Button）**：
   - 主按钮：背景 #2776FF，白色文字，圆角 2px，高度 32px
   - 次级按钮：背景 #FFFFFF，#D7DAE0 边框，#303338 文字，高度 32px
   - 虚线按钮：背景 #FFFFFF，#D9D9D9 虚线边框
   - 文字按钮：无背景无边框，#2776FF 文字
   - 按钮内边距：5px 16px
   - 按钮组间距：8px
   - 危险按钮：#FF4D4F 背景

2. **输入框/选择器（Input / Select）**：
   - 高度：32px
   - 背景：#F5F5F5（默认）/ #FFFFFF（聚焦/选中）
   - 边框：1px solid #D7DAE0（默认）/ #2776FF（聚焦）
   - 圆角：2px
   - 内边距：4px 12px
   - 占位符文字：#B3B8BF
   - Select 下拉箭头：10.18px × 6.86px，#D7DAE0

3. **表单布局（Form）**：
   - 标签文字右对齐，宽度根据内容自适应（最短 56px）
   - 标签与冒号 "：" 紧邻
   - 标签与输入框间距 2px
   - 表单项垂直间距 16px
   - 必填标记：红色星号 #FF4D4F

4. **提示框（Alert）**：
   - 高度：40px
   - 内边距：9px 16px
   - 圆角：2px
   - 图标 16px，文字 14px
   - 关闭按钮 14px
   - 成功：#F6FFED 背景 + #B7EB8F 边框 + #52C41A 图标
   - 警告：#FFFBE6 背景 + #FFE58F 边框 + #FAAD14 图标
   - 信息：#E6ECFF 背景 + #91D5FF 边框 + #2776FF 图标

5. **弹窗（Modal）**：
   - 宽度：small 416px / medium 520px / large 600px
   - 内边距：32px 32px 24px
   - 圆角：4px
   - 阴影：三层阴影叠加
   - 底部操作区高度 56px，右对齐按钮组
   - 遮罩层：rgba(0,0,0,0.45)

6. **气泡确认（Popconfirm）**：
   - 最小宽度 300px
   - 内边距：16px
   - 圆角：2px
   - 阴影：drop-shadow(0px 2px 8px rgba(0,0,0,0.15))
   - 箭头：14.14px × 7.07px
   - 按钮组：24px 高度，8px 间距

7. **表格（Table）**：
   - 表头：高度 48px，背景 #F2F4F7，文字 #696C70，字重 500
   - 表格行：高度 48px，边框 #E9EBF0
   - 选中行：#E6ECFF 背景
   - hover 行：#F2F4F7 背景
   - 列边框：右侧 1px #E9EBF0（最后一行除外）

8. **分页器（Pagination）**：
   - 容器高度：48px
   - 按钮尺寸：32px × 32px
   - 页码按钮：32px 圆形或 2px 圆角
   - 选中态：#2776FF 背景 + #FFFFFF 文字
   - 默认态：#FFFFFF 背景 + #303338 文字

9. **标签页（Tabs）**：
   - 容器高度：48px
   - 选中态：#2776FF 文字 + 2px #2776FF 下边框
   - 未选中态：#696C70 文字
   - 徽标背景：#E6ECFF，文字 #2776FF
   - 分割线：1px #E9EBF0

10. **卡片（Card）**：
    - 背景：#FFFFFF
    - 圆角：8px
    - 阴影：box-shadow(0px 2px 4px -4px rgba(0,0,0,0.05), 0px 4px 14px rgba(0,0,0,0.08))
    - 内边距：24px

11. **空状态（Empty）**：
    - 图标尺寸：64px × 40px
    - 文字：14px，#8F9499，居中
    - 间距：8px

### 步骤 4：输出交付物
根据 `output_format` 输出对应格式

---

## 输出契约

### 文件命名规范
```
{页面类型}_{页面名称}.{后缀}
示例：
- list_账号管理.md
- list_账号管理.html
- form_新增账号.md
- modal_二次确认.html
- popconfirm_删除确认.md
```

### 输出格式一：CSS Comment（默认）
用于设计稿文档，保留完整 CSS 属性注释：
```css
/* 组件名称 */

/* Auto layout */
display: flex;
flex-direction: row;
align-items: center;
padding: 5px 16px;
gap: 8px;

width: 120px;
height: 32px;

/* 形影随拍后台/背景/蓝色主色 */
background: #2776FF;
border-radius: 2px;

/* Inside auto layout */
flex: none;
order: 0;
flex-grow: 0;


/* 文字样式 */
font-family: 'HarmonyOS Sans SC';
font-style: normal;
font-weight: 400;
font-size: 14px;
line-height: 22px;
color: #303338;
```

### 输出格式二：HTML + Tailwind CSS
用于快速原型演示，输出完整可运行的 HTML 文件：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=HarmonyOS+Sans+SC:wght@400;500;700&display=swap');
    body { font-family: 'HarmonyOS Sans SC', sans-serif; }
  </style>
</head>
<body class="bg-[#F2F4F7]">
  <!-- 页面结构 -->

  <!-- Ant Design 组件示例 -->
  <script>
    // 使用 Ant Design Vue/React CDN 构建交互原型
  </script>
</body>
</html>
```

### 输出格式三：HTML + CSS
纯 HTML + 内联/内嵌 CSS，适用于静态原型演示：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>{page_title}</title>
  <style>
    /* 规范色值变量 */
    :root {
      --color-primary: #2776FF;
      --color-bg-page: #F2F4F7;
      --color-bg-card: #FFFFFF;
      --color-text-1: #303338;
      --color-text-2: #696C70;
      --color-border: #D7DAE0;
    }
    body { background: var(--color-bg-page); font-family: 'HarmonyOS Sans SC', sans-serif; }

    /* 按钮 */
    .btn-primary {
      height: 32px;
      padding: 5px 16px;
      background: var(--color-primary);
      border-radius: 2px;
      color: white;
    }
  </style>
</head>
<body>
  <!-- 页面结构 -->
</body>
</html>
```

---

## 输出契约补充规定

### 补充一：完整的 CSS 变量系统（HTML 输出必须使用）

```css
:root {
  /* ========== 颜色 ========== */
  /* 主色系 */
  --color-primary: #2776FF;
  --color-primary-hover: #4090FF;
  --color-primary-active: #1060E0;
  --color-primary-light: #E6ECFF;
  --color-primary-border: #91D5FF;
  
  /* 成功色系 */
  --color-success: #52C41A;
  --color-success-bg: #F6FFED;
  --color-success-border: #B7EB8F;
  
  /* 警告色系 */
  --color-warning: #FAAD14;
  --color-warning-bg: #FFFBE6;
  --color-warning-border: #FFE58F;
  
  /* 错误色系 */
  --color-error: #FF4D4F;
  --color-error-bg: #FFF1F0;
  --color-error-border: #FF7875;
  
  /* 文字色阶 */
  --color-text-1: #303338;
  --color-text-2: #696C70;
  --color-text-3: #8F9499;
  --color-text-4: #B3B8BF;
  
  /* 边框色阶 */
  --color-border: #D7DAE0;
  --color-border-light: #E9EBF0;
  
  /* 背景色 */
  --color-bg-page: #F2F4F7;
  --color-bg-card: #FFFFFF;
  --color-bg-input: #F5F5F5;
  --color-bg-header: #FFFFFF;
  --color-bg-table-header: #F2F4F7;
  --color-bg-table-hover: #F2F4F7;
  --color-bg-table-selected: #E6ECFF;
  
  /* ========== 阴影 ========== */
  --shadow-modal: 0px 3px 6px -4px rgba(0,0,0,0.12), 0px 6px 16px rgba(0,0,0,0.08), 0px 9px 28px 8px rgba(0,0,0,0.05);
  --shadow-card: 0px 2px 4px -4px rgba(0,0,0,0.05), 0px 4px 14px rgba(0,0,0,0.08);
  --shadow-popconfirm: 0px 2px 8px rgba(0,0,0,0.15);
  --shadow-button: 0px 2px 0px rgba(0,0,0,0.016);
  
  /* ========== 圆角 ========== */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;
  
  /* ========== 间距 ========== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  
  /* ========== 尺寸 ========== */
  --height-button: 32px;
  --height-input: 32px;
  --height-header: 58px;
  --height-table-header: 48px;
  --height-table-row: 48px;
  --height-pagination: 48px;
  --width-sidebar: 220px;
  
  /* ========== 字体 ========== */
  --font-family: 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-din: 'DIN', 'Helvetica Neue', sans-serif;
}
```

### 补充二：完整 HTML 页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <!--
    形影随拍 B 端设计规范
    版本: 1.1.0
    生成时间: {YYYY-MM-DD HH:mm:ss}
    设计依据: Ant Design 5.x + 项目设计稿
  -->
  <style>
    /* ========== CSS 变量（必须引入）========== */
    :root {
      --color-primary: #2776FF;
      --color-primary-hover: #4090FF;
      --color-primary-active: #1060E0;
      --color-primary-light: #E6ECFF;
      --color-primary-border: #91D5FF;
      --color-success: #52C41A;
      --color-success-bg: #F6FFED;
      --color-success-border: #B7EB8F;
      --color-warning: #FAAD14;
      --color-warning-bg: #FFFBE6;
      --color-warning-border: #FFE58F;
      --color-error: #FF4D4F;
      --color-error-bg: #FFF1F0;
      --color-error-border: #FF7875;
      --color-text-1: #303338;
      --color-text-2: #696C70;
      --color-text-3: #8F9499;
      --color-text-4: #B3B8BF;
      --color-border: #D7DAE0;
      --color-border-light: #E9EBF0;
      --color-bg-page: #F2F4F7;
      --color-bg-card: #FFFFFF;
      --color-bg-input: #F5F5F5;
      --color-bg-header: #FFFFFF;
      --color-bg-table-header: #F2F4F7;
      --color-bg-table-hover: #F2F4F7;
      --color-bg-table-selected: #E6ECFF;
      --shadow-modal: 0px 3px 6px -4px rgba(0,0,0,0.12), 0px 6px 16px rgba(0,0,0,0.08), 0px 9px 28px 8px rgba(0,0,0,0.05);
      --shadow-card: 0px 2px 4px -4px rgba(0,0,0,0.05), 0px 4px 14px rgba(0,0,0,0.08);
      --shadow-popconfirm: 0px 2px 8px rgba(0,0,0,0.15);
      --shadow-button: 0px 2px 0px rgba(0,0,0,0.016);
      --radius-sm: 2px;
      --radius-md: 4px;
      --radius-lg: 8px;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 12px;
      --spacing-lg: 16px;
      --spacing-xl: 24px;
      --height-button: 32px;
      --height-input: 32px;
      --height-header: 58px;
      --height-table-header: 48px;
      --height-table-row: 48px;
      --width-sidebar: 220px;
      --font-family: 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-din: 'DIN', 'Helvetica Neue', sans-serif;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: var(--font-family);
      background: var(--color-bg-page);
      font-size: 14px;
      line-height: 1.57;
      color: var(--color-text-1);
    }
    
    /* ========== 页面布局 ========== */
    .page-layout { display: flex; min-height: 100vh; }
    
    /* ========== 左侧导航 ========== */
    .sidebar {
      width: var(--width-sidebar);
      background: var(--color-bg-card);
      border-right: 1px solid var(--color-border-light);
      flex-shrink: 0;
      position: fixed;
      top: 0; left: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar-logo {
      height: var(--height-header);
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-light);
    }
    .sidebar-nav { padding: var(--spacing-sm) 0; }
    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px var(--spacing-lg);
      color: var(--color-text-2);
      text-decoration: none;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-item:hover { background: var(--color-bg-page); color: var(--color-text-1); }
    .nav-item.active {
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-right: 2px solid var(--color-primary);
    }
    
    /* ========== 主内容区 ========== */
    .main-wrapper {
      flex: 1;
      margin-left: var(--width-sidebar);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    /* ========== 顶部导航 ========== */
    .header {
      height: var(--height-header);
      background: var(--color-bg-header);
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-xl);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .header-title { font-size: 18px; font-weight: 500; color: var(--color-text-1); }
    .header-actions { display: flex; align-items: center; gap: var(--spacing-sm); }
    
    /* ========== 内容区域 ========== */
    .content { flex: 1; padding: var(--spacing-xl); }
    
    /* ========== 卡片 ========== */
    .card {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      padding: var(--spacing-xl);
    }
    
    /* ========== 按钮 ========== */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--height-button);
      padding: 5px 16px;
      font-size: 14px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      gap: var(--spacing-xs);
    }
    .btn-primary { background: var(--color-primary); color: #FFFFFF; }
    .btn-primary:hover { background: var(--color-primary-hover); }
    .btn-primary:active { background: var(--color-primary-active); }
    .btn-default { background: var(--color-bg-card); border-color: var(--color-border); color: var(--color-text-1); }
    .btn-default:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .btn-danger { background: var(--color-error); color: #FFFFFF; }
    .btn-text { background: transparent; color: var(--color-primary); border: none; }
    .btn-text:hover { background: var(--color-primary-light); }
    
    /* ========== 输入框 ========== */
    .input {
      height: var(--height-input);
      padding: 4px 12px;
      background: var(--color-bg-input);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-family: inherit;
      color: var(--color-text-1);
      outline: none;
      transition: all 0.2s;
    }
    .input:focus {
      background: var(--color-bg-card);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
    .input::placeholder { color: var(--color-text-4); }
    
    /* ========== 表格 ========== */
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      height: var(--height-table-header);
      background: var(--color-bg-table-header);
      color: var(--color-text-2);
      font-weight: 500;
      text-align: left;
      padding: 0 var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-light);
    }
    .table td {
      height: var(--height-table-row);
      padding: 0 var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-light);
      color: var(--color-text-1);
    }
    .table tr:hover td { background: var(--color-bg-table-hover); }
    .table tr.selected td { background: var(--color-bg-table-selected); }
    
    /* ========== 弹窗 ========== */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: var(--color-bg-card);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-modal);
      width: 520px;
      max-width: 90vw;
    }
    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title { font-size: 16px; font-weight: 700; color: var(--color-text-1); }
    .modal-body { padding: 24px; }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }
    
    /* ========== 分页器 ========== */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-xs);
      height: var(--height-table-header);
    }
    .pagination-item {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      background: var(--color-bg-card);
      color: var(--color-text-1);
      border: 1px solid var(--color-border);
    }
    .pagination-item:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .pagination-item.active { background: var(--color-primary); color: #FFFFFF; border-color: var(--color-primary); }
    
    /* ========== 徽标 ========== */
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      font-size: 12px;
      font-family: var(--font-din);
      font-weight: 500;
      background: var(--color-error);
      color: #FFFFFF;
      border-radius: var(--radius-full);
    }
    .badge-primary { background: var(--color-primary); }
    
    /* ========== 标签 ========== */
    .tag {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 8px;
      font-size: 14px;
      border-radius: var(--radius-sm);
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
    .tag-success { background: var(--color-success-bg); color: var(--color-success); }
    .tag-warning { background: var(--color-warning-bg); color: var(--color-warning); }
    .tag-error { background: var(--color-error-bg); color: var(--color-error); }
    
    /* ========== 提示框 ========== */
    .alert {
      display: flex;
      align-items: flex-start;
      padding: 9px 16px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      gap: var(--spacing-sm);
    }
    .alert-success { background: var(--color-success-bg); border: 1px solid var(--color-success-border); color: var(--color-success); }
    .alert-warning { background: var(--color-warning-bg); border: 1px solid var(--color-warning-border); color: var(--color-warning); }
    .alert-error { background: var(--color-error-bg); border: 1px solid var(--color-error-border); color: var(--color-error); }
    .alert-info { background: var(--color-primary-light); border: 1px solid var(--color-primary-border); color: var(--color-primary); }
    
    /* ========== 面包屑 ========== */
    .breadcrumb { display: flex; align-items: center; gap: var(--spacing-sm); font-size: 14px; color: var(--color-text-3); }
    .breadcrumb-item { cursor: pointer; }
    .breadcrumb-item:hover { color: var(--color-primary); }
    .breadcrumb-separator { color: var(--color-text-4); }
    
    /* ========== 筛选区 ========== */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
    }
    .filter-item { display: flex; align-items: center; gap: var(--spacing-sm); }
    .filter-label { font-size: 14px; color: var(--color-text-2); white-space: nowrap; }
    
    /* ========== 空状态 ========== */
    .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: var(--color-text-3); }
    .empty-icon { width: 64px; height: 40px; margin-bottom: var(--spacing-sm); }
    
    /* ========== 气泡确认 ========== */
    .popconfirm {
      background: var(--color-bg-card);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-popconfirm);
      padding: var(--spacing-lg);
      min-width: 300px;
    }
    .popconfirm-message { display: flex; align-items: flex-start; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); }
    .popconfirm-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); }
    .popconfirm-btn { height: 24px; padding: 0 12px; font-size: 14px; border-radius: var(--radius-sm); cursor: pointer; border: none; transition: all 0.2s; }
    .popconfirm-btn-cancel { background: var(--color-bg-card); border: 1px solid var(--color-border); color: var(--color-text-1); }
    .popconfirm-btn-confirm { background: var(--color-error); color: #FFFFFF; }
  </style>
</head>
<body>
  <!-- 完整页面结构 -->
  <div class="page-layout">
    <!-- 左侧导航 -->
    <aside class="sidebar">
      <div class="sidebar-logo">LOGO</div>
      <nav class="sidebar-nav">
        <a class="nav-item active">账号管理</a>
        <a class="nav-item">订单管理</a>
        <a class="nav-item">系统设置</a>
      </nav>
    </aside>
    
    <!-- 主内容 -->
    <main class="main-wrapper">
      <header class="header">
        <h1 class="header-title">{page_title}</h1>
        <div class="header-actions"><!-- 顶部操作按钮 --></div>
      </header>
      
      <div class="content">
        <!-- 筛选区（可选）-->
        <div class="filter-bar">...</div>
        
        <!-- 内容卡片 -->
        <div class="card"><!-- 表格/表单/详情 --></div>
        
        <!-- 分页器（可选）-->
        <div class="pagination">...</div>
      </div>
    </main>
  </div>
  
  <!-- 弹窗（可选）-->
  <div class="modal-overlay" style="display: none;">
    <div class="modal">
      <div class="modal-header"><span class="modal-title">弹窗标题</span></div>
      <div class="modal-body">弹窗内容</div>
      <div class="modal-footer">
        <button class="btn btn-default">取消</button>
        <button class="btn btn-primary">确定</button>
      </div>
    </div>
  </div>
</body>
</html>
```

### 补充三：扩展输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page_type` | string | 是 | 页面类型：list_page / form_page / detail_page / modal / popconfirm / empty_state |
| `page_title` | string | 是 | 页面标题名称 |
| `content_desc` | string | 是 | 页面内容描述 |
| `has_filter` | boolean | 否 | 是否需要筛选区（默认 false） |
| `has_pagination` | boolean | 否 | 是否需要分页器（默认 true） |
| `has_sidebar` | boolean | 否 | 是否需要左侧导航（默认 true） |
| `sidebar_menu` | array | 否 | 左侧菜单结构 `[{id, label, active?}]` |
| `modal_size` | string | 否 | 弹窗尺寸：small(416px) / medium(520px) / large(600px) |
| `output_format` | string | 否 | 输出格式：css_comment / html_tailwind / html_css（默认 css_comment） |

### 补充四：HTML 输出元信息

每个 HTML 文件头部必须包含：
```html
<!--
  形影随拍 B 端设计规范
  版本: 1.1.0
  生成时间: {YYYY-MM-DD HH:mm:ss}
  设计依据: Ant Design 5.x + 项目设计稿
-->
```

### 补充五：必含元素检查清单（HTML 输出）

**页面级检查**
- [ ] 包含完整的 CSS 变量定义（:root）
- [ ] 包含所有基础组件样式（按钮、输入框、表格、弹窗、分页）
- [ ] 画布尺寸 1440×900px（或指定尺寸）
- [ ] 左侧导航栏 220px 宽度
- [ ] 页面背景色 #F2F4F7

**组件级检查**
- [ ] 主按钮 #2776FF（不是 #2873F5）
- [ ] 输入框高度 32px，背景 #F5F5F5
- [ ] 弹窗圆角 4px，三层阴影叠加
- [ ] 文字色阶正确应用

**交互状态检查**
- [ ] 按钮 hover 态
- [ ] 输入框 focus 态（边框变 #2776FF）
- [ ] 表格行 hover 态

---

## 必含元素检查清单

### 页面级检查
- [ ] 画布尺寸声明（1440 × 900px）
- [ ] 页面背景色 #F2F4F7
- [ ] 左侧导航预留 220px

### 组件级检查
- [ ] 按钮样式（主按钮 #2776FF / 次按钮 #FFFFFF + #D7DAE0 边框）
- [ ] 输入框高度 32px，背景 #F5F5F5，边框 #D7DAE0，圆角 2px
- [ ] 弹窗圆角 4px，三层阴影叠加
- [ ] 圆角一致性（2px / 4px / 8px）
- [ ] 文字色阶应用正确（一级 #303338 / 二级 #696C70 / 三级 #8F9499）

### 交互状态检查（HTML 输出时）
- [ ] 按钮 hover 态
- [ ] 输入框 focus 态（边框变 #2776FF）
- [ ] 表格行 hover 态

### 命名规范检查
- [ ] 组件命名采用 `{type}/{name}` 格式
- [ ] CSS 类名采用小写 + 连字符（kebab-case）
- [ ] 颜色值使用规范变量或十六进制

---

## Ant Design 组件对照表

| 功能 | Ant Design 组件 | 本规范对应 |
|------|----------------|------------|
| 按钮 | Button | 高度 32px，圆角 2px，主色 #2776FF |
| 输入框 | Input | 高度 32px，背景 #F5F5F5 |
| 选择器 | Select | 同 Input，下拉箭头 10.18×6.86px |
| 表单 | Form | 标签右对齐，间距 16px |
| 弹窗 | Modal | 圆角 4px，三层阴影，遮罩 rgba(0,0,0,0.45) |
| 气泡确认 | Popconfirm | 圆角 2px，drop-shadow |
| 表格 | Table | 表头 48px 高，行 48px 高，边框 #E9EBF0 |
| 分页器 | Pagination | 按钮 32×32px，选中 #2776FF |
| 标签页 | Tabs | 高度 48px，下边框 2px #2776FF |
| 提示框 | Alert | 高度 40px，圆角 2px |
| 消息通知 | Message | 基于 Alert 样式 |
| 卡片 | Card | 圆角 8px，阴影 |
| 空状态 | Empty | 图标 64×40px，文字 14px #8F9499 |
| 下拉菜单 | Dropdown | 圆角 4px，阴影 |

---

## 约束

### 设计约束
1. **禁止偏离**：所有新增设计必须严格遵循本规范定义的颜色值、字号、行高
2. **间距基准**：间距使用 4px 基准网格，常规间距应为 4px 的整数倍（8/12/16/24px 等）
3. **圆角统一**：组件圆角仅使用 2px / 4px / 8px / 9999px（胶囊形）四种规格
4. **文字溢出**：长文本必须处理省略号，hover 显示完整内容

### 技术约束
1. **命名规范**：组件命名采用 `{type}/{name}` 格式（如 button/primary、input/default）
2. **状态标注**：交互状态（hover/active/disabled）需单独标注颜色变化
3. **HTML 原型**：必须保证 HTML 输出可独立运行，无外部依赖时降级展示

### 维护约束
1. 规范更新需同步更新版本号和变更日期
2. 重大变更（如颜色体系调整）需重新验证所有现有页面
3. 新增组件需先补充到本规范再投入使用
4. Ant Design 大版本升级时需评估规范兼容性
