module.exports = function(config) {
  config.set({
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'command',
    transpilers: [],
    coverageAnalysis: 'none'
  });
};
