#!/usr/bin/env python3
"""一键同步原型项目。

最简单的日常流程：
    1. 放入 pages/<name>.html 和 desc/<name>.md
    2. python3 scripts/sync_project.py .

已有页面按 nav.json 保持原目录；发现同名的新 HTML/MD 时，自动登记为顶层页面。
新页面默认登记到顶层；需要放入指定业务分组时，直接编辑 nav.json 的分组节点即可。
"""
from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import page_ops  # type: ignore  # noqa: E402
import sync_nav  # type: ignore  # noqa: E402
import validate  # type: ignore  # noqa: E402


def title_from_markdown(md: Path) -> str:
    """优先读取 Markdown 的第一个一级标题，否则使用文件名。"""
    try:
        for line in md.read_text(encoding="utf-8").splitlines():
            match = re.match(r"^#\s+(.+?)\s*$", line)
            if match:
                return match.group(1).strip()
    except UnicodeDecodeError:
        pass
    return md.stem


def discover_new_pages(project: Path, data: dict) -> list[dict]:
    pages_dir = project / "pages"
    desc_dir = project / "desc"
    if not pages_dir.exists() or not desc_dir.exists():
        return []

    declared = {
        n.get("htmlPath")
        for n in page_ops.iter_leaf_nodes(data.get("tree", []))
        if n.get("htmlPath")
    }
    known_ids = {
        n.get("id")
        for n in page_ops.iter_nodes(data.get("tree", []))
        if n.get("id")
    }
    orders = [
        n.get("order", 0)
        for n in page_ops.iter_nodes(data.get("tree", []))
        if isinstance(n.get("order", 0), int)
    ]
    next_order = max(orders, default=0) + 1
    discovered: list[dict] = []

    for html in sorted(pages_dir.glob("*.html")):
        md = desc_dir / f"{html.stem}.md"
        if not md.exists() or f"pages/{html.name}" in declared:
            continue

        node_id = html.stem
        if node_id in known_ids:
            node_id = f"{node_id}-{next_order}"
        node = {
            "id": node_id,
            "title": title_from_markdown(md),
            "htmlPath": f"pages/{html.name}",
            "mdPath": f"desc/{md.name}",
            "templateType": "custom",
            "order": next_order,
            "children": [],
        }
        data.setdefault("tree", []).append(node)
        known_ids.add(node_id)
        declared.add(f"pages/{html.name}")
        discovered.append(node)
        next_order += 1

    return discovered


def main() -> int:
    parser = argparse.ArgumentParser(description="扫描页面、同步目录和说明并执行校验")
    parser.add_argument("project_dir", nargs="?", default=".")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    project = Path(args.project_dir).resolve()
    data = page_ops.load_nav(project)
    discovered = discover_new_pages(project, data)
    if discovered:
        page_ops.save_nav(project, data)
        for node in discovered:
            print(f"➕ 自动登记：{node['id']}（{node['title']}）")
    else:
        print("ℹ️ 没有发现新的同名 HTML/MD 页面")

    result = sync_nav.sync_nav(project, verbose=args.verbose)
    if result != 0:
        return result
    return validate.main_for_project(project, quiet=not args.verbose)


if __name__ == "__main__":
    raise SystemExit(main())
