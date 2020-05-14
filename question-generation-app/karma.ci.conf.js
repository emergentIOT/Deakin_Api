// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
//process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/src'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
      thresholds: {
        statements: process.env.MINIMUM_COVERAGE || 100
      },
    },
    reporters: ['progress', 'kjhtml', 'coverage-istanbul'],
    autoWatch: false,
    browsers: ['ChromeDocker'],
    customLaunchers: {
      ChromeDocker: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    concurrency: Infinity,
    singleRun: true
  });
};
