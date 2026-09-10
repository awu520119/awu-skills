#!/usr/bin/env bash
# 检查并构建指定后台 Demo。
# 用法: build-demo.sh <project-name>
set -euo pipefail

PROJECT_ROOT="${FIGMA_ADMIN_ROOT:-$PWD}"
PROJECT_NAME="${1:-}"

if [ -z "$PROJECT_NAME" ]; then
  echo "用法: build-demo.sh <project-name>"
  exit 1
fi

PROJECT_DIR="$PROJECT_ROOT/admin-demo-code/$PROJECT_NAME"
if [ ! -d "$PROJECT_DIR" ]; then
  echo "项目不存在: $PROJECT_DIR"
  exit 1
fi

if [ ! -f "$PROJECT_DIR/package.json" ]; then
  echo "缺少 package.json: $PROJECT_DIR"
  exit 1
fi

if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "未检测到依赖，先执行 npm install"
  (cd "$PROJECT_DIR" && npm install)
fi

echo "运行类型检查"
(cd "$PROJECT_DIR" && npm run check)

echo "构建静态产物"
(cd "$PROJECT_DIR" && npm run build)

DIST_DIR="$PROJECT_DIR/dist"
if [ ! -f "$DIST_DIR/index.html" ]; then
  echo "构建未生成 dist/index.html"
  exit 1
fi

file_count="$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')"
echo "构建完成: $DIST_DIR"
echo "产物文件数: $file_count"
echo "模板使用 Hash 路由和 Vite 相对资源路径，可部署到静态服务器子路径。"
