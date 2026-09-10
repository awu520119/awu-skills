#!/usr/bin/env python3
"""初始化一个不依赖外部项目的原型查看器。"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


VIEWER = r'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>原型查看器</title>
<style>
*{box-sizing:border-box}html,body{height:100%;margin:0}body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:#1f2329;background:#f5f6f7}.app{height:100%;display:flex;flex-direction:column}.top{height:52px;display:flex;align-items:center;padding:0 20px;background:#1677ff;color:#fff}.brand{font-weight:600;font-size:16px}.meta{margin-left:auto;opacity:.85;font-size:12px}.body{min-height:0;flex:1;display:flex}.side{width:230px;overflow:auto;padding:16px 12px;background:#fff;border-right:1px solid #e5e6eb}.label{padding:5px 10px 10px;color:#86909c;font-size:12px}.item,.group{margin:2px 0}.item button,.group-title{width:100%;padding:9px 10px;border:0;border-radius:6px;text-align:left;background:transparent;color:#4e5969;cursor:pointer;font:inherit}.item button:hover,.group-title:hover{background:#f2f3f5}.item.active button{background:#e8f3ff;color:#1677ff;font-weight:600}.children{padding-left:14px}.group-title{font-weight:600;color:#303133;cursor:default}.workspace{min-width:0;flex:1;display:grid;grid-template-columns:minmax(0,1.6fr) minmax(320px,1fr);gap:12px;padding:12px}.panel{min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid #e5e6eb;border-radius:8px;overflow:hidden}.panel-title{height:40px;display:flex;align-items:center;padding:0 14px;border-bottom:1px solid #e5e6eb;color:#4e5969;font-size:13px}.frame{width:100%;height:100%;min-height:0;border:0;background:#fff}.error{padding:24px;color:#cf1322}@media(max-width:900px){.side{width:190px}.workspace{grid-template-columns:1fr}.panel.prd{display:none}}
</style></head><body><div class="app"><header class="top"><div class="brand" id="brand">原型查看器</div><div class="meta">HTML Demo + PRD</div></header><div class="body"><aside class="side"><div class="label">原型页面</div><div id="nav"></div></aside><main class="workspace"><section class="panel"><div class="panel-title" id="page-title">页面预览</div><iframe class="frame" id="page-frame" title="页面预览"></iframe></section><section class="panel prd"><div class="panel-title">产品需求文档</div><iframe class="frame" id="prd-frame" title="产品需求文档"></iframe></section></main></div></div>
<script>
const $=s=>document.querySelector(s);let tree=[];function flatten(nodes,out=[]){for(const n of nodes||[]){out.push(n);flatten(n.children,out)}return out}function render(nodes,host){for(const n of nodes||[]){if(n.children?.length){const group=document.createElement('div');group.className='group';const title=document.createElement('div');title.className='group-title';title.textContent=n.title;group.append(title);const children=document.createElement('div');children.className='children';render(n.children,children);group.append(children);host.append(group)}else{const wrap=document.createElement('div');wrap.className='item';wrap.dataset.id=n.id;const button=document.createElement('button');button.textContent=n.title;button.onclick=()=>select(n.id);wrap.append(button);host.append(wrap)}}}function select(id){const n=flatten(tree).find(x=>x.id===id);if(!n)return;document.querySelectorAll('.item').forEach(x=>x.classList.toggle('active',x.dataset.id===id));$('#page-title').textContent=n.title;$('#page-frame').src=n.htmlPath;$('#prd-frame').src='desc/'+id+'.html';history.replaceState(null,'','?node='+encodeURIComponent(id))}async function boot(){try{const data=await fetch('nav.json').then(r=>r.json());tree=data.tree||[];$('#brand').textContent=data.title||'原型查看器';render(tree,$('#nav'));const requested=new URLSearchParams(location.search).get('node');const first=flatten(tree).find(n=>!n.children?.length);select(requested||first?.id)}catch(e){$('#nav').innerHTML='<div class="error">无法读取 nav.json</div>'}}boot();
</script></body></html>
'''


def main() -> int:
    parser = argparse.ArgumentParser(description="初始化独立原型查看器项目")
    parser.add_argument("project")
    parser.add_argument("--name", default="原型查看器")
    args = parser.parse_args()
    project = Path(args.project).resolve()
    (project / "pages").mkdir(parents=True, exist_ok=True)
    (project / "desc").mkdir(parents=True, exist_ok=True)
    if not (project / "index.html").exists():
        (project / "index.html").write_text(VIEWER, encoding="utf-8")
    if not (project / "nav.json").exists():
        (project / "nav.json").write_text(json.dumps({"title": args.name, "tree": []}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
