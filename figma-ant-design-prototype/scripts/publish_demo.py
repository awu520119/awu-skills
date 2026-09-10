#!/usr/bin/env python3
"""将 HTML/静态目录与 PRD 发布为原型查看器页面。"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


class PublishError(RuntimeError):
    pass


def iter_nodes(nodes):
    for node in nodes:
        yield node
        yield from iter_nodes(node.get("children", []))


def find_node(nodes, node_id):
    return next((node for node in iter_nodes(nodes) if node.get("id") == node_id), None)


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "prototype-page"


def source_default_id(source: Path) -> str:
    name = source.parent.name if source.is_file() and source.name.lower() == "index.html" else source.stem
    return slugify(name)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def discover_prd(source: Path) -> Path | None:
    candidates: list[Path]
    if source.is_file():
        candidates = [source.with_suffix(".md"), source.parent / "prd.md", source.parent / "PRD.md"]
    else:
        candidates = [
            source.parent / f"{source.name}.md",
            source / "prd.md",
            source / "PRD.md",
            source / "README.md",
        ]
    return next((candidate.resolve() for candidate in candidates if candidate.is_file()), None)


def extract_title(prd_text: str, entry_html: Path, fallback: str) -> str:
    heading = re.search(r"(?m)^#\s+(.+?)\s*$", prd_text)
    if heading:
        return heading.group(1).strip()
    if entry_html.is_file():
        match = re.search(r"<title[^>]*>(.*?)</title>", read_text(entry_html), re.I | re.S)
        if match:
            return html.unescape(re.sub(r"\s+", " ", match.group(1))).strip()
    return fallback.replace("-", " ").title()


def ensure_project(project: Path, *, init: bool, project_name: str | None) -> None:
    markers = [project / "index.html", project / "nav.json", project / "pages", project / "desc"]
    if all(path.exists() for path in markers):
        return
    if not init:
        missing = ", ".join(str(path) for path in markers if not path.exists())
        raise PublishError(f"目标不是完整的原型查看器项目，缺少: {missing}；新建项目可加 --init")
    initializer = SKILL_DIR / "scripts" / "init_project.py"
    command = [sys.executable, str(initializer), str(project)]
    if project_name:
        command.extend(["--name", project_name])
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        detail = (result.stdout + result.stderr).strip()
        raise PublishError(detail or "原型查看器项目初始化失败")


def inline_markup(value: str) -> str:
    value = html.escape(value)
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)
    value = re.sub(r"\[([^]]+)]\(([^)]+)\)", r'<a href="\2">\1</a>', value)
    return value


def basic_markdown(markdown: str) -> str:
    output: list[str] = []
    in_code = False
    list_tag = ""

    def close_list() -> None:
        nonlocal list_tag
        if list_tag:
            output.append(f"</{list_tag}>")
            list_tag = ""

    for line in markdown.splitlines():
        if line.startswith("```"):
            close_list()
            if in_code:
                output.append("</code></pre>")
            else:
                output.append("<pre><code>")
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
        elif not line.strip():
            close_list()
        elif re.fullmatch(r"\s*([-*_])\1\1+\s*", line):
            close_list()
            output.append("<hr>")
        else:
            close_list()
            output.append(f"<p>{inline_markup(line)}</p>")
    close_list()
    if in_code:
        output.append("</code></pre>")
    return "\n".join(output)


def fallback_desc_html(markdown: str, title: str) -> str:
    body = basic_markdown(markdown)
    return f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>
*{{box-sizing:border-box}}body{{margin:0;color:#303133;background:#fff;font:14px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}}
main{{padding:20px;overflow-wrap:anywhere}}h1{{font-size:22px;border-bottom:1px solid #e4e7ed;padding-bottom:8px}}h2{{font-size:18px}}h3{{font-size:16px}}
h1,h2,h3,h4,h5,h6{{margin:18px 0 8px}}p{{margin:7px 0}}code{{background:#f2f3f5;padding:2px 5px;border-radius:4px}}pre{{background:#f6f8fa;padding:12px;overflow:auto;border-radius:6px}}
blockquote{{margin:10px 0;padding:4px 12px;border-left:3px solid #1677ff;background:#f5f8ff;color:#606266}}a{{color:#1677ff}}li{{margin:3px 0}}.notice{{font-size:12px;color:#909399;margin-bottom:12px}}
</style></head><body><main><div class="notice">基础 Markdown 渲染模式</div>{body}</main></body></html>"""


def render_nav_js(data: dict) -> str:
    return "// 由发布脚本生成；不要手改。\nwindow.NAV_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"


def sync_project(project: Path, data: dict, node_id: str, prd_text: str, title: str) -> str:
    (project / "nav.js").write_text(render_nav_js(data), encoding="utf-8")
    (project / "desc" / f"{node_id}.html").write_text(fallback_desc_html(prd_text, title), encoding="utf-8")
    return "builtin"


def validate_project(project: Path, data: dict) -> None:
    missing = [str(path) for path in (project / "index.html", project / "nav.json") if not path.is_file()]
    for node in iter_nodes(data.get("tree", [])):
        for relative in (node.get("htmlPath"), node.get("mdPath"), f"desc/{node.get('id')}.html"):
            if relative and not (project / relative).is_file():
                missing.append(str(project / relative))
    if missing:
        raise PublishError("项目校验失败，缺少: " + ", ".join(missing))


