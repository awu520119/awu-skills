"""Behavioral regressions for portable initialization, manual ownership and recovery."""
from __future__ import annotations

from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SKILL = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL / 'scripts'))
from offline_html import inline_page_assets
from sync_project import sync
import build_desc


class ViewerWorkflows(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='viewer-tests-')
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name) / 'viewer'
        subprocess.run(['bash', str(SKILL / 'scripts/init-viewer.sh'), str(self.project)], check=True, capture_output=True)
        self.run_cli('sync_project.py', '.', success=True)

    def run_cli(self, script, *args, success):
        result = subprocess.run([sys.executable, str(self.project / 'scripts' / script), *map(str, args)], cwd=self.project, capture_output=True, text=True)
        self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)
        return result

    def snapshot(self):
        return {str(path.relative_to(self.project)): path.read_bytes() for path in self.project.rglob('*') if path.is_file() and ('pages' in path.parts or 'desc' in path.parts or path.name in {'nav.json', 'nav.js', 'nav.manual.json'})}

    def test_initializer_copies_sources_without_old_builds(self):
        self.assertFalse((self.project / 'react-app/dist').exists())
        self.assertFalse((self.project / 'share').exists())
        self.assertFalse((self.project / '.published').exists())
        self.assertTrue((self.project / 'templates/description.html').is_file())

    def test_add_rename_move_and_remove_keep_existing_content(self):
        self.run_cli('add_page.py', '.', '--id', 'sample', '--title', '样例', '--template', 'list', '--parent', 'sample-group', '--create-parent', success=True)
        self.assertTrue((self.project / 'pages/sample.html').is_file())
        self.run_cli('rename_page.py', '.', '--id', 'sample', '--new-id', 'renamed', '--new-title', '新名称', '--new-parent', 'admin-pages', success=True)
        self.assertFalse((self.project / 'pages/sample.html').exists())
        self.assertTrue((self.project / 'desc/renamed.html').is_file())
        before = self.snapshot()
        self.run_cli('remove_page.py', '.', '--id', 'renamed', '--dry-run', success=True)
        self.assertEqual(before, self.snapshot())
        self.run_cli('remove_page.py', '.', '--id', 'renamed', '--keep-empty-group', success=True)
        self.assertFalse((self.project / 'pages/renamed.html').exists())
        self.assertTrue((self.project / 'pages/admin-list.html').is_file())

    def test_failed_mutations_restore_files_and_generated_navigation(self):
        # A real downstream strict-validation failure after file changes and rendering.
        (self.project / 'pages/orphan.html').write_text('<html>orphan</html>')
        for script, args in [
            ('add_page.py', ['--id', 'new-page', '--title', '新页面']),
            ('rename_page.py', ['--id', 'admin-detail', '--new-id', 'renamed']),
            ('remove_page.py', ['--id', 'admin-detail']),
        ]:
            with self.subTest(script=script):
                before = self.snapshot()
                self.run_cli(script, '.', *args, success=False)
                self.assertEqual(before, self.snapshot())

    def test_render_failure_restores_previous_generated_files(self):
        before = self.snapshot()
        original = build_desc.markdown_to_html_fragment
        calls = 0
        def fail_on_second(text):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise ValueError('controlled rendering failure')
            return original(text)
        with patch.object(build_desc, 'markdown_to_html_fragment', fail_on_second):
            with self.assertRaisesRegex(ValueError, 'controlled'):
                sync(self.project)
        self.assertEqual(before, self.snapshot())

    def test_unavailable_template_never_creates_placeholder_success(self):
        before = self.snapshot()
        self.run_cli('add_page.py', '.', '--id', 'bad', '--title', '失败', '--template', 'mobile-list', success=False)
        self.assertEqual(before, self.snapshot())

    def test_invalid_fragment_is_rejected_before_output_changes(self):
        folder = self.project / '.published/sample'
        folder.mkdir(parents=True)
        (folder / 'nav.fragment.json').write_text(json.dumps({'sourceId': 'other', 'tree': []}))
        before = self.snapshot()
        self.run_cli('sync_project.py', '.', success=False)
        self.assertEqual(before, self.snapshot())

    def test_offline_page_embeds_local_css_script_and_image(self):
        source = self.project / 'pages/local.html'
        (self.project / 'assets/local.css').write_text('body{background:url("../desc/cover.png")}')
        (self.project / 'assets/local.js').write_text('window.value="</script>";')
        html = "<link rel='stylesheet' href='../assets/local.css'><script src='../assets/local.js'></script><img src='../desc/cover.png'>"
        output = inline_page_assets(html, source, self.project)
        self.assertIn('data:image/png;base64,', output)
        self.assertIn('<\\/script>', output)
        self.assertNotIn("src='../", output)
        with self.assertRaisesRegex(ValueError, '外部资源'):
            inline_page_assets('<script src="https://example.invalid/app.js"></script>', source, self.project)


if __name__ == '__main__':
    unittest.main()
