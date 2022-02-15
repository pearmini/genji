module.exports = function () {
  const fs = require("file-system");
  const path = require("path");
  const parse = require("../lib/parse");
  const config = require(path.resolve("genji.config.js"));
  const metadata = parse(config);

  // copy public/* to output
  fs.copySync(
    path.resolve(__dirname, "../public/"),
    path.resolve(config.output)
  );

  // generate metadata
  fs.writeFileSync(
    path.resolve(config.output, "./docs", "metadata.json"),
    JSON.stringify(metadata)
  );

  // generate notebooks to output/docs
  for (const root of metadata.outline) {
    const discovered = [root];
    while (discovered.length) {
      const node = discovered.pop();
      const { fileId, file } = node.data;
      const filepath = path.resolve(config.input, file + ".md");
      if (fs.existsSync(filepath)) {
        const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
        fs.writeFileSync(
          path.resolve(config.output, "./docs", fileId + ".json"),
          JSON.stringify(markdown)
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

  // replace placeholder in html
  const htmlPath = path.resolve(config.output, "index.html");
  const html = fs.readFileSync(htmlPath, { encoding: "utf-8" });
  fs.writeFileSync(
    htmlPath,
    html
      .replace("<!-- TITLE_PLACEHOLDER -->", config.title)
      .replace("<!-- ICON_PLACEHOLDER -->", config.logo)
      .replace("<!-- SCRIPTS_PLACEHOLDER-->", scripts(config.scripts))
  );

  // replace placeholder in css
  const cssPath = path.resolve(config.output, "main.css");
  const css = fs.readFileSync(cssPath, { encoding: "utf-8" });
  fs.writeFileSync(
    cssPath,
    css.replace("MAIN_COLOR_PLACEHOLDER", config.theme.mainColor)
  );

  function scripts(data) {
    return data
      .map((d) => `<script src="./lib/${d.split("/").pop()}"></script>`)
      .join("");
  }
};
