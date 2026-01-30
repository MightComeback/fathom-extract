import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const linearScript = path.join(repoRoot, 'scripts', 'linear.mjs');

function run(args, env = {}) {
  return spawnSync(process.execPath, [linearScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });
}

test('scripts/linear.mjs prints help with --help and exits 0 (no env required)', () => {
  const res = run(['--help'], { LINEAR_API_KEY: '' });
  assert.equal(res.status, 0);
  assert.match(res.stdout, /node scripts\/linear\.mjs issue-state-type/i);
});

test('scripts/linear.mjs exits non-zero on unknown command and prints help', () => {
  const res = run(['wat'], { LINEAR_API_KEY: 'dummy' });
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /Unknown command/i);
});

test('scripts/linear.mjs exits non-zero when missing issue key', () => {
  const res = run(['issue-state-type'], { LINEAR_API_KEY: 'dummy' });
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /Missing issue key/i);
});
