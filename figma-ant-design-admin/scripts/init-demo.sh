#!/usr/bin/env bash
# 初始化 React + Ant Design 后台 Demo。
# 用法: init-demo.sh <project-name> [--no-install]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$SKILL_DIR/templates/admin"

PROJECT_ROOT="${FIGMA_ADMIN_ROOT:-$PWD}"
DEMO_DIR="$PROJECT_ROOT/admin-demo-code"
PROJECT_NAME="${1:-}"
NO_INSTALL="${2:-}"

if [ -z "$PROJECT_NAME" ]; then
  echo "用法: init-demo.sh <project-name(kebab-case)> [--no-install]"
  exit 1
fi

if ! printf '%s' "$PROJECT_NAME" | grep -Eq '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'; then
  echo "项目名必须为 kebab-case: $PROJECT_NAME"
  exit 1
fi

if [ -n "$NO_INSTALL" ] && [ "$NO_INSTALL" != "--no-install" ]; then
  echo "未知参数: $NO_INSTALL"
  exit 1
fi

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "模板不存在: $TEMPLATE_DIR"
  exit 1
fi

DESTINATION="$DEMO_DIR/$PROJECT_NAME"
if [ -e "$DESTINATION" ]; then
  echo "目标目录已存在，已停止以避免覆盖: $DESTINATION"
  exit 1
fi

mkdir -p "$DEMO_DIR"
echo "复制模板到 $DESTINATION"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude node_modules --exclude dist "$TEMPLATE_DIR/" "$DESTINATION/"
else
  mkdir -p "$DESTINATION"
  (
    cd "$TEMPLATE_DIR"
    find . \( -type d \( -name node_modules -o -name dist \) -prune \) -o -type f -print | while IFS= read -r file; do
      target_dir="$DESTINATION/$(dirname "$file")"
      mkdir -p "$target_dir"
      cp "$file" "$DESTINATION/$file"
    done
  )
fi

if [ "$NO_INSTALL" = "--no-install" ]; then
  echo "已跳过依赖安装。需要时在 $DESTINATION 执行 npm install"
else
  echo "安装依赖: npm install"
  (cd "$DESTINATION" && npm install)
fi

echo "初始化完成: $DESTINATION"
echo "下一步:"
echo "  cd \"$DESTINATION\""
echo "  npm run dev"
echo "  npm run check"
echo "  npm run build"

