'use strict';

const {CLIEngine} = require('eslint');
const {readDir, logIfAny} = require('./utils');

module.exports = ({logIf, base}) => {
  const files = ['*.js', `${base()}/**/*.js`];

  function eslint() {
    return Promise.resolve().then(() => {
      const fix = process.argv.includes('--fix');
      const eslintConfig = {cache: true, cacheLocation: 'target/.eslintcache', fix};

      const cli = new CLIEngine(eslintConfig);
      const report = cli.executeOnFiles(files);
      const {results} = report;
      const formatter = cli.getFormatter();
      const errors = CLIEngine.getErrorResults(results);
      logIfAny(formatter(results));

      if (fix) {
        // output fixes to disk
        CLIEngine.outputFixes(report);
      }

      return errors.length && Promise.reject();
    });
  }

  return logIf(eslint, () => readDir(files).length > 0);
};
