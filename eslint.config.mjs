/** @type {import('eslint').Linter.Config[]} */

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
  {
    rules: {
      "prefer-const": "warn",
    }
  },
];

export default configs;
