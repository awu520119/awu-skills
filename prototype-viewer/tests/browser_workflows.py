"""Optional browser regressions: python3 tests/browser_workflows.py (Playwright required)."""
from pathlib import Path
import json
import os
import subprocess
import sys
import tempfile
import unittest
from playwright.sync_api import sync_playwright

SKILL = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL / 'scripts'))
from browser_runtime import launch_browser


class ShellBrowserWorkflows(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='viewer-browser-')
        cls.project = Path(cls.temp.name) / 'viewer'
        subprocess.run(['bash', str(SKILL / 'scripts/init-viewer.sh'), str(cls.project)], check=True, capture_output=True)
        pages = []
        for index, (key, title, device) in enumerate([('alpha', 'Alpha', 'pc'), ('beta', 'Beta', 'pc'), ('phone', 'Phone', 'mobile')]):
            target = 'beta' if key == 'alpha' else 'alpha'
            (cls.project / f'pages/{key}.html').write_text(f'''<!doctype html><html><head><meta name="device" content="{device}"><script src="../assets/viewer-bridge.js"></script></head><body><h1>{title}</h1><button onclick="gotoNode('{target}')">关联页面</button></body></html>''')
            (cls.project / f'desc/{key}.md').write_text(f'# {title} 说明\n\n## 业务规则\n\n测试说明。')
            pages.append({'id': key, 'title': title, 'order': index, 'htmlPath': f'pages/{key}.html', 'mdPath': f'desc/{key}.md'})
        (cls.project / 'nav.manual.json').write_text(json.dumps({'projectName': 'React shell test', 'tree': [{'id': 'group', 'title': 'Manual', 'order': 0, 'children': pages}]}))
        # Prove normal sync/export does not rely on a Node command in PATH.
        environment = {**os.environ, 'PATH': '/usr/bin:/bin', 'PYTHONDONTWRITEBYTECODE': '1'}
        subprocess.run([sys.executable, str(cls.project / 'scripts/export_single_file.py'), str(cls.project)], env=environment, check=True, capture_output=True)
        cls.playwright = sync_playwright().start()
        cls.browser = launch_browser(cls.playwright)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.temp.cleanup()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width': 1440, 'height': 900})
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.page.close()
        self.assertFalse(self.errors, self.errors)

    def open(self, offline=False, node='alpha'):
        path = self.project / ('share/prototype-viewer.html' if offline else 'index.html')
        self.page.goto(path.as_uri() + '?node=' + node)
        self.page.wait_for_function('typeof window.gotoNode === "function"')
        self.prototype().get_by_role('heading', name=node.title(), exact=True).wait_for()

    def prototype(self):
        return self.page.frame_locator('.center iframe')

    def test_folder_and_single_file_support_search_history_and_bridge(self):
        for offline in (False, True):
            with self.subTest(offline=offline):
                self.open(offline)
                self.page.get_by_label('搜索页面名称').fill('Beta')
                self.page.locator('.tree').get_by_role('button', name='Beta', exact=False).click()
                self.prototype().get_by_role('heading', name='Beta', exact=True).wait_for()
                self.page.get_by_role('button', name='清空搜索').click()
                self.page.locator('.tree').get_by_role('button', name='Alpha', exact=False).click()
                self.prototype().get_by_role('heading', name='Alpha', exact=True).wait_for()
                self.page.go_back()
                self.prototype().get_by_role('heading', name='Beta', exact=True).wait_for()
                self.page.go_forward()
                self.prototype().get_by_role('heading', name='Alpha', exact=True).wait_for()
                self.prototype().get_by_role('button', name='关联页面').click()
                self.prototype().get_by_role('heading', name='Beta', exact=True).wait_for()
                self.page.evaluate('new Promise(resolve => { window.postMessage({type:"gotoNode",id:"phone"},"*"); requestAnimationFrame(()=>requestAnimationFrame(resolve)); })')
                self.assertIn('Beta', self.page.locator('.tree-row.active .node-label').inner_text())

    def test_folding_dragging_and_description_outline(self):
        self.open(True)
        self.page.get_by_role('button', name='全部折叠', exact=True).click()
        self.assertFalse(self.page.locator('.tree-children').is_visible())
        self.page.get_by_label('搜索页面名称').fill('Alpha')
        self.assertTrue(self.page.locator('.tree-children').is_visible())
        self.page.get_by_role('button', name='清空搜索').click()
        self.assertFalse(self.page.locator('.tree-children').is_visible())
        self.page.get_by_role('button', name='全部展开', exact=True).click()
        self.page.get_by_role('button', name='显示右侧', exact=True).click()
        desc = self.page.frame_locator('.right iframe')
        desc.get_by_role('heading', name='Alpha 说明', exact=True).wait_for()
        self.page.get_by_role('button', name='显示大纲', exact=True).click()
        desc.locator('.toc-wrap').wait_for(state='visible')
        self.page.get_by_role('button', name='隐藏大纲', exact=True).click()
        desc.locator('.toc-wrap').wait_for(state='hidden')
        before = self.page.locator('.panel.left').bounding_box()['width']
        divider = self.page.get_by_role('separator', name='调整目录宽度').bounding_box()
        self.page.mouse.move(divider['x']+1, divider['y']+80)
        self.page.mouse.down()
        self.page.mouse.move(divider['x']+61, divider['y']+80, steps=5)
        self.page.mouse.up()
        self.assertGreater(self.page.locator('.panel.left').bounding_box()['width'], before+40)
        self.page.set_viewport_size({'width': 900, 'height': 700})
        self.page.wait_for_function("document.querySelector('.panel.center').getBoundingClientRect().width >= 239")
        self.page.get_by_role('button', name='隐藏左侧', exact=True).click()
        self.assertFalse(self.page.locator('.panel.left').is_visible())
        self.page.get_by_role('button', name='显示左侧', exact=True).click()
        self.assertTrue(self.page.locator('.panel.left').is_visible())

    def test_device_reports_do_not_shrink_subsequent_desktop_pages(self):
        self.open(True, node='phone')
        self.page.locator('.iframe-wrap.mobile').wait_for()
        self.assertEqual(self.page.locator('.frame-inner').evaluate('(node)=>getComputedStyle(node).width'), '375px')
        self.page.evaluate('window.gotoNode("alpha")')
        self.prototype().get_by_role('heading', name='Alpha', exact=True).wait_for()
        self.page.locator('.iframe-wrap:not(.mobile)').wait_for()
        self.assertEqual(self.page.locator('.frame-inner').evaluate('(node)=>node.style.transform'), '')


    def test_ready_selector_does_not_skip_hidden_sidebar_check(self):
        with tempfile.TemporaryDirectory() as temp:
            stage = Path(temp)
            (stage / 'pages').mkdir()
            fragment = {'sourceId': 'test', 'tree': [{'children': [{
                'id': 'test--ready', 'routeHash': '#/ready', 'ready': {'selector': '#ready'}
            }]}]}
            (stage / 'nav.fragment.json').write_text(json.dumps(fragment))
            page = stage / 'pages/ready.html'
            html = '<div id="ready">Ready</div><aside class="app-sider">Sidebar</aside><script>location.hash="/ready"</script>'
            page.write_text(html)
            command = [sys.executable, str(SKILL / 'scripts/smoke_published.py'), str(stage)]
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('业务侧栏未隐藏', result.stderr)
            page.write_text('<style>.app-sider{display:none}</style>' + html)
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)

if __name__ == '__main__':
    unittest.main(verbosity=2)
