#!/usr/bin/env python3
"""同步 nav.json → nav.js，并触发 ``build_desc`` 渲染 ``desc/<id>.html``。

用法:
    python sync_nav.py <project_dir> [--verbose]

行为:
1. 读取 ``nav.json``，按 ``order`` 排序整棵树；
2. 校验所有 htmlPath/mdPath 指向文件是否存在；缺失则警告（不阻塞）；
3. 写入 ``nav.js``（``window.NAV_DATA = {...}``）；
4. 调用 ``build_desc`` 为每个叶子节点生成 ``desc/<id>.html``（含 mermaid 与图片内联）；
5. 自动清理陈旧的 ``desc/<id>.desc.js`` 与不属于 nav 的 html。
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

# Ensure stdout can print emojis on Windows GBK terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass


SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from page_ops import iter_leaf_nodes  # type: ignore  # noqa: E402
import build_desc  # type: ignore  # noqa: E402


def sort_tree(tree):
    for n in tree:
        if n.get("children"):
            sort_tree(n["children"])
    tree.sort(key=lambda x: (x.get("order", 999), x.get("title", "")))


def render_nav_js(data: dict) -> str:
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return f"// 由 sync_nav.py 自动生成；不要手改。\nwindow.NAV_DATA = {body};\n"


def sync_nav(project_dir: Path, verbose: bool = False, *,
             skip_existing: bool = False) -> int:
    project_dir = project_dir.resolve()
    nav_json = project_dir / "nav.json"
    if not nav_json.exists():
        print(f"❌ 找不到 {nav_json}", file=sys.stderr)
        return 1

    data = json.loads(nav_json.read_text(encoding="utf-8"))
    tree = data.get("tree", [])
    sort_tree(tree)
    data["tree"] = tree
    data["lastSyncAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    nav_json.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    nav_js = project_dir / "nav.js"
    nav_js.write_text(render_nav_js(data), encoding="utf-8")
    if verbose:
        print(f"✅ {nav_js} 已生成")

    # 触发 desc html 渲染（build_desc 内部清理陈旧产物）
    if verbose:
        print("📝 触发 build_desc 渲染 desc/<id>.html")
    build_desc.build_all(project_dir, clean=True, quiet=not verbose,
                         skip_existing=skip_existing)

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="同步 nav.json → nav.js 并触发 desc html 渲染")
    parser.add_argument("project_dir")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    return sync_nav(Path(args.project_dir), args.verbose)


if __name__ == "__main__":
    sys.exit(main())