def has_module_script(entry: Path) -> bool:
    return bool(re.search(r"<script[^>]+type=[\"']module[\"']", read_text(entry), re.I))


def main() -> int:
    parser = argparse.ArgumentParser(description="将 HTML 与 PRD 发布到原型查看器")
    parser.add_argument("prototype_project", help="目标原型查看器项目目录")
    source_group = parser.add_mutually_exclusive_group(required=True)
    source_group.add_argument("--source", help="HTML 文件、静态目录或 Vite dist（推荐）")
    source_group.add_argument("--dist", help="兼容参数：Vite dist 目录")
    source_group.add_argument("--html", help="兼容参数：HTML 文件或静态目录")
    parser.add_argument("--prd", help="PRD Markdown；缺省时自动寻找同名 .md / prd.md")
    parser.add_argument("--id", help="节点 id；缺省时从页面文件或目录名生成")
    parser.add_argument("--title", help="展示标题；缺省时取 PRD H1 或 HTML title")
    parser.add_argument("--parent", default="", help="父分组 id")
    parser.add_argument("--parent-title", default=None)
    parser.add_argument("--order", type=int, default=999)
    parser.add_argument("--create-parent", action="store_true")
    parser.add_argument("--replace", action="store_true", help="明确允许更新同 id 发布物")
    parser.add_argument("--init", action="store_true", help="目标不存在时初始化原型查看器项目")
    parser.add_argument("--project-name", help="配合 --init 设置项目显示名")
    args = parser.parse_args()

    project = Path(args.prototype_project).resolve()
    source = Path(args.source or args.dist or args.html).resolve()
    try:
        if not source.exists():
            raise PublishError(f"找不到页面源: {source}")
        if source.is_dir():
            entry = source / "index.html"
            if not entry.is_file():
                raise PublishError(f"静态目录缺少 index.html: {entry}")
        elif source.suffix.lower() == ".html":
            entry = source
        else:
            raise PublishError(f"页面源必须是 .html 文件或包含 index.html 的目录: {source}")

        prd = Path(args.prd).resolve() if args.prd else discover_prd(source)
        if not prd or not prd.is_file():
            raise PublishError("找不到对应 PRD；请在页面旁放置同名 .md / prd.md，或使用 --prd 指定")
        prd_text = read_text(prd)
        node_id = args.id or source_default_id(source)
        if not ID_RE.fullmatch(node_id):
            raise PublishError("--id 必须是 kebab-case（小写字母、数字、连字符）")
        title = args.title or extract_title(prd_text, entry, node_id)

        ensure_project(project, init=args.init, project_name=args.project_name)
        data = json.loads((project / "nav.json").read_text(encoding="utf-8"))
        tree = data.setdefault("tree", [])
        existing = find_node(tree, node_id)
        page_dir = project / "pages" / node_id
        desc_file = project / "desc" / f"{node_id}.md"
        if (existing or page_dir.exists() or desc_file.exists()) and not args.replace:
            raise PublishError(f"发布节点或文件已存在: {node_id}；更新时请加 --replace")

        parent = find_node(tree, args.parent) if args.parent else None
        if args.parent and not parent:
            if not args.create_parent:
                raise PublishError(f"父分组不存在: {args.parent}；可加 --create-parent")
            parent = {"id": args.parent, "title": args.parent_title or args.parent, "order": 999, "children": []}
            tree.append(parent)

        staging = Path(tempfile.mkdtemp(prefix=f".{node_id}-", dir=project / "pages"))
        try:
            if source.is_dir():
                shutil.copytree(source, staging, dirs_exist_ok=True)
            else:
                shutil.copy2(source, staging / "index.html")
            if page_dir.exists():
                shutil.rmtree(page_dir)
            staging.rename(page_dir)
        finally:
            if staging.exists():
                shutil.rmtree(staging)
        desc_file.write_text(prd_text, encoding="utf-8")

        children = existing.get("children", []) if existing else []
        node = {
            "id": node_id,
            "title": title,
            "htmlPath": f"pages/{node_id}/index.html",
            "mdPath": f"desc/{node_id}.md",
            "templateType": "custom",
            "order": args.order,
            "children": children,
        }
        if existing:
            existing.clear()
            existing.update(node)
        elif parent is not None:
            parent.setdefault("children", []).append(node)
        else:
            tree.append(node)

        data["lastSyncAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        (project / "nav.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        render_mode = sync_project(project, data, node_id, prd_text, title)

        validate_project(project, data)

        print(f"✅ 已发布: {title} ({node_id})")
        print(f"   页面: {page_dir / 'index.html'}")
        print(f"   PRD:  {desc_file}")
        print(f"   查看器: {project / 'index.html'}")
        print("ℹ️ 使用 Skill 内置查看器和 Markdown 渲染")
        if has_module_script(page_dir / "index.html"):
            print(f"🌐 检测到 ES module，请运行: python3 {SKILL_DIR / 'scripts' / 'preview.py'} {project} --node {node_id}")
        else:
            print(f"🌐 推荐预览: python3 {SKILL_DIR / 'scripts' / 'preview.py'} {project} --node {node_id}")
        return 0
    except (OSError, json.JSONDecodeError, PublishError) as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
