const fs = require("file-system");
const path = require("path");

const { parse } = require("../lib/parse");
const {
  compileHTML,
  compileCSS,
  compileJS,
  compileMD,
  compileHashFileName,
} = require("../lib/compile");
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
    path.resolve(config.output, "./$genji_docs", "$metadata.json"),
    JSON.stringify(metadata)
  );

  // generate notebooks to output/docs
  const pages = [];
  for (const root of metadata.outline) {
    const discovered = [root];
    while (discovered.length) {
      const node = discovered.pop();
      const { id, file } = node.data;
      const filepath = path.resolve(config.input, file + ".md");
      if (fs.existsSync(filepath)) {
        const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
        pages.push(id);
        fs.writeFileSync(
          path.resolve(config.output, "./$genji_docs", id + ".json"),
          JSON.stringify({ markdown: compileMD(markdown, config, filepath) })
        );
      }
      if (node.children && node.children.length) {
        discovered.push(...node.children);
      }
    }
  }

  // copy assets
  const assetsPath = path.resolve(config.output, config.assets);
  const srcAssetsPath = path.resolve(config.assets);
  if (fs.existsSync(srcAssetsPath)) {
    fs.copySync(srcAssetsPath, assetsPath);
  }

  // copy lib
  for (const script of config.scripts) {
    fs.copyFileSync(
      path.resolve(script),
      path.resolve(config.output, "./$genji_lib", compileHashFileName(script))
    );
  }

  // compile html
  const htmlPath = path.resolve(config.output, "index.html");
  const html = fs.readFileSync(htmlPath, { encoding: "utf-8" });
  const compiledHTML = compileHTML(html, config);
  fs.writeFileSync(htmlPath, compiledHTML);
  for (const id of pages) {
    const pagePath = path.resolve(config.output, `./${id}`, "index.html");
    if (pagePath === assetsPath) {
      throw new Error(
        `Assets name can not equal to docs name: ${config.assets}`
      );
    }
    fs.writeFileSync(pagePath, compiledHTML);
  }

  // compile css
  const cssPath = path.resolve(config.output, "main.css");
  const css = fs.readFileSync(cssPath, { encoding: "utf-8" });
  fs.writeFileSync(cssPath, compileCSS(css, config));

  // compile js
  const jsFiles = ["router.js", "app.js"];
  for (const file of jsFiles) {
    const jsPath = path.resolve(config.output, file);
    const js = fs.readFileSync(jsPath, { encoding: "utf-8" });
    fs.writeFileSync(jsPath, compileJS(js, config));
  }

  // generate CNAME
  if (config.domain !== undefined) {
    fs.writeFileSync(
      path.resolve(config.output, "./CNAME"),
      `${config.domain}`
    );
  }

  console.log("Building success!");
}

module.exports = build;
