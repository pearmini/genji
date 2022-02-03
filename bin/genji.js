#!/usr/bin/env node

const { program } = require("commander");

program.version(require("../package").version, "-v, --version");

program
  .command("dev")
  .description("Start development environment.")
  .alias("d")
  .action(() => {
    require("../command/dev")();
  });

program
  .command("build")
  .description("Build static files.")
  .alias("b")
  .action(() => {
    require("../command/build")();
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
