module.exports = function () {
  const path = require("path");
  const watch = require("node-watch");
  const fs = require("fs");
  const http = require("http");
  const parse = require("../lib/parse");
  const config = require(path.resolve("genji.config.js"));

  const server = http.createServer(function (request, response) {
    if (request.url.endsWith(".js")) {
      const js = fs.readFileSync(
        path.resolve(__dirname, "../public/" + request.url),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "application/javascript" });
      response.end(js);
    } else if (request.url.endsWith(".json")) {
      const js = fs.readFileSync(
        path.resolve(__dirname, "../public/" + request.url),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(js);
    } else if (request.url.endsWith(".css")) {
      const css = fs.readFileSync(
        path.resolve(__dirname, "../public/" + request.url),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "text/css" });
      response.end(
        css.replace("MAIN_COLOR_PLACEHOLDER", config.theme.mainColor)
      );
    } else {
      const html = fs.readFileSync(
        path.resolve(__dirname, "../public/index.html"),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(
        html
          .replace("<!-- TITLE_PLACEHOLDER -->", config.title)
          .replace("<!-- ICON_PLACEHOLDER -->", config.logo)
      );
    }
  });

  writeNotebook(config);
  server.listen("8000", () => {
    console.log("http://localhost:8000/");
  });

  watch(path.resolve(config.input), { recursive: true }, () => {
    writeNotebook(config);
  });

  function writeNotebook(config) {
    const notebook = parse(config);
    fs.writeFileSync(
      path.resolve(__dirname, "../public/notebook.json"),
      JSON.stringify(notebook)
    );
  }
};
