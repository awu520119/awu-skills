#!/usr/bin/env python3
"""Initialize a standalone prototype viewer without overwriting existing files."""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL_DIR / "templates" / "viewer" / "index.html"


def initialize(project: Path, project_name: str) -> None:
    project = project.resolve()
    if project.exists() and any(project.iterdir()):
        markers = (project / "index.html", project / "nav.json")
        if not all(path.is_file() for path in markers):
            raise ValueError(f"目标目录非空且不是原型查看器项目: {project}")
        return

    project.mkdir(parents=True, exist_ok=True)
    (project / "pages").mkdir(exist_ok=True)
    (project / "docs").mkdir(exist_ok=True)
    shutil.copy2(TEMPLATE, project / "index.html")
    (project / "nav.json").write_text(
        json.dumps({"projectName": project_name, "tree": []}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="初始化独立原型查看器")
    parser.add_argument("project")
    parser.add_argument("--name", default="原型查看器")
    args = parser.parse_args()

    try:
        initialize(Path(args.project), args.name)
        print(f"已初始化: {Path(args.project).resolve()}")
        return 0
    except (OSError, ValueError) as exc:
        print(f"初始化失败: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
