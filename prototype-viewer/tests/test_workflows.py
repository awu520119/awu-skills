"""Behavioral regressions for portable initialization, manual ownership and recovery."""
from __future__ import annotations

from pathlib import Path
import json
import os
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
from package_docs import package
from project_lock import project_lock
from receive_publication import receive
import build_desc


class ViewerWorkflows(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='viewer-tests-')
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name) / 'viewer'
        subprocess.run(['bash', str(SKILL / 'scripts/init-viewer.sh'), str(self.project)], check=True, capture_output=True)
        # Test-only manual content; the distributed viewer itself starts empty.
        tree = [{'id': 'admin-pages', 'title': '手动页面', 'order': 0, 'children': []}]
        for index, page in enumerate(['admin-list', 'admin-form', 'admin-detail']):
            (self.project / f'pages/{page}.html').write_text(f'<html><body><h1>{page}</h1></body></html>')
            (self.project / f'desc/{page}.md').write_text(f'# {page}')
            tree[0]['children'].append({'id': page, 'title': page, 'order': index, 'htmlPath': f'pages/{page}.html', 'mdPath': f'desc/{page}.md'})
        (self.project / 'desc/cover.png').write_bytes(b'image-fixture')
        (self.project / 'nav.manual.json').write_text(json.dumps({'projectName': 'Test', 'tree': tree}))
        self.run_cli('sync_project.py', '.', success=True)

    def run_cli(self, script, *args, success):
        result = subprocess.run([sys.executable, str(self.project / 'scripts' / script), *map(str, args)], cwd=self.project, capture_output=True, text=True)
        self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)
        return result

    def snapshot(self):
        return {str(path.relative_to(self.project)): path.read_bytes() for path in self.project.rglob('*') if path.is_file() and ('pages' in path.parts or 'desc' in path.parts or path.name in {'nav.json', 'nav.js', 'nav.manual.json'})}

    def test_initializer_copies_sources_without_old_builds(self):
        self.assertFalse((self.project / 'scripts/init-viewer.sh').exists())
        self.assertFalse((self.project / 'shell').exists())
        self.assertFalse((self.project / 'react-app').exists())
        self.assertFalse((self.project / 'share').exists())
        self.assertFalse((self.project / '.published').exists())
        self.assertTrue((self.project / 'templates/description.html').is_file())

    def test_project_lock_blocks_every_mutating_cli(self):
        before = self.snapshot()
        with project_lock(self.project):
            for script, args in [('sync_project.py', []), ('export_single_file.py', []),
                                 ('add_page.py', ['--id', 'blocked', '--title', 'Blocked']),
                                 ('rename_page.py', ['--id', 'admin-list', '--new-id', 'blocked']),
                                 ('remove_page.py', ['--id', 'admin-list']),
                                 ('build_desc.py', []), ('receive_publication.py', ['missing'])]:
                result = self.run_cli(script, '.', *args, success=False)
                self.assertIn('其他更新任务', result.stdout + result.stderr)
        self.assertEqual(before, self.snapshot())

    def test_generated_manifest_cleans_only_owned_files(self):
        custom = self.project / 'desc/custom.html'
        custom.write_text('manual content')
        nav = json.loads((self.project / 'nav.manual.json').read_text())
        del nav['tree'][0]['children'][0]['mdPath']
        (self.project / 'nav.manual.json').write_text(json.dumps(nav))
        (self.project / 'desc/admin-list.md').unlink()
        self.run_cli('sync_project.py', '.', success=True)
        self.assertFalse((self.project / 'desc/admin-list.html').exists())
        self.assertEqual(custom.read_text(), 'manual content')
        self.assertTrue((self.project / 'desc/admin-form.html').exists())

    def test_receiver_restores_package_and_outputs_on_sync_failure(self):
        package_dir = self.project.parent / 'package'
        package_dir.mkdir()
        (package_dir / 'nav.fragment.json').write_text(json.dumps({'sourceId': 'demo', 'tree': []}))
        target = self.project / '.published/demo'
        target.mkdir(parents=True)
        (target / 'original.txt').write_text('original')
        before = self.snapshot()
        # Browser behavior is covered by Chrome tests; isolate commit failure here.
        def broken_sync(project, **kwargs):
            (project / 'nav.json').write_text('broken')
            (project / 'desc/partial.html').write_text('partial')
            raise ValueError('sync failure')
        with patch('receive_publication.subprocess.run'), patch('receive_publication.sync', side_effect=broken_sync):
            with self.assertRaisesRegex(ValueError, 'sync failure'):
                receive(self.project, package_dir)
        self.assertEqual((target / 'original.txt').read_text(), 'original')
        self.assertFalse((target / 'nav.fragment.json').exists())
        self.assertEqual(before, self.snapshot())

    def test_legacy_migration_preserves_manual_html_and_backs_up_scripts(self):
        (self.project / '.generated-desc.json').unlink()
        (self.project / 'desc/admin-list.desc.js').write_text('legacy')
        (self.project / 'desc/manual.html').write_text('manual')
        self.run_cli('migrate_legacy.py', '.', success=True)
        self.run_cli('sync_project.py', '.', success=True)
        self.assertEqual((self.project / 'desc/manual.html').read_text(), 'manual')
        self.assertFalse((self.project / 'desc/admin-list.desc.js').exists())
        backups = list(self.project.glob('legacy-backup-*/admin-list.desc.js'))
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_text(), 'legacy')

    def test_add_rename_move_and_remove_keep_existing_content(self):
        self.run_cli('add_page.py', '.', '--id', 'sample', '--title', '样例', '--parent', 'sample-group', '--create-parent', success=True)
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

    def test_removed_template_option_is_rejected_without_changes(self):
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


    def test_fresh_viewer_adds_first_page_and_exports_without_node(self):
        empty = self.project.parent / 'empty'
        subprocess.run(['bash', str(SKILL / 'scripts/init-viewer.sh'), str(empty)], check=True, capture_output=True)
        self.project = empty
        self.assertFalse((empty / 'shell').exists())
        self.assertEqual(json.loads((empty / 'nav.manual.json').read_text())['tree'], [])
        self.run_cli('add_page.py', '.', '--id', 'one', '--title', '页面', success=True)
        (empty / 'desc/one.md').write_text('# LATEST_CONTENT')
        self.run_cli('export_single_file.py', '.', success=True)
        output = empty / 'share/prototype-viewer.html'
        self.assertIn('LATEST_CONTENT', output.read_text())
        before = output.read_bytes()
        (empty / 'pages/one.html').unlink()
        self.run_cli('export_single_file.py', '.', '--force', success=False)
        self.assertEqual(output.read_bytes(), before)

    def test_preview_lists_pruned_parent_without_mutating_then_matches_removal(self):
        self.run_cli('add_page.py', '.', '--id', 'only-child', '--title', '唯一子页', '--parent', 'only-parent', '--create-parent', success=True)
        before = self.snapshot()
        preview = self.run_cli('remove_page.py', '.', '--id', 'only-child', '--dry-run', success=True)
        self.assertIn('将清理空分组 only-parent', preview.stdout)
        self.assertEqual(before, self.snapshot())
        result = self.run_cli('remove_page.py', '.', '--id', 'only-child', success=True)
        self.assertIn('将清理空分组 only-parent', result.stdout)
        self.assertNotIn('only-parent', (self.project / 'nav.manual.json').read_text())

    def test_shared_nested_document_survives_rename_and_partial_removal(self):
        for page in ('first', 'second'):
            self.run_cli('add_page.py', '.', '--id', page, '--title', page, '--md', 'desc/nested/shared.md', success=True)
        shared = self.project / 'desc/nested/shared.md'
        shared.write_text('# Shared business rules')
        self.run_cli('sync_project.py', '.', success=True)
        self.run_cli('rename_page.py', '.', '--id', 'first', '--new-id', 'renamed', success=True)
        self.assertTrue(shared.exists())
        self.run_cli('remove_page.py', '.', '--id', 'renamed', success=True)
        self.assertTrue(shared.exists())
        self.assertIn('Shared business rules', (self.project / 'desc/second.html').read_text())
        self.run_cli('remove_page.py', '.', '--id', 'second', success=True)
        self.assertFalse(shared.exists())

    def test_published_pages_share_nested_prd_and_keep_html_paths_unique(self):
        folder = self.project / '.published/demo'
        (folder / 'pages').mkdir(parents=True)
        (folder / 'desc/nested').mkdir(parents=True)
        (folder / 'desc/nested/shared.md').write_text('# Shared publication')
        nodes = []
        for page_id in ('list', 'detail'):
            (folder / f'pages/{page_id}.html').write_text('<html>page</html>')
            nodes.append({'id': f'demo--{page_id}', 'title': page_id, 'order': 1,
                          'htmlPath': f'.published/demo/pages/{page_id}.html',
                          'mdPath': '.published/demo/desc/nested/shared.md'})
        fragment = folder / 'nav.fragment.json'
        fragment.write_text(json.dumps({'sourceId': 'demo', 'tree': nodes}))
        self.run_cli('sync_project.py', '.', success=True)
        for page_id in ('list', 'detail'):
            self.assertIn('Shared publication', (self.project / f'desc/demo--{page_id}.html').read_text())
        nodes[1]['htmlPath'] = nodes[0]['htmlPath']
        fragment.write_text(json.dumps({'sourceId': 'demo', 'tree': nodes}))
        self.run_cli('sync_project.py', '.', success=False)


    def test_html_only_page_is_embedded_without_a_description(self):
        data = json.loads((self.project / 'nav.manual.json').read_text())
        data['tree'].append({'id': 'html-only', 'title': 'HTML only', 'order': 9, 'htmlPath': 'pages/html-only.html'})
        (self.project / 'nav.manual.json').write_text(json.dumps(data))
        (self.project / 'pages/html-only.html').write_text('<html>HTML_ONLY_SENTINEL</html>')
        self.run_cli('export_single_file.py', '.', success=True)
        self.assertIn('HTML_ONLY_SENTINEL', (self.project / 'share/prototype-viewer.html').read_text())

    def test_description_images_are_scoped_and_missing_images_fail_transactionally(self):
        outside = self.project.parent / 'outside.png'
        outside.write_bytes(b'outside-fixture')
        md = self.project / 'desc/admin-list.md'
        for content in [f'![x]({outside})', f'<img src="{outside}">', '![x](missing.png)', '![x](../nav.manual.json)']:
            md.write_text(content)
            before = self.snapshot()
            self.run_cli('sync_project.py', '.', success=False)
            self.assertEqual(before, self.snapshot())
        image = self.project / 'desc/scoped.png'
        image.write_bytes(b'scoped-image')
        md.write_text('![direct](scoped.png)\n\n![reference][pic]\n\n[pic]: scoped.png\n\n<img src="scoped.png">\n\n```\n![example](not-a-real-image.png)\n```')
        self.run_cli('sync_project.py', '.', success=True)
        html = (self.project / 'desc/admin-list.html').read_text()
        self.assertGreaterEqual(html.count('data:image/png;base64,'), 3)
        self.assertIn('not-a-real-image.png', html)
        (self.project / 'desc/linked.png').symlink_to(outside)
        md.write_text('![linked](linked.png)')
        self.run_cli('sync_project.py', '.', success=False)

    def test_document_packaging_copies_shared_relative_images_and_rejects_escape(self):
        docs = self.project.parent / 'source-docs'
        destination = self.project.parent / 'packaged'
        (docs / 'nested').mkdir(parents=True)
        (docs / 'images').mkdir()
        image = docs / 'images/cover.png'
        image.write_bytes(b'image-fixture')
        md = docs / 'nested/shared.md'
        md.write_text('![direct](../images/cover.png)\n\n![reference][cover]\n\n[cover]: ../images/cover.png\n\n<img src="../images/cover.png">')
        package(docs, destination, ['nested/shared.md', 'nested/shared.md'])
        self.assertEqual((destination / 'images/cover.png').read_bytes(), image.read_bytes())
        self.assertEqual((destination / 'nested/shared.md').read_text(), md.read_text())
        outside = self.project.parent / 'outside.png'
        outside.write_bytes(b'outside')
        (docs / 'images/link.png').symlink_to(outside)
        for text in ['![x](../images/missing.png)', '![x](../images/link.png)']:
            md.write_text(text)
            empty = self.project.parent / 'invalid-package'
            with self.assertRaises(ValueError):
                package(docs, empty, ['nested/shared.md'])
            self.assertFalse(empty.exists())

    def test_module_dependencies_fail_but_vendor_strings_do_not(self):
        script = self.project / 'assets/dependency-test.js'
        source = self.project / 'pages/test.html'
        for code in ['import "./missing.js";', 'import("./missing.js");', 'export { x } from "./missing.js";', 'const x = `${await import("./missing.js")}`;']:
            script.write_text(code)
            with self.assertRaisesRegex(ValueError, '模块依赖'):
                inline_page_assets('<script type="module" src="../assets/dependency-test.js"></script>', source, self.project)
            with self.assertRaisesRegex(ValueError, '模块依赖'):
                inline_page_assets('<script type="module">'+code+'</script>', source, self.project)
        script.write_text('console.log("import( is not executable here"); // import("fake")')
        self.assertIn('console.log', inline_page_assets('<script src="../assets/dependency-test.js"></script>', source, self.project))

    def test_rename_updates_known_references_and_preview_leaves_sources_untouched(self):
        self.run_cli('add_page.py', '.', '--id', 'before', '--title', 'Before', success=True)
        html = self.project / 'pages/before.html'
        html.write_text('<html><a href="before.html?x=1#part">Self</a><script>gotoNode("before")</script></html>')
        js = self.project / 'assets/local-navigation.js'
        js.write_text('gotoNode("before");')
        md = self.project / 'desc/before.md'
        md.write_text('[Self](../pages/before.html)')
        original = html.read_text(), js.read_text(), md.read_text()
        preview = self.run_cli('rename_page.py', '.', '--id', 'before', '--new-id', 'after', '--dry-run', success=True)
        self.assertIn('local-navigation.js', preview.stdout)
        self.assertEqual(original, (html.read_text(), js.read_text(), md.read_text()))
        self.run_cli('rename_page.py', '.', '--id', 'before', '--new-id', 'after', success=True)
        self.assertIn('after.html?x=1#part', (self.project / 'pages/after.html').read_text())
        self.assertIn('gotoNode("after")', js.read_text())
        self.assertIn('../pages/after.html', (self.project / 'desc/after.md').read_text())


    def test_one_command_update_from_other_cwd_uses_project_venv_and_keeps_sources(self):
        project = self.project.parent / 'viewer with spaces'
        subprocess.run(['bash', str(SKILL / 'scripts/init-viewer.sh'), str(project)], check=True, capture_output=True)
        self.project = project
        self.run_cli('add_page.py', '.', '--id', 'manual', '--title', '手动页面', success=True)
        subprocess.run([sys.executable, '-m', 'venv', '--system-site-packages', str(project / '.venv')], check=True, capture_output=True)
        # A fallback Python command would fail: update must select .venv itself.
        fake_bin = project.parent / 'bin'
        fake_bin.mkdir()
        (fake_bin / 'python3').write_text('#!/bin/sh\nexit 97\n')
        (fake_bin / 'python3').chmod(0o755)
        environment = {**os.environ, 'PATH': str(fake_bin) + ':/usr/bin:/bin'}
        html = project / 'pages/manual.html'
        md = project / 'desc/manual.md'
        nav = project / 'nav.manual.json'
        for revision in ('FIRST_EDIT', 'SECOND_EDIT'):
            html.write_text(f'<html><body><h1>{revision}</h1></body></html>')
            md.write_text(f'# {revision}_DESCRIPTION')
            sources = {file: file.read_bytes() for file in [html, md, nav]}
            result = subprocess.run(['/bin/bash', str(project / 'update.sh')], cwd=project.parent, env=environment, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout+result.stderr)
            self.assertIn(revision, (project / 'share/prototype-viewer.html').read_text())
            self.assertIn(revision+'_DESCRIPTION', (project / 'desc/manual.html').read_text())
            self.assertEqual(sources, {file: file.read_bytes() for file in sources})
        previous = (project / 'share/prototype-viewer.html').read_bytes()
        md.write_text('![missing](missing.png)')
        result = subprocess.run(['/bin/bash', str(project / 'update.sh')], cwd=project.parent, env=environment, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(previous, (project / 'share/prototype-viewer.html').read_bytes())

    def test_shell_lockfile_and_static_entry_are_self_contained(self):
        packages = json.loads((SKILL / 'shell/package-lock.json').read_text())['packages']
        for parent, info in packages.items():
            for name in info.get('optionalDependencies', {}):
                self.assertTrue(packages.get(parent+'/node_modules/'+name) or packages.get('node_modules/'+name), (parent, name))
        entry = (self.project / 'index.html').read_text()
        self.assertIn('assets/viewer.js', entry)
        self.assertNotIn('vue', entry.lower())
        self.assertNotIn('type="module"', entry)
        self.assertTrue((self.project / 'assets/viewer.js').is_file())



if __name__ == '__main__':
    unittest.main()
