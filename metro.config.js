const { getDefaultConfig } = require("expo/metro-config");

// getDefaultConfig already resolves `paths` from tsconfig.json (Expo SDK 50+),
// so the @domain/@application/@infrastructure/@presentation/@shared aliases
// declared in tsconfig.json work without extra Metro config.
const config = getDefaultConfig(__dirname);

module.exports = config;
