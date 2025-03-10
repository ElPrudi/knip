import assert from 'node:assert/strict';
import test from 'node:test';
import { main } from '../../src/index.js';
import { resolve } from '../../src/util/path.js';
import baseArguments from '../helpers/baseArguments.js';
import baseCounters from '../helpers/baseCounters.js';

const cwd = resolve('tests/fixtures/plugins/svelte');

test('Use compilers', async () => {
  const { issues, counters } = await main({
    ...baseArguments,
    cwd,
  });

  assert(issues.devDependencies['package.json']['@types/cookie']);
  assert(issues.devDependencies['package.json']['tslib']);

  assert.deepEqual(counters, {
    ...baseCounters,
    devDependencies: 2,
    processed: 9, // This includes .svelte and .css files
    total: 9,
  });
});
