#!/usr/bin/env bash
# 列出 <项目根>/admin-demo-code 下的 React + Ant Design Demo。
set -euo pipefail

PROJECT_ROOT="${FIGMA_ADMIN_ROOT:-$PWD}"
DEMO_DIR="$PROJECT_ROOT/admin-demo-code"

if [ ! -d "$DEMO_DIR" ]; then
  echo "STATE=NO_DEMO_CODE"
  echo "admin-demo-code 目录不存在: $DEMO_DIR"
  exit 0
fi

found=0
for project_dir in "$DEMO_DIR"/*/; do
  [ -d "$project_dir" ] || continue
  package_file="$project_dir/package.json"
  [ -f "$package_file" ] || continue

  project_name="$(basename "$project_dir")"
  project_type="unknown"
  if grep -q '"antd"' "$package_file" && grep -q '"react"' "$package_file"; then
    project_type="react-antd"
  fi

  dependencies="no"
  [ -d "$project_dir/node_modules" ] && dependencies="yes"

  if [ "$found" -eq 0 ]; then
    echo "STATE=HAS_PROJECTS"
    echo "现有后台 Demo（${DEMO_DIR}）:"
  fi

  found=1
  echo "  - $project_name  [类型:$project_type] [依赖已装:$dependencies]"
done

if [ "$found" -eq 0 ]; then
  echo "STATE=EMPTY_DEMO_CODE"
  echo "admin-demo-code 存在但没有有效项目: $DEMO_DIR"
fi
