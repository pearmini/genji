const fs = require("file-system");
const path = require("path");

const { parse } = require("../lib/parse");
const { compileHTML, compileCSS } = require("../lib/compile");
const { loadConfig } = require("../lib/config");

function build() {
  console.log("Staring building...");

  const config = loadConfig();
  const metadata = parse(config);

  // clear output
  const outputPath = path.resolve(config.output);
  if (fs.existsSync(outputPath)) fs.rmdirSync(outputPath);

  // copy public/* to output
  fs.copySync(
    path.resolve(__dirname, "../public/"),
    path.resolve(config.output)
  );

  // generate metadata
  fs.writeFileSync(
    path.resolve(config.output, "./docs", "$metadata.json"),
    JSON.stringify(metadata)
  );

  // generate notebooks to output/docs
  for (const root of metadata.outline) {
    const discovered = [root];
    while (discovered.length) {
      const node = discovered.pop();
      const { id, file } = node.data;
      const filepath = path.resolve(config.input, file + ".md");
      if (fs.existsSync(filepath)) {
        const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
        fs.writeFileSync(
          path.resolve(config.output, "./docs", id + ".json"),
          JSON.stringify({ markdown })
        );
      }
      if (node.children && node.children.length) {
        discovered.push(...node.children);
      }
    }
  }

  // copy assets
  fs.copySync(
    path.resolve(config.assets),
    path.resolve(config.output, config.assets)
  );

  // copy lib
  for (const script of config.scripts) {
    fs.copyFileSync(
      path.resolve(script),
      path.resolve(config.output, "./lib", script.split("/").pop())
    );
  }

  // compile html
  const htmlPath = path.resolve(config.output, "index.html");
  const html = fs.readFileSync(htmlPath, { encoding: "utf-8" });
  fs.writeFileSync(htmlPath, compileHTML(html, config));

  // compile css
  const cssPath = path.resolve(config.output, "main.css");
  const css = fs.readFileSync(cssPath, { encoding: "utf-8" });
  fs.writeFileSync(cssPath, compileCSS(css, config));

  console.log("Building success!");
}

module.exports = build;
