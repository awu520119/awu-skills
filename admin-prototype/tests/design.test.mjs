import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateDesign } from '../templates/admin/design/schema.mjs';
const defaults = JSON.parse(
  readFileSync(new URL('../templates/admin/design/system.json', import.meta.url), 'utf8'),
);

test('shared design config accepts valid settings and rejects malformed or unsupported values', () => {
  assert.deepEqual(validateDesign(defaults), defaults);
  const changed = structuredClone(defaults);
  changed.controls.height = defaults.controls.height === 40 ? 32 : 40;
  assert.deepEqual(validateDesign(changed), changed);
  assert.notEqual(changed.controls.height, defaults.controls.height);
  for (const [path, value] of [
    ['version', 99],
    ['colors.primary', 'url(https://example.com)'],
    ['controls.height', 999],
    ['form.columns', '2'],
  ]) {
    const invalid = structuredClone(defaults);
    const keys = path.split('.');
    const key = keys.pop();
    keys.reduce((node, part) => node[part], invalid)[key] = value;
    assert.throws(() => validateDesign(invalid), new RegExp(path.replaceAll('.', '\\.')));
  }
  assert.throws(() => validateDesign({ ...defaults, unexpected: {} }), /未知/);
  assert.throws(() => validateDesign(null), /必须是对象/);
});
