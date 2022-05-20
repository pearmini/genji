const path = require("path");

function compileHTML(html, config) {
  return html
    .replace("<!-- TITLE_PLACEHOLDER -->", config.title)
    .replace("<!-- ICON_PLACEHOLDER -->", config.logo)
    .replace(/<!-- BASE -->/g, config.base)
    .replace("<!-- SCRIPTS_PLACEHOLDER-->", scripts(config));
}

function scripts(config) {
  const { scripts, base } = config;
  return scripts
    .map(
      (d) => `<script src="${base}/$genji_lib/${d.split("/").pop()}"></script>`
    )
    .join("");
}

function compileCSS(css, config) {
  return css.replace("MAIN_COLOR_PLACEHOLDER", config.theme.mainColor);
}

function compileJS(js, config) {
  return js.replace("/** BASE_PLACEHOLDER **/", config.base);
}

// Replace links shows in markdown.
function compileMD(markdown, config, filepath) {
  return markdown.replace(/\[.*\]\((.*)\)/g, (match, link) => {
    if (link.startsWith("https://") || link.startsWith("http://")) return match;
    const segments = filepath.split("/");
    segments.pop();
    const absolutePath = path.resolve(segments.join("/"), link);
    const relativePath = absolutePath
      // remove the prefix config.input for markdown link
      .replace(path.resolve(config.input), "")
      // remove the prefix as root path
      .replace(path.resolve(), "");
    const webPath = path.join(config.base, relativePath);
    return match.replace(link, webPath);
  });
}

module.exports = {
  compileHTML,
  compileCSS,
  compileJS,
  compileMD,
};
