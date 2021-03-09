#!/usr/bin/env node
const madge = require('madge');
const chalk = require('chalk');
const dedent = require('dedent');

const dirPath = process.env.PWD;
const checkCircularDeps = async () => {
  const indexPath = `${dirPath}/lib/index.js`;
  global.console.log('Checking for any circular dependencies..');
  const res = await madge(indexPath);
  const circular = res.circular();
  if (circular.length > 0) {
    const errorPaths = circular.map((arr) => arr.join(' -> '));
    global.console.log(
      chalk.red(dedent`\n\nERROR: Circular dependencies found!
                            Usually this means you're importing directly from the index.js.
                            This is a big no because it prevents tree shaking.\n
                            Please fix the import path(s) in these files:\n
                            `)
    );
    errorPaths.forEach((val, idx) => global.console.log(chalk.redBright(`${idx + 1}. ${val}\n`)));
    process.exit(1);
  }
};
const standAlone = async () => {
  await checkCircularDeps();
  global.console.log(chalk.green('SUCCESS: No circular depencies found!'));
  process.exit(0);
};
if (require.main === module) {
  standAlone();
}
module.exports = checkCircularDeps;
