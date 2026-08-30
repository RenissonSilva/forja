module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Inlines the Drizzle-generated .sql migration files as string literals
      // (see drizzle/migrations.js) — pairs with the "sql" sourceExt in metro.config.js.
      ["inline-import", { extensions: [".sql"] }],
      // react-native-worklets' plugin must always run last (required by react-native-reanimated 4.x).
      "react-native-worklets/plugin",
    ],
  };
};
