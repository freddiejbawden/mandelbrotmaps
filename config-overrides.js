const path = require('path');
const WorkerPlugin = require('worker-plugin');
module.exports = function override(config, env) {
  config.plugins.push(new WorkerPlugin())
  const wasmExtensionRegExp = /\.wasm$/;

  config.resolve.extensions.push('.wasm');

  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        // make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  // add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, 'src'),
    use: [{ loader: require.resolve('wasm-loader'), options: {} }]
  });
  config.module.rules.push({
    test: /\.worker\.js$/,
    include: path.resolve(__dirname, 'src'),
    use: { loader: 'worker-loader' }
  })
  return config;
};