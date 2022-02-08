module.exports = function () {
  const path = require("path");
  const watch = require("node-watch");
  const fs = require("fs");
  const http = require("http");
  const parse = require("../lib/parse");
  const config = require(path.resolve("genji.config.js"));

  const server = http.createServer(function (request, response) {
    if (request.url.endsWith(".js")) {
      const js = javascript(request.url, config.scripts);
      response.writeHead(200, { "Content-Type": "application/javascript" });
      response.end(js);
    } else if (request.url.endsWith(".json")) {
      const json = fs.readFileSync(
        path.resolve(__dirname, "../public/" + request.url),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(json);
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
          .replace("<!-- SCRIPTS_PLACEHOLDER-->", scripts(config.scripts))
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

  function javascript(url, scripts) {
    const last = url.split("/").pop();
    const map = new Map(scripts.map((d) => [d.split("/").pop(), d]));
    const filepath = map.has(last)
      ? path.resolve(map.get(last))
      : path.resolve(__dirname, "../public/" + url);
    return fs.readFileSync(filepath, "utf8");
  }

  function scripts(data) {
    return data
      .map((d) => `<script src="./lib/${d.split("/").pop()}"></script>`)
      .join("");
  }

  function writeNotebook(config) {
    const notebook = parse(config);
    fs.writeFileSync(
      path.resolve(__dirname, "../public/notebook.json"),
      JSON.stringify(notebook)
    );
  }
};
