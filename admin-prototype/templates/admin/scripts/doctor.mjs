// Read-only checks; does not install packages or alter the caller's environment.
import { spawnSync } from 'node:child_process';
const [major, minor] = process.versions.node.split('.').map(Number);
const errors = [];
if (!((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22))
  errors.push('需要 Node 20.19+ 或 22.12+（不支持 21.x）');
const npm = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], {
  encoding: 'utf8',
});
if (npm.error || npm.status !== 0) errors.push('缺少可用 npm');
for (const error of errors) console.error(`❌ ${error}`);
if (errors.length) process.exit(1);
console.log(`✅ Node ${process.versions.node} / npm ${npm.stdout.trim()}`);
