import parseArgs from 'minimist';
import { isInNodeModules, join } from '../../util/path.js';
import { _tryResolve } from '../../util/require.js';
import type { Resolver } from '../types.js';

const tryResolveFilePath = (cwd: string, specifier: string, fallback?: string) => {
  if (specifier) {
    const filePath = join(cwd, specifier);
    if (!isInNodeModules(filePath)) {
      const resolvedFilePath = _tryResolve(filePath, cwd);
      if (resolvedFilePath) return [resolvedFilePath];
    }
    return fallback ? [fallback] : [];
  }
  return [];
};

export const tryResolveFilePaths = (cwd: string, specifiers: string[]) =>
  specifiers.flatMap(specifier => tryResolveFilePath(cwd, specifier, specifier));

export const resolve: Resolver = (binary, args, { cwd }) => {
  const parsed = parseArgs(args, { string: ['r'], alias: { require: ['r', 'loader', 'experimental-loader'] } });
  return [...tryResolveFilePath(cwd, parsed._[0]), ...tryResolveFilePaths(cwd, [parsed.require].flat())];
};
