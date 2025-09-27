const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@supabase/node-fetch': path.resolve(__dirname, 'lib/shims/nodeFetch.js'),
};

module.exports = withNativeWind(config, { input: './global.css' });
