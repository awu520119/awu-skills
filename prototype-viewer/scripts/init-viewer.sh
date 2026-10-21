#!/usr/bin/env bash
# 初始化可手动维护、也可接收外部发布的原型查看器。
# 用法: init-viewer.sh <destination>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DESTINATION="${1:-}"

if [ -z "$DESTINATION" ]; then
  echo "用法: init-viewer.sh <destination>"
  exit 1
fi
if [ -e "$DESTINATION" ]; then
  echo "目标目录已存在，已停止以避免覆盖: $DESTINATION"
  exit 1
fi

# Python is already a viewer prerequisite; use one copy path on every platform.
# Build outputs and previous publication data never become a new viewer's seed data.
python3 - "$SOURCE_DIR" "$DESTINATION" <<'PY_COPY'
from pathlib import Path
import shutil
import sys
source, destination = map(Path, sys.argv[1:])
excluded = {'.DS_Store', 'SKILL.md', 'agents', '__pycache__', 'node_modules', 'dist', 'share', '.published', 'tests'}
shutil.copytree(source, destination, ignore=lambda _folder, names: set(names) & excluded)
PY_COPY

echo "初始化完成: $DESTINATION"
echo "手动内容：pages/、desc/、nav.manual.json"
echo "同步命令：python3 scripts/sync_project.py ."
