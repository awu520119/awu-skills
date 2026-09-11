#!/usr/bin/env python3
"""Publish a static page and optional Markdown document to a prototype viewer."""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

from init_viewer import initialize


ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class PublishError(RuntimeError):
    pass


def iter_nodes(nodes):
    for node in nodes:
        yield node
        yield from iter_nodes(node.get("children", []))


def find_node(nodes, node_id):
    return next((node for node in iter_nodes(nodes) if node.get("id") == node_id), None)


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "prototype-page"


def default_id(source: Path) -> str:
    name = source.parent.name if source.is_file() and source.name.lower() == "index.html" else source.stem
    return slugify(name)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def markdown_title(markdown: str) -> str | None:
    heading = re.search(r"(?m)^#\s+(.+?)\s*$", markdown)
    return heading.group(1).strip() if heading else None


def html_title(entry: Path) -> str | None:
    match = re.search(r"<title[^>]*>(.*?)</title>", read_text(entry), re.I | re.S)
    if match:
        return html.unescape(re.sub(r"\s+", " ", match.group(1))).strip()
    return None


def inline_markup(value: str) -> str:
    value = html.escape(value)
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)
    return re.sub(r"\[([^]]+)]\(([^)]+)\)", r'<a href="\2">\1</a>', value)


def markdown_body(markdown: str) -> str:
    output: list[str] = []
    list_tag = ""
    in_code = False

    def close_list() -> None:
        nonlocal list_tag
        if list_tag:
            output.append(f"</{list_tag}>")
            list_tag = ""

    for line in markdown.splitlines():
        if line.startswith("```"):
            close_list()
            output.append("</code></pre>" if in_code else "<pre><code>")
            in_code = not in_code
            continue
        if in_code:
            output.append(html.escape(line) + "\n")
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", line)
        bullet = re.match(r"^\s*[-*+]\s+(.+)$", line)
        ordered = re.match(r"^\s*\d+[.)]\s+(.+)$", line)
        if heading:
            close_list()
            level = len(heading.group(1))
            output.append(f"<h{level}>{inline_markup(heading.group(2))}</h{level}>")
        elif bullet or ordered:
            tag = "ul" if bullet else "ol"
            if list_tag != tag:
                close_list()
                list_tag = tag
                output.append(f"<{tag}>")
            output.append(f"<li>{inline_markup((bullet or ordered).group(1))}</li>")
        elif line.startswith("> "):
            close_list()
            output.append(f"<blockquote>{inline_markup(line[2:])}</blockquote>")
        elif line.strip():
            close_list()
            output.append(f"<p>{inline_markup(line)}</p>")
        else:
            close_list()

    close_list()
    if in_code:
        output.append("</code></pre>")
    return "\n".join(output)


def document_html(markdown: str, title: str) -> str:
    return f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>
