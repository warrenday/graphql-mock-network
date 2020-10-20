// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets:
          process.env.TARGET === 'web' ? { chrome: '86' } : { node: 'current' },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    'transform-inline-environment-variables',
    'minify-dead-code-elimination',
    '@babel/plugin-proposal-class-properties',
  ],
};

// TODO add different target depending on process.env.TARGET
