import assert from 'node:assert/strict';
import test from 'node:test';
import { main } from '../src/index.js';
import { join, resolve } from '../src/util/path.js';
import baseArguments from './helpers/baseArguments.js';
import baseCounters from './helpers/baseCounters.js';

const cwd = resolve('tests/fixtures/dependencies');

test('Find unused dependencies', async () => {
  const { issues, counters } = await main({
    ...baseArguments,
    cwd,
  });

  assert(issues.files.has(join(cwd, 'unused-module.ts')));

  assert.equal(Object.keys(issues.dependencies['package.json']).length, 2);
  assert(issues.dependencies['package.json']['@tootallnate/once']);
  assert(issues.dependencies['package.json']['fs-extra']);
  assert(issues.devDependencies['package.json']['mocha']);

  assert.equal(Object.keys(issues.unlisted).length, 1);
  assert(issues.unlisted['package.json']['bin:start-server']);
  assert(issues.unlisted['package.json']['bin:jest']);

  assert.deepEqual(counters, {
    ...baseCounters,
    files: 1,
    dependencies: 2,
    devDependencies: 1,
    unlisted: 2,
    processed: 3,
    total: 3,
  });
});

test('Find unused dependencies (production)', async () => {
  const { issues, counters } = await main({
    ...baseArguments,
    cwd,
    isProduction: true,
  });

  assert(issues.files.has(join(cwd, 'unused-module.ts')));

  assert.equal(Object.keys(issues.dependencies['package.json']).length, 2);
  assert(issues.dependencies['package.json']['@tootallnate/once']);
  assert(issues.dependencies['package.json']['fs-extra']);
  assert.equal(Object.keys(issues.devDependencies).length, 0);

  assert.equal(Object.keys(issues.unlisted).length, 1);
  assert(issues.unlisted['package.json']['bin:start-server']);
  assert(!issues.unlisted['package.json']['bin:jest']);

  assert.deepEqual(counters, {
    ...baseCounters,
    files: 1,
    dependencies: 2,
    devDependencies: 0,
    unlisted: 1,
    processed: 3,
    total: 3,
  });
});

test('Find unused dependencies (strict)', async () => {
  const { issues, counters } = await main({
    ...baseArguments,
    cwd,
    isProduction: true,
    isStrict: true,
  });

  assert(issues.files.has(join(cwd, 'unused-module.ts')));

  assert.equal(Object.keys(issues.dependencies['package.json']).length, 3);
  assert(issues.dependencies['package.json']['@tootallnate/once']);
  assert(issues.dependencies['package.json']['fs-extra']);
  assert(issues.dependencies['package.json']['jquery']);

  assert.deepEqual(counters, {
    ...baseCounters,
    files: 1,
    dependencies: 3,
    unlisted: 1,
    processed: 3,
    total: 3,
  });
});
