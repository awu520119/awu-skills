#!/usr/bin/env bash
# 初始化可手动维护、也可接收外部发布的原型查看器。
# 用法: init-viewer.sh <destination>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DESTINATION="${1:-}"
if [ "$#" -ne 1 ]; then
  echo "用法: init-viewer.sh <destination>"
  exit 1
fi

if [ -z "$DESTINATION" ]; then
  echo "用法: init-viewer.sh <destination>"
  exit 1
fi
if [ -e "$DESTINATION" ]; then
  echo "目标目录已存在，已停止以避免覆盖: $DESTINATION"
  exit 1
fi

command -v python3 >/dev/null 2>&1 || { echo "需要 Python 3.10+"; exit 1; }
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else "需要 Python 3.10+")'

# Python is already a viewer prerequisite; use one copy path on every platform.
# Build outputs and previous publication data never become a new viewer's seed data.
python3 - "$SOURCE_DIR" "$DESTINATION" <<'PY_COPY'
from pathlib import Path
import shutil
import sys
import json
from datetime import datetime
source, destination = map(Path, sys.argv[1:3])
destination.mkdir(parents=True)
for name in ('assets', 'templates', 'scripts'):
    shutil.copytree(source / name, destination / name,
                    ignore=shutil.ignore_patterns('__pycache__', '.DS_Store', 'init-viewer.sh'))
for name in ('index.html', 'update.sh', 'requirements.txt', 'requirements-browser.txt', '.prototype-viewer.json', '.gitignore'):
    shutil.copy2(source / name, destination / name)
for folder in ('pages', 'desc'):
    (destination / folder).mkdir()
(destination / 'nav.manual.json').write_text(json.dumps({'projectName': destination.name, 'tree': []}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
data = json.loads((destination / 'nav.manual.json').read_text(encoding='utf-8'))
data['lastSyncAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
(destination / 'nav.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(destination / 'nav.js').write_text('window.NAV_DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
PY_COPY

echo "初始化完成: $DESTINATION"
echo "手动内容：pages/、desc/、nav.manual.json"
echo "下一步：cd \"$DESTINATION\""
echo "  python3 -m venv .venv"
echo "  .venv/bin/python -m pip install -r requirements.txt"
echo "  .venv/bin/python scripts/doctor.py"
echo "  .venv/bin/python scripts/add_page.py . --id first-page --title 首页"
echo "日常修改 pages/、desc/ 或 nav.manual.json 后：bash update.sh"
