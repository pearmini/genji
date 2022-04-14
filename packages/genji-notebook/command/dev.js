const path = require("path");
const fs = require("fs");
const http = require("http");
const nodemon = require("nodemon");

const { parse } = require("../lib/parse");
const { compileHTML, compileCSS, compileJS } = require("../lib/compile");
const { loadConfig } = require("../lib/config");

function dev() {
  let config = loadConfig();
  let metadata = parse(config);

  const server = http.createServer(function (request, response) {
    if (request.url.endsWith(".js")) {
      const js = javascript(request.url, config.scripts);
      response.writeHead(200, { "Content-Type": "application/javascript" });
      response.end(compileJS(js, config));
    } else if (request.url.endsWith(".json")) {
      const data = json(request.url, config.input, metadata);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(data));
    } else if (request.url.endsWith(".css")) {
      const css = fs.readFileSync(
        path.resolve(__dirname, "../public/" + request.url),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "text/css" });
      response.end(compileCSS(css, config));
    } else if (isImage(request.url)) {
      const data = image(request.url);
      response.writeHead(200, { "Content-Type": "image/png" });
      response.write(data, "binary");
      response.end();
    } else {
      const html = fs.readFileSync(
        path.resolve(__dirname, "../public/index.html"),
        "utf8"
      );
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(compileHTML(html, config));
    }
  });

  server.listen("8000", () => {
    console.log("Open http://localhost:8000/ in your browser.");
  });

  nodemon({
    watch: [
      // use
      path.resolve(config.input),
      path.resolve(".genjirc"),

      // dev
      path.resolve(__dirname),
      path.resolve(__dirname, "../lib"),
    ],
  });

  nodemon.on("restart", () => {
    console.log("reload...");
    config = loadConfig();
    metadata = parse(config);
  });
}

function javascript(url, scripts) {
  const last = url.split("/").pop();
  const map = new Map(scripts.map((d) => [d.split("/").pop(), d]));
  const filepath = map.has(last)
    ? path.resolve(map.get(last))
    : path.resolve(__dirname, "../public/" + url);
  return fs.readFileSync(filepath, "utf8");
}

function json(url, input, metadata) {
  const id = url.split("/").pop().replace(".json", "");
  if (id === "$metadata") return metadata;
  const file = filename(id, metadata);
  if (file === false) return {};
  const filepath = path.resolve(input, file + ".md");
  if (fs.existsSync(filepath)) {
    const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
    return { markdown };
  }
  return {};
}

function filename(id, metadata) {
  const { outline } = metadata;
  for (const node of outline) {
    const discovered = [node];
    while (discovered.length) {
      const n = discovered.pop();
      if (n.data.id === id) return n.data.file;
      discovered.push(...(n.children || []));
    }
  }
  return false;
}

function image(url) {
  const filepath = path.resolve("." + url);
  return fs.readFileSync(filepath, { encoding: "binary" });
}

function isImage(str) {
  const reg = /\.(png|jpg|gif|jpeg|webp)$/;
  return reg.test(str);
}

module.exports = dev;
