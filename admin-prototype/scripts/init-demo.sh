#!/usr/bin/env bash
# 初始化 React + Ant Design 后台 Demo。
# 用法: init-demo.sh <project-name> [--viewer <viewer-path>] [--no-install]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$SKILL_DIR/templates/admin"

PROJECT_ROOT="${ADMIN_PROTOTYPE_ROOT:-$PWD}"
DEMO_DIR="$PROJECT_ROOT/admin-demo-code"
PROJECT_NAME="${1:-}"
shift || true
NO_INSTALL=""
VIEWER_PATH=""

if [ -z "$PROJECT_NAME" ]; then
  echo "用法: init-demo.sh <project-name(kebab-case)> [--viewer <viewer-path>] [--no-install]"
  exit 1
fi

if ! printf '%s' "$PROJECT_NAME" | grep -Eq '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'; then
  echo "项目名必须为 kebab-case: $PROJECT_NAME"
  exit 1
fi

while [ "$#" -gt 0 ]; do
  case "$1" in
    --no-install) NO_INSTALL="--no-install" ;;
    --viewer)
      shift
      VIEWER_PATH="${1:-}"
      [ -n "$VIEWER_PATH" ] || { echo "--viewer 缺少路径"; exit 1; }
      ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
  shift
done

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "模板不存在: $TEMPLATE_DIR"
  exit 1
fi

DESTINATION="$DEMO_DIR/$PROJECT_NAME"
if [ -e "$DESTINATION" ]; then
  echo "目标目录已存在，已停止以避免覆盖: $DESTINATION"
  exit 1
fi

if [ -n "$VIEWER_PATH" ]; then
  VIEWER_ABS="$(cd "$PROJECT_ROOT" && cd "$VIEWER_PATH" && pwd -P)"
  if [ ! -f "$VIEWER_ABS/.prototype-viewer.json" ]; then
    echo "目标不是受控原型查看器（缺少 .prototype-viewer.json）: $VIEWER_ABS"
    exit 1
  fi
fi

command -v node >/dev/null 2>&1 || { echo "请先安装 Node.js（版本见模板 package.json）"; exit 1; }

mkdir -p "$DEMO_DIR"
echo "复制模板到 $DESTINATION"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude .DS_Store --exclude node_modules --exclude dist "$TEMPLATE_DIR/" "$DESTINATION/"
else
  mkdir -p "$DESTINATION"
  (
    cd "$TEMPLATE_DIR"
    find . \( -type d \( -name node_modules -o -name dist \) -prune \) -o \( -type f ! -name .DS_Store \) -print | while IFS= read -r file; do
      target_dir="$DESTINATION/$(dirname "$file")"
      mkdir -p "$target_dir"
      cp "$file" "$DESTINATION/$file"
    done
  )
fi

PROJECT_ABS="$(cd "$DESTINATION" && pwd -P)"
node "$DESTINATION/scripts/configure-project.mjs" "$PROJECT_ABS" "$PROJECT_NAME" "${VIEWER_ABS:-}"

if [ "$NO_INSTALL" = "--no-install" ]; then
  echo "已跳过依赖安装。需要时在 $DESTINATION 执行 npm ci"
else
  echo "安装依赖: npm ci"
  (cd "$DESTINATION" && npm ci)
fi

echo "初始化完成: $DESTINATION"
echo "下一步:"
echo "  cd \"$DESTINATION\""
echo "  npm run dev"
echo "  npm run check"
echo "  npm run build"
if [ -n "$VIEWER_PATH" ]; then
  echo "  npm run publish:viewer"
fi
