const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude react-native-pdf from web builds
config.resolver.platforms = ['ios', 'android', 'web'];

// Ensure platform-specific extensions are resolved correctly
config.resolver.sourceExts = [
  'expo.tsx',
  'expo.ts',
  'expo.js',
  'native.tsx',
  'native.ts',
  'web.tsx',
  'web.ts',
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
];

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block react-native-pdf on web platform
  if (platform === 'web' && moduleName === 'react-native-pdf') {
    return {
      type: 'empty',
    };
  }

  // Use default resolver for everything else
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
