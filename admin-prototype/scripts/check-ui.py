#!/usr/bin/env python3
"""Check exported local HTML; browser dependencies live outside business projects."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from datetime import datetime, timezone


GEOMETRY = r"""(design) => {
  const failures = [];
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const check = (ok, message) => { if (!ok) failures.push(message); };
  const near = (a, b) => Math.abs(a - b) <= 2;
  check(document.documentElement.scrollWidth <= innerWidth + 2, '页面存在横向溢出');
  for (const el of document.querySelectorAll('.query-search-control')) {
    if (!visible(el)) continue;
    const rect = el.getBoundingClientRect();
    check(near(rect.width, design.controls.queryWidth), '紧凑搜索宽度不符合配置');
    check(near(rect.height, design.controls.height), '紧凑搜索高度不符合配置');
    const button = el.querySelector('.query-search-button');
    check(!!button && near(button.getBoundingClientRect().width, design.controls.queryButtonWidth), '搜索按钮宽度不符合配置');
  }
  for (const el of document.querySelectorAll('.ant-select-dropdown, .ant-dropdown')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    check(r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2, '弹出菜单超出视口');
  }
  for (const el of document.querySelectorAll('.ant-pagination')) {
    if (!visible(el)) continue;
    check(!!el.querySelector('.ant-pagination-total-text'), '分页缺少总数');
    if (design.layout.scrollMode === 'table') {
      const r = el.getBoundingClientRect();
      check(r.bottom <= innerHeight + 2 && r.top >= 0, '表格滚动模式下分页超出视口');
    }
  }
  for (const el of document.querySelectorAll('.design-drawer.ant-drawer-open')) {
    if (!visible(el)) continue;
    const wrapper = el.querySelector('.ant-drawer-content-wrapper');
    if (!wrapper) { failures.push('抽屉缺少内容容器'); continue; }
    const r = wrapper.getBoundingClientRect();
    const kind = el.classList.contains('design-drawer-form') ? 'formWidth' : 'detailWidth';
    const expectedWidth = el.classList.contains('design-drawer-form-small') ? 520 : design.drawer[kind];
    check(near(r.width, Math.min(expectedWidth, innerWidth)), '抽屉宽度不符合配置');
    check(r.left >= -2 && r.right <= innerWidth + 2, '抽屉超出视口');
    const footer = el.querySelector('.ant-drawer-footer');
    const body = el.querySelector('.ant-drawer-body');
    if (footer && visible(footer)) {
      const f = footer.getBoundingClientRect();
      check(f.top >= 0 && f.bottom <= innerHeight + 2, '抽屉底栏不可见');
      if (body) check(body.getBoundingClientRect().bottom <= f.top + 2, '抽屉正文与底栏重叠');
    }
  }
  for (const el of document.querySelectorAll('.design-form .form-grid')) {
    if (!visible(el)) continue;
    const css = getComputedStyle(el);
    const columns = innerWidth <= 700 ? 1 : design.form.columns;
    check(css.gridTemplateColumns.split(' ').length === columns, '表单列数不符合配置');
    check(near(parseFloat(css.columnGap), design.form.columnGap), '表单列间距不符合配置');
  }
  return failures;
}"""


def locator_for(page, step):
    target = page.get_by_role(step['role'], name=step['name'], exact=True) if 'role' in step else page.locator(step['selector'])
    return target.nth(step['index']) if 'index' in step else target


def run_step(page, step, expect):
    action = step['action']
    target = locator_for(page, step)
    if action == 'click':
        target.click()
    elif action == 'fill':
        target.fill(step['value'])
    elif action == 'press':
        target.press(step['value'])
    elif action == 'select':
        target.select_option(step['value'])
    elif action == 'text':
        expect(target).to_contain_text(step['value'])
    elif action == 'value':
        expect(target).to_have_value(step['value'])
    elif action == 'count':
        expect(target).to_have_count(step['value'])
    elif action == 'visible':
        expect(target).to_be_visible()
    elif action == 'hidden':
        expect(target).to_be_hidden()
    else:
        raise ValueError(f'不支持的操作：{action}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', type=Path)
    parser.add_argument('--output', type=Path, required=True, help='本次验收的新目录，避免覆盖历史证据')
    parser.add_argument('--scenarios', type=Path, help='默认读取项目 ui-checks.json；文件缺失时仅检查布局')
    parser.add_argument('--page', action='append', help='仅检查指定页面 ID，可重复使用')
    args = parser.parse_args()
    project = args.project.resolve()
    html = project / 'dist/admin-share.html'
    config = json.loads((project / 'prototype-pages.json').read_text())
    design = json.loads((project / 'design/system.json').read_text())
    scenario_file = args.scenarios or project / 'ui-checks.json'
    if args.scenarios and not scenario_file.is_file():
        raise ValueError('指定的场景文件不存在')
    scenarios = json.loads(scenario_file.read_text()) if scenario_file.exists() else []
    ids = {item['id'] for item in config['pages']}
    if args.page and not set(args.page) <= ids:
        raise ValueError('指定了未登记的页面 ID')
    for item in config['pages']:
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', item['id']) or not item['hash'].startswith('#/'):
            raise ValueError('页面 ID 或 Hash 路由无效')
    for scenario in scenarios:
        if scenario['page'] not in ids or not scenario.get('steps'):
            raise ValueError('场景必须对应登记页面并包含操作')
        if not any(step['action'] in ('text', 'value', 'count', 'visible', 'hidden') for step in scenario['steps']):
            raise ValueError('操作场景至少需要一个结果断言')
    digest = hashlib.sha256(html.read_bytes()).hexdigest()
    args.output.mkdir(parents=True, exist_ok=False)
    report = {
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'artifact': str(html), 'sha256': digest,
        'design': design, 'scenarios': scenarios,
        'scope': '布局及已声明操作；截图仍需视觉审阅，不代表全部业务验收',
        'results': [],
    }
    try:
        from playwright.sync_api import sync_playwright, expect
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                channel=os.environ.get('PROTOTYPE_BROWSER_CHANNEL', 'chrome'), headless=True,
            )
            try:
                for width, height in [(1440, 900), (1920, 1080)]:
                    for item in config['pages']:
                        if args.page and item['id'] not in args.page:
                            continue
                        cases = [None] + [s for s in scenarios if s['page'] == item['id']]
                        for case_index, scenario in enumerate(cases):
                            result = {'page': item['id'], 'viewport': [width, height],
                                      'scenario': scenario['name'] if scenario else '入口布局',
                                      'failures': [], 'screenshots': [], 'stepsCompleted': 0}
                            report['results'].append(result)
                            context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
                            page = context.new_page()
                            page.set_default_timeout(8000)
                            page.on('pageerror', lambda error: result['failures'].append(str(error)))
                            page.on('console', lambda message: result['failures'].append(message.text) if message.type == 'error' else None)

                            def block_network(route):
                                result['failures'].append(f'离线页面请求网络资源：{route.request.url}')
                                route.abort()

                            context.route(re.compile(r'^https?://'), block_network)

                            def checkpoint(label):
                                page.evaluate('() => document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))')
                                result['failures'].extend(page.evaluate(GEOMETRY, design))
                                filename = f"{item['id']}-{width}-{case_index}-{label}.png"
                                page.screenshot(path=str(args.output / filename), animations='disabled')
                                result['screenshots'].append(filename)

                            try:
                                page.goto(html.as_uri() + item['hash'], wait_until='load')
                                ready = item.get('ready', {})
                                page.locator(ready.get('selector', '.admin-page')).wait_for(state='visible')
                                if ready.get('text'):
                                    expect(page.locator(ready['selector'])).to_contain_text(ready['text'])
                                if scenario:
                                    for index, step in enumerate(scenario['steps']):
                                        run_step(page, step, expect)
                                        result['stepsCompleted'] += 1
                                        if step.get('checkpoint'):
                                            checkpoint(str(index))
                                checkpoint('final')
                            except Exception as error:
                                result['failures'].append(str(error))
                                try:
                                    checkpoint('failure')
                                except Exception:
                                    pass
                            finally:
                                context.close()
                            result['passed'] = not result['failures']
            finally:
                browser.close()
    except Exception as error:
        report['setupError'] = str(error)
    report['passed'] = bool(report['results']) and not report.get('setupError') and all(r['passed'] for r in report['results'])
    report['businessScenariosExecuted'] = sum(r['scenario'] != '入口布局' for r in report['results'])
    (args.output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(f"{'通过' if report['passed'] else '失败'}：{args.output / 'report.json'}")
    if report.get('setupError'):
        print('浏览器环境不可用：' + report['setupError'], file=sys.stderr)
        print('请在独立虚拟环境安装 scripts/requirements-browser.txt；默认使用本机 Chrome。', file=sys.stderr)
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f'验收输入无效：{error}', file=sys.stderr)
        sys.exit(1)
