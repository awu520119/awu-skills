"""Browser checks test rendered behavior, including rejection of regressions."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from playwright.sync_api import sync_playwright

SKILL = Path(__file__).resolve().parents[1]
SCRIPT = SKILL / 'scripts/check-ui.py'
spec = importlib.util.spec_from_file_location('check_ui', SCRIPT)
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)
DESIGN = json.loads((SKILL / 'templates/admin/design/system.json').read_text())
HTML = '''<!doctype html><html><head><style>
body { margin: 0; }
.query-search-control { width: 200px; height: 32px; display: flex; }
.query-search-control button { width: 40px; flex-shrink: 0; }
.ant-pagination { position: fixed; bottom: 10px; }
.ant-drawer-content-wrapper { position: fixed; right: 0; top: 0; width: 600px; max-width: 100vw; }
.ant-drawer-body { height: 300px; }
.ant-drawer-footer { height: 48px; }
.form-grid { display: grid; grid-template-columns: 1fr; column-gap: 16px; }
</style></head><body><main class="admin-page">
<div class="query-search-control"><span>查询</span><button class="query-search-button">搜索</button></div>
<div class="ant-pagination"><span class="ant-pagination-total-text">共 24 条</span></div>
<div class="design-drawer design-drawer-form ant-drawer-open"><div class="ant-drawer-content-wrapper">
<div class="ant-drawer-body"><form class="design-form"><div class="form-grid"><span>名称</span><span>状态</span></div></form></div>
<div class="ant-drawer-footer">保存</div></div></div>
</main></body></html>'''


class BrowserCheckTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.runtime = sync_playwright().start()
        cls.browser = cls.runtime.chromium.launch(
            channel=os.environ.get('PROTOTYPE_BROWSER_CHANNEL', 'chrome'), headless=True,
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.runtime.stop()

    def test_layout_rejects_real_overflow_and_design_drift(self):
        page = self.browser.new_page(viewport={'width': 1440, 'height': 900})
        try:
            page.set_content(HTML)
            self.assertEqual(page.evaluate(checker.GEOMETRY, DESIGN), [])
            page.add_style_tag(content='body { min-width: 1800px } .query-search-control { width: 260px } .form-grid { column-gap: 30px }')
            errors = page.evaluate(checker.GEOMETRY, DESIGN)
            self.assertIn('页面存在横向溢出', errors)
            self.assertIn('紧凑搜索宽度不符合配置', errors)
            self.assertIn('表单列间距不符合配置', errors)
            page.evaluate("() => { const el = document.createElement('div'); el.className = 'ant-select-dropdown'; el.style.cssText = 'position:fixed;left:-200px;width:100px;height:100px'; document.body.append(el); }")
            self.assertIn('弹出菜单超出视口', page.evaluate(checker.GEOMETRY, DESIGN))
        finally:
            page.close()

    def test_drawer_footer_overlap_and_pagination_are_detected(self):
        page = self.browser.new_page(viewport={'width': 1440, 'height': 900})
        try:
            page.set_content(HTML)
            page.locator('.ant-pagination-total-text').evaluate('(el) => el.remove()')
            page.add_style_tag(content='.ant-drawer-footer { position: absolute; top: 100px } .ant-pagination { top: 920px; bottom: auto }')
            errors = page.evaluate(checker.GEOMETRY, DESIGN)
            self.assertIn('分页缺少总数', errors)
            self.assertIn('表格滚动模式下分页超出视口', errors)
            self.assertIn('抽屉正文与底栏重叠', errors)
        finally:
            page.close()

    def test_cli_records_failure_and_does_not_overwrite_evidence(self):
        with tempfile.TemporaryDirectory(prefix='admin-ui-check-test-') as temporary:
            project = Path(temporary)
            (project / 'dist').mkdir()
            (project / 'design').mkdir()
            (project / 'dist/admin-share.html').write_text(HTML)
            (project / 'design/system.json').write_text(json.dumps(DESIGN))
            (project / 'prototype-pages.json').write_text(json.dumps({'pages': [
                {'id': 'fixture', 'hash': '#/fixture'},
            ]}))
            # The entry layout passes. The explicit business assertion must fail.
            (project / 'ui-checks.json').write_text(json.dumps([{
                'page': 'fixture', 'name': '错误结果', 'steps': [
                    {'action': 'text', 'selector': '.ant-pagination-total-text', 'value': '共 999 条'},
                ],
            }]))
            output = project / 'report'
            command = [sys.executable, str(SCRIPT), str(project), '--output', str(output)]
            result = subprocess.run(command, capture_output=True, text=True, timeout=90)
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            report_file = output / 'report.json'
            original = report_file.read_bytes()
            report = json.loads(original)
            self.assertFalse(report['passed'])
            self.assertEqual(len(report['results']), 4)
            self.assertEqual(sum(row['passed'] for row in report['results']), 2)
            self.assertEqual(len(report['sha256']), 64)
            self.assertTrue(list(output.glob('*.png')))
            repeated = subprocess.run(command, capture_output=True, text=True, timeout=15)
            self.assertNotEqual(repeated.returncode, 0)
            self.assertEqual(report_file.read_bytes(), original)


if __name__ == '__main__':
    unittest.main()
