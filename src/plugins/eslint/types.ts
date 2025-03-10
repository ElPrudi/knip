type ParserOptions = {
  project?: string;
  babelOptions?: {
    presets: string[];
  };
};

type Settings = Record<string, Record<string, unknown>>;

type Rules = Record<string, string | number>;

type BaseConfig = {
  extends?: string | string[];
  parser?: string;
  parserOptions?: ParserOptions;
  processor?: string;
  plugins?: string[];
  settings?: Settings;
  rules?: Rules;
};

export type OverrideConfig = BaseConfig & { files: string[]; overrides: OverrideConfig };

export type ESLintConfig = BaseConfig & {
  env?: Record<string, boolean>;
  overrides?: OverrideConfig[];
};
