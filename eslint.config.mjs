// export default eslintConfig;
/** @type {import('eslint').Linter.Config[]} */
// import eslintConfigPrettier from "eslint-config-prettier";
// import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
// import tailwind from "eslint-plugin-tailwindcss";

import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const configs = [
  ...compat.extends("next/core-web-vitals"),
  //   ...compat.extends("eslint-plugin-tailwindcss"),
  //   ...compat.extends(...tailwind.configs["flat/recommended"]),

  //   ...compat.extends("prettier-plugin-tailwindcss"),
  //   ...compat.extends("prettier"),
  //   ...compat.extends(eslintConfigPrettier),
  //  ...compat.extends(eslintPluginPrettierRecommended),
  //   ...compat.extends("next/typescript"),
];

export default configs;
