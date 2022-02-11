module.exports = function () {
  const path = require("path");
  const watch = require("node-watch");
  const fs = require("fs");
  const http = require("http");
  const parse = require("../lib/parse");
  const config = require(path.resolve("genji.config.js"));

  let notebook = parse(config);

  const server = http.createServer(function (request, response) {
    if (request.url.endsWith(".js")) {
      const js = javascript(request.url, config.scripts);
      response.writeHead(200, { "Content-Type": "application/javascript" });
      response.end(js);
    } else if (request.url.endsWith(".json")) {
      const data = json(request.url, config.input);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(data));
    } else if (request.url.endsWith(".css")) {
      const css = fs.readFileSync(
        path.resolve(__dirname, "../public/" + request.url),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "text/css" });
      response.end(
        css.replace("MAIN_COLOR_PLACEHOLDER", config.theme.mainColor)
      );
    } else if (isImage(request.url)) {
      const data = image(request.url, config.assets);
      response.writeHead(200, { "Content-Type": "image/png" });
      response.write(data, "binary");
      response.end();
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

  server.listen("8000", () => {
    console.log("http://localhost:8000/");
  });

  watch(path.resolve(config.input), { recursive: true }, () => {
    notebook = parse(config);
  });

  function javascript(url, scripts) {
    const last = url.split("/").pop();
    const map = new Map(scripts.map((d) => [d.split("/").pop(), d]));
    const filepath = map.has(last)
      ? path.resolve(map.get(last))
      : path.resolve(__dirname, "../public/" + url);
    return fs.readFileSync(filepath, "utf8");
  }

  function json(url, input) {
    const filename = url.split("/").pop().replace(".json", ".md");
    if (filename === "metadata.md") return notebook;
    const filepath = path.resolve(input, filename);
    if (fs.existsSync(filepath)) {
      const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
      return { markdown, code: 1 };
    }
    return { code: 0 };
  }

  function scripts(data) {
    return data
      .map((d) => `<script src="./lib/${d.split("/").pop()}"></script>`)
      .join("");
  }

  function image(url, assets) {
    const filepath = path.resolve('.' + url);
    return fs.readFileSync(filepath, { encoding: "binary" });
  }

  function isImage(str) {
    var reg = /\.(png|jpg|gif|jpeg|webp)$/;
    return reg.test(str);
  }
};
