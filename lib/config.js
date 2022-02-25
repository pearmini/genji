const fs = require("fs");
const path = require("path");

function defineConfig(config = {}) {
  const {
    outline = {},
    input = "docs",
    output = "dist",
    assets = "assets",
    title = "Genji Notebook",
    logo = "https://s2.loli.net/2022/02/05/QvfOBrE4p6PgRxI.png",
    github = "https://github.com/pearmini/genji-notebook",
    link = "https://github.com/pearmini",
    notFound = {
      title: "Page Not Found",
      description: "We could not find what you were looking for.",
    },
    scripts = [],
    theme = {
      mainColor: "#28DF99",
    },
  } = config;

  return {
    outline,
    input,
    assets,
    title,
    logo,
    github,
    link,
    notFound,
    scripts,
    theme,
    output,
  };
}

function loadConfig() {
  if (fs.existsSync(path.resolve(".genjirc"))) {
    const file = fs.readFileSync(path.resolve(".genjirc"), "utf8");
    return defineConfig(JSON.parse(file));
  }
  return defineConfig();
}

module.exports = {
  defineConfig,
  loadConfig,
};
