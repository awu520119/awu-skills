# 初始化状态模板

这是 `figma-ant-design-prototype` 的最小可预览模板，适合初始化一个原型查看器项目后快速确认发布结果。

## 发布

在本 Skill 所在目录中执行：

```bash
python3 figma-ant-design-prototype/scripts/publish_demo.py \
  ./prototype-project --init \
  --source figma-ant-design-prototype/templates/initial-state \
  --prd figma-ant-design-prototype/templates/initial-state/initial-state.md \
  --id initial-state \
  --title "初始化状态模板"
```

## 预览

```bash
python3 figma-ant-design-prototype/scripts/preview.py ./prototype-project --node initial-state
```

模板是纯静态 HTML，不依赖 Vite、图片、外部网络资源或其他项目；发布后可直接替换 `index.html` 和 PRD 内容，继续沿用同一节点结构。
