#!/usr/bin/env python3
"""用零依赖 HTTP 服务预览原型查看器项目。"""
from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
import sys
import webbrowser
from pathlib import Path
from urllib.parse import quote


class ReusableThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


def main() -> int:
    parser = argparse.ArgumentParser(description="启动原型查看器本地预览")
    parser.add_argument("prototype_project")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--node", help="启动后直接选中的节点 id")
    parser.add_argument("--open", action="store_true", help="自动打开默认浏览器")
    args = parser.parse_args()

    project = Path(args.prototype_project).resolve()
    if not (project / "index.html").is_file():
        print(f"❌ 找不到原型查看器: {project / 'index.html'}", file=sys.stderr)
        return 1
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(project))
    try:
        server = ReusableThreadingServer((args.host, args.port), handler)
    except OSError as exc:
        print(f"❌ 无法监听 {args.host}:{args.port}: {exc}", file=sys.stderr)
        return 1
    url = f"http://{args.host}:{args.port}/"
    if args.node:
        url += f"?node={quote(args.node)}"
    print(f"✅ 原型查看器已启动: {url}")
    print("按 Ctrl+C 停止")
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
