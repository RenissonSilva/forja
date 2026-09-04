module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // react-native-worklets' plugin must always run last (required by react-native-reanimated 4.x).
      "react-native-worklets/plugin",
    ],
  };
};
