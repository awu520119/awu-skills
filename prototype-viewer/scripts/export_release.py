#!/usr/bin/env python3
"""生成不含开发依赖和系统缓存的精简发布副本。

用法：
    python3 scripts/export_release.py .
    python3 scripts/export_release.py . --force
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path


EXCLUDED_DIRS = {
    ".git",
    ".venv",
    "node_modules",
    "__MACOSX",
    "__pycache__",
}


def ignored(directory: str, names: list[str]) -> set[str]:
    return {
        name
        for name in names
        if name in EXCLUDED_DIRS
        or name == ".DS_Store"
        or name.endswith(".pyc")
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="导出精简版原型项目")
    parser.add_argument("project_dir", nargs="?", default=".")
    parser.add_argument("--output", default="release")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    project = Path(args.project_dir).resolve()
    output = (project / args.output).resolve()
    if output == project or project not in output.parents:
        parser.error("--output 必须是项目目录下的子目录")
    if output.exists():
        if not args.force:
            parser.error(f"输出已存在：{output}；确认覆盖请加 --force")
        shutil.rmtree(output)

    output.mkdir(parents=True)
    for item in project.iterdir():
        if item.name == output.name or item.name in EXCLUDED_DIRS or item.name == ".DS_Store":
            continue
        destination = output / item.name
        if item.is_dir():
            shutil.copytree(item, destination, ignore=ignored)
        else:
            if item.suffix == ".pyc":
                continue
            shutil.copy2(item, destination)

    print(f"✅ 已生成精简发布目录：{output}")
    print("ℹ️ 已排除 .venv、node_modules、__MACOSX、缓存和 .DS_Store")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
