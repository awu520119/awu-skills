#!/usr/bin/env python3
"""add_page.py / remove_page.py / rename_page.py / sync_desc.py 共享的工具。"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Iterable

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass


def load_nav(project_dir: Path) -> dict:
    """读取 nav.json；缺失或解析失败时给出友好提示而非裸 traceback。"""
    p = project_dir / "nav.json"
    if not p.exists():
        print(f"❌ 找不到 {p}（请确认当前目录是原型项目根目录）", file=sys.stderr)
        sys.exit(1)
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"❌ {p} 解析失败：{e}", file=sys.stderr)
        sys.exit(1)


def save_nav(project_dir: Path, data: dict) -> None:
    (project_dir / "nav.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def find_node(tree, node_id):
    for n in tree:
        if n["id"] == node_id:
            return n
        if n.get("children"):
            hit = find_node(n["children"], node_id)
            if hit:
                return hit
    return None


def iter_nodes(tree) -> Iterable[dict]:
    for n in tree:
        yield n
        if n.get("children"):
            yield from iter_nodes(n["children"])


def iter_leaf_nodes(tree) -> Iterable[dict]:
    """只迭代同时拥有 ``htmlPath`` 与 ``mdPath`` 的叶子节点（描述页面）。"""
    for n in iter_nodes(tree):
        if n.get("htmlPath") and n.get("mdPath"):
            yield n
