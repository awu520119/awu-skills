#!/usr/bin/env python3
"""检查本仓库技能的基本元数据、说明链接和 HTML 资源边界，仅用 Python 标准库。

不替代完整 YAML 解析或浏览器检查；模板资源按复制到 pages/ 后的位置解析。
用法：python3 scripts/check_skills.py
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
IGNORE = {'node_modules', 'dist', '.git', '__pycache__', 'share', '.published'}
ALLOWED = {'name', 'description', 'license', 'allowed-tools', 'metadata'}

class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in {'script', 'img', 'iframe', 'source'} and values.get('src'):
            self.paths.append(values['src'])
        if tag == 'link' and values.get('rel') == 'stylesheet' and values.get('href'):
            self.paths.append(values['href'])

def files(folder):
    return (p for p in folder.rglob('*') if p.is_file() and not any(part in IGNORE for part in p.relative_to(folder).parts))

def inside(folder, target):
    return target == folder or folder in target.parents

def main():
    errors = []
    skills = sorted(p.parent for p in ROOT.glob('*/SKILL.md'))
    for skill in skills:
        paths = list(files(skill))
        content = (skill / 'SKILL.md').read_text()
        header = re.match(r'^---\n(.*?)\n---\n', content, re.S)
        if not header:
            errors.append(f'{skill.name}: 缺少 frontmatter')
            continue
        keys = set(re.findall(r'^(\w[\w-]*):', header[1], re.M))
        if keys - ALLOWED:
            errors.append(f'{skill.name}: 不支持的元数据 {keys - ALLOWED}')
        match = re.search(r'^name:\s*(.+)$', header[1], re.M)
        if not match or match[1].strip() != skill.name or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', skill.name):
            errors.append(f'{skill.name}: 名称与目录不一致或格式错误')
        if not re.search(r'^description:\s*\S', header[1], re.M):
            errors.append(f'{skill.name}: 缺少 description')
        for path in paths:
            if path.is_symlink() and not inside(skill, path.resolve()):
                errors.append(f'{path.relative_to(ROOT)}: 符号链接指向包外')
            if path.suffix == '.md':
                text = path.read_text()
                if re.search(r'/Users/[^\s`]+|/home/[^\s`]+|[A-Z]:\\Users\\', text):
                    errors.append(f'{path.relative_to(ROOT)}: 说明含个人绝对路径')
                for match in re.finditer(r'!?\[[^\]\n]*\]\(([^)\n]+)\)', text):
                    target = match[1].strip().strip('<>')
                    if target.startswith(('#', 'http:', 'https:', 'mailto:', 'data:')) or '<' in target or '{' in target:
                        continue
                    resolved = (path.parent / unquote(target.split('#')[0])).resolve()
                    if not inside(skill, resolved) or not resolved.exists():
                        errors.append(f'{path.relative_to(ROOT)}: 链接缺失或越界 {target}')
            if path.suffix == '.html':
                parser = Resources()
                parser.feed(path.read_text())
                # PC 模板设计为复制到项目 pages/ 后使用。
                base = skill / 'pages' if 'templates' in path.relative_to(skill).parts else path.parent
                for resource in parser.paths:
                    if resource.startswith(('data:', '#', 'about:')) or '{{' in resource:
                        continue
                    url = urlsplit(resource)
                    if url.scheme or url.netloc:
                        errors.append(f'{path.relative_to(ROOT)}: 外部运行资源 {resource}')
                        continue
                    if resource == '/src/main.tsx' and (path.parent / 'src/main.tsx').is_file():
                        continue  # Vite 开发入口，构建会转换为相对资源。
                    resolved = (base / unquote(url.path)).resolve()
                    if not inside(skill, resolved) or not resolved.is_file():
                        errors.append(f'{path.relative_to(ROOT)}: 运行资源缺失或越界 {resource}')
        print(f'已检查 {skill.name}：{len(paths)} 个包内文件')
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print(f'通过：{len(skills)} 个技能的基础元数据、说明链接与 HTML 资源边界')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
