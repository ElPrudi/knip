import { $ } from 'execa';

/* global $ */
import { EOL } from 'node:os';
import { Octokit } from 'octokit';

await $`pnpm all-contributors generate`;