*{{box-sizing:border-box}}body{{margin:0;color:#303338;font:14px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}}
main{{padding:20px;overflow-wrap:anywhere}}h1{{font-size:22px;border-bottom:1px solid #e9ebf0;padding-bottom:8px}}h2{{font-size:18px}}h3{{font-size:16px}}
h1,h2,h3,h4,h5,h6{{margin:18px 0 8px}}p{{margin:7px 0}}a{{color:#2776ff}}code{{padding:2px 5px;border-radius:3px;background:#f2f4f7}}
pre{{padding:12px;overflow:auto;border-radius:4px;background:#f5f7fa}}blockquote{{margin:10px 0;padding:4px 12px;border-left:3px solid #2776ff;background:#f5f8ff}}
</style></head><body><main>{markdown_body(markdown)}</main></body></html>"""


def copy_page(source: Path, destination: Path) -> None:
    staging = Path(tempfile.mkdtemp(prefix=f".{destination.name}-", dir=destination.parent))
    try:
        if source.is_dir():
            shutil.copytree(source, staging, dirs_exist_ok=True)
        else:
            shutil.copy2(source, staging / "index.html")
        if destination.exists():
            shutil.rmtree(destination)
        staging.rename(destination)
    finally:
        if staging.exists():
            shutil.rmtree(staging)


def sort_tree(nodes) -> None:
    nodes.sort(key=lambda node: (node.get("order", 999), node.get("title", "")))
    for node in nodes:
        sort_tree(node.get("children", []))


def save_nav(path: Path, data: dict) -> None:
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def validate(project: Path, data: dict) -> None:
    missing = []
    for node in iter_nodes(data.get("tree", [])):
        for key in ("htmlPath", "docPath"):
            relative = node.get(key)
            if relative and not (project / relative).is_file():
                missing.append(relative)
    if missing:
        raise PublishError("发布后缺少文件: " + ", ".join(missing))


def main() -> int:
    parser = argparse.ArgumentParser(description="发布静态页面到原型查看器")
    parser.add_argument("project")
    parser.add_argument("--source", required=True, help="HTML 文件或包含 index.html 的静态目录")
    parser.add_argument("--doc", help="可选 Markdown 说明文档")
    parser.add_argument("--id")
    parser.add_argument("--title")
    parser.add_argument("--order", type=int)
    parser.add_argument("--parent")
    parser.add_argument("--parent-title")
    parser.add_argument("--create-parent", action="store_true")
    parser.add_argument("--replace", action="store_true")
    parser.add_argument("--init", action="store_true")
    parser.add_argument("--project-name", default="原型查看器")
    args = parser.parse_args()

    project = Path(args.project).resolve()
    source = Path(args.source).resolve()
    document = Path(args.doc).resolve() if args.doc else None

    try:
        if not source.exists():
            raise PublishError(f"找不到页面源: {source}")
        entry = source / "index.html" if source.is_dir() else source
        if not entry.is_file() or entry.suffix.lower() != ".html":
            raise PublishError("页面源必须是 HTML 文件或包含 index.html 的目录")
        if document and (not document.is_file() or document.suffix.lower() != ".md"):
            raise PublishError("说明文档必须是 Markdown 文件")

        node_id = args.id or default_id(source)
        if not ID_PATTERN.fullmatch(node_id):
            raise PublishError("id 必须使用 kebab-case")
        if args.parent and not ID_PATTERN.fullmatch(args.parent):
            raise PublishError("parent id 必须使用 kebab-case")

        markers = (project / "index.html", project / "nav.json")
        if not all(path.is_file() for path in markers):
            if not args.init:
                raise PublishError("目标不是原型查看器项目；首次发布请添加 --init")
            initialize(project, args.project_name)

        data = json.loads((project / "nav.json").read_text(encoding="utf-8"))
        tree = data.setdefault("tree", [])
        existing = find_node(tree, node_id)
        page_dir = project / "pages" / node_id
        if (existing or page_dir.exists()) and not args.replace:
            raise PublishError(f"节点已存在: {node_id}；更新时请添加 --replace")

        parent = find_node(tree, args.parent) if args.parent and not existing else None
        new_parent = None
        if args.parent and not existing and not parent:
            if not args.create_parent:
                raise PublishError(f"父分组不存在: {args.parent}")
            new_parent = {
                "id": args.parent,
                "title": args.parent_title or args.parent,
                "order": 999,
                "children": [],
            }
            parent = new_parent

        markdown = read_text(document) if document else ""
        title = (
            args.title
            or markdown_title(markdown)
            or (existing or {}).get("title")
            or html_title(entry)
            or node_id.replace("-", " ").title()
        )
        copy_page(source, page_dir)

        doc_path = existing.get("docPath") if existing else None
        if document:
            docs_dir = project / "docs"
            docs_dir.mkdir(exist_ok=True)
            markdown_target = docs_dir / f"{node_id}.md"
            html_target = docs_dir / f"{node_id}.html"
            shutil.copy2(document, markdown_target)
            html_target.write_text(document_html(markdown, title), encoding="utf-8")
            doc_path = f"docs/{node_id}.html"

        node = {
            "id": node_id,
            "title": title,
            "htmlPath": f"pages/{node_id}/index.html",
            "order": args.order if args.order is not None else (existing or {}).get("order", 999),
            "children": (existing or {}).get("children", []),
        }
        if doc_path:
            node["docPath"] = doc_path

        if existing:
            existing.clear()
            existing.update(node)
        else:
            if new_parent:
                tree.append(new_parent)
            (parent.setdefault("children", []) if parent else tree).append(node)

        sort_tree(tree)
        save_nav(project / "nav.json", data)
        validate(project, data)
        print(f"已发布: {title} ({node_id})")
        print(f"页面: {page_dir / 'index.html'}")
        if doc_path:
            print(f"说明: {project / doc_path}")
        print(f"查看器: {project / 'index.html'}")
        return 0
    except (OSError, ValueError, json.JSONDecodeError, PublishError) as exc:
        print(f"发布失败: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
