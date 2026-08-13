// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  // ── Seiketsu (5S): reglas arquitectónicas ────────────────────────
  // Previenen el retorno de las violaciones hexagonales eliminadas.
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["**/application/**", "**/infrastructure/**", "**/presentation/**"],
            message: "Hexagonal: domain no puede depender de capas externas.",
          },
        ],
      }],
    },
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["**/presentation/**"],
            message: "Hexagonal: application no puede depender de presentation.",
          },
        ],
      }],
    },
  },
  {
    files: ["src/presentation/**/*.{ts,tsx}"],
    ignores: ["src/presentation/context/DIContext.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["**/infrastructure/**"],
            message: "Hexagonal: presentation no puede depender de infrastructure. Usa un controller.",
          },
        ],
      }],
    },
  },
  // Límite blando de tamaño de archivo (KISS): un God Object genera warning.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
      complexity: ["warn", 12],
    },
  },
]);
