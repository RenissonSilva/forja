// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");
const boundaries = require("eslint-plugin-boundaries");

// Enforces the Clean Architecture dependency rule: each layer may only import
// itself and the layers strictly below it. `app/` (Expo Router routes) is a
// thin outer layer that may only reach into `presentation` and `shared`.
// `src/composition` is the composition root (à la Clean Architecture's "Main"):
// its only job is wiring concrete repositories (Infrastructure) to use cases
// (Application), so — unlike the rest of the app — it may import from every layer.
const layerAllowList = {
  domain: ["domain", "shared"],
  application: ["domain", "application", "shared"],
  infrastructure: ["domain", "infrastructure", "shared"],
  composition: ["domain", "application", "infrastructure", "composition", "shared"],
  presentation: [
    "domain",
    "application",
    "infrastructure",
    "composition",
    "presentation",
    "shared",
  ],
  shared: ["shared"],
  routes: ["presentation", "shared"],
};

const layerBoundaries = {
  plugins: { boundaries },
  settings: {
    "boundaries/include": ["src/**/*.ts", "src/**/*.tsx", "app/**/*.ts", "app/**/*.tsx"],
    "boundaries/elements": [
      { type: "domain", pattern: "src/domain/**" },
      { type: "application", pattern: "src/application/**" },
      { type: "infrastructure", pattern: "src/infrastructure/**" },
      { type: "composition", pattern: "src/composition/**" },
      { type: "presentation", pattern: "src/presentation/**" },
      { type: "shared", pattern: "src/shared/**" },
      { type: "routes", pattern: "app/**" },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        policies: Object.entries(layerAllowList).map(([from, allowed]) => ({
          from: { element: { type: from } },
          allow: { to: { element: { types: { anyOf: allowed } } } },
        })),
      },
    ],
  },
};

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  layerBoundaries,
  {
    ignores: ["dist/*", "node_modules/*", ".expo/*"],
  },
]);
