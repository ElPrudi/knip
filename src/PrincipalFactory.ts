import ts from 'typescript';
import { ProjectPrincipal } from './ProjectPrincipal.js';
import { join, toAbsolute } from './util/path.js';
import type { SyncCompilers, AsyncCompilers } from './types/compilers.js';
import type { Report } from './types/issues.js';

type Paths = ts.CompilerOptions['paths'];

type Principal = { principal: ProjectPrincipal; cwds: Set<string>; pathKeys: Set<string> };
type Principals = Set<Principal>;

type Options = {
  cwd: string;
  compilerOptions: ts.CompilerOptions;
  report: Report;
  paths: Paths;
  compilers: [SyncCompilers, AsyncCompilers];
};

const mergePaths = (cwd: string, compilerOptions: ts.CompilerOptions, paths: Paths = {}) => {
  const overridePaths = Object.keys(paths).reduce((overridePaths, key) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    overridePaths![key] = paths[key].map(entry => toAbsolute(entry, cwd));
    return overridePaths;
  }, {} as Paths);
  compilerOptions.paths = { ...compilerOptions.paths, ...overridePaths };
  return compilerOptions;
};

/**
 * The principal factory hands out ProjectPrincipals. It tries to reuse them, since they're expensive in terms of
 * performance. Time will tell if this is actually feasible or not.
 */
export class PrincipalFactory {
  principals: Principals = new Set();

  public getPrincipal({ cwd, compilerOptions, report, paths, compilers }: Options) {
    compilerOptions = mergePaths(cwd, compilerOptions, paths);
    const principal = this.findReusablePrincipal(compilerOptions);
    if (principal) {
      this.linkPrincipal(principal, cwd, compilerOptions.paths);
      return principal.principal;
    } else {
      return this.addNewPrincipal({ cwd, compilerOptions, report, paths, compilers });
    }
  }

  /**
   * Principals with shared `compilerOptions.baseUrl` and no `compilerOptions.paths` conflicts are reused.
   */
  private findReusablePrincipal(compilerOptions: ts.CompilerOptions) {
    const workspacePaths = compilerOptions?.paths ? Object.keys(compilerOptions.paths) : [];
    const principal = Array.from(this.principals).find(principal => {
      if (compilerOptions.baseUrl === principal.principal.compilerOptions.baseUrl) {
        return workspacePaths.every(p => !principal.pathKeys.has(p));
      }
      return !compilerOptions.baseUrl;
    });
    return principal;
  }

  private linkPrincipal(principal: Principal, cwd: string, paths: Paths) {
    Object.keys(paths ?? {}).forEach(p => principal.pathKeys.add(p));
    principal.principal.compilerOptions.paths = { ...principal.principal.compilerOptions.paths, ...paths };
    principal.cwds.add(cwd);
  }

  private addNewPrincipal({ cwd, compilerOptions, report, compilers }: Options) {
    const principal = new ProjectPrincipal({ cwd, compilerOptions, report, compilers });
    const pathKeys = new Set(Object.keys(compilerOptions?.paths ?? {}));
    compilerOptions.baseUrl = join(cwd, compilerOptions.baseUrl ?? '.');
    this.principals.add({ principal, cwds: new Set([cwd]), pathKeys });
    return principal;
  }

  public getPrincipals() {
    return Array.from(this.principals).map(p => p.principal);
  }
}
