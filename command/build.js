module.exports = function () {
  const fs = require("file-system");
  const path = require("path");
  const parse = require("../lib/parse");
  const config = require(path.resolve("genji.config.js"));
  const notebook = parse(config);
  fs.writeFileSync(
    path.resolve(__dirname, "../public/notebook.json"),
    JSON.stringify(notebook)
  );

  fs.copySync(
    path.resolve(__dirname, "../public/"),
    path.resolve(config.output)
  );
};
