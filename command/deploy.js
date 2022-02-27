const build = require("./build");
const path = require("path");
const ghpages = require("gh-pages");
const { loadConfig } = require("../lib/config");

function deploy() {
  // build output
  build();

  // deploy to github
  console.log("Start deploying...");
  const { output, siteGithub, siteBranch } = loadConfig();
  const outputPath = path.resolve(output);
  const options = {
    branch: siteBranch,
    repo: siteGithub,
  };
  const success = (v) => {
    if (v === undefined) console.log("Deploying success!");
    else console.log(v);
  };
  console.log(options);
  ghpages.publish(outputPath, options, success);
}

module.exports = deploy;
