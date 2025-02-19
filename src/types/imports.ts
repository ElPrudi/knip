type FilePath = string;
type Specifier = string;
type Identifier = string;

type ImportItems = Set<Identifier>;

export type ImportedModule = {
  specifier: Specifier;
  symbols: ImportItems;
  isStar: boolean;
  isReExported: boolean;
  isReExportedBy: Set<string>;
  isDynamic: boolean;
};

export type Imports = Map<FilePath, ImportedModule>;
