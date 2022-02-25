function compileHTML(html, config) {
  return html
    .replace("<!-- TITLE_PLACEHOLDER -->", config.title)
    .replace("<!-- ICON_PLACEHOLDER -->", config.logo)
    .replace("<!-- SCRIPTS_PLACEHOLDER-->", scripts(config.scripts));
}

function scripts(data) {
  return data
    .map((d) => `<script src="./lib/${d.split("/").pop()}"></script>`)
    .join("");
}

function compileCSS(css, config) {
  return css.replace("MAIN_COLOR_PLACEHOLDER", config.theme.mainColor);
}

module.exports = {
  compileHTML,
  compileCSS,
};
