import { Inspector } from "@observablehq/inspector";
import * as Signals from "./signal.js";
import * as Inputs from "./inputs.js";
import * as stdlibs from "./stdlib.js";
import Signal from "./signal.js";
import { run, createGraph, builtinVariable, SCRIPT_PREFIX } from "./graph.js";
import { parseVariable } from "./parse.js";
import { parseMeta } from "./node.js";

function assignLibrary(library = {}) {
  Object.assign(window, library);
}

const transforms = {
  js: (d) => d,
  javascript: (d) => d,
};

function isMountableNode(node) {
  return node instanceof HTMLElement || node instanceof SVGElement;
}

function renderObjectInspector(data) {
  const node = document.createElement("div");
  node.classList.add("genji-object-inspector");
  const inspector = new Inspector(node);
  inspector.fulfilled(data);
  return [node, () => {}];
}

function renderLoading() {
  const node = document.createElement("div");
  node.id = "genji-loading";
  node.classList.add("genji-loading");
  return [node, () => {}];
}

function renderInspector(node, options) {
  if (isMountableNode(node)) return [node, () => {}];
  return renderObjectInspector(node, options);
}

function mount(block, node) {
  if (!block) return;
  const cell = block.__cell__;
  if (!cell.firstChild) cell.appendChild(node);
  else {
    if (cell.firstChild.__dispose__) cell.firstChild.__dispose__();
    cell.replaceChild(node, cell.firstChild);
  }
}

function renderError(e, { script }) {
  const [error] = e.stack.split("\n");
  const node = document.createElement("span");
  node.classList.add("genji-error");
  node.textContent = `${script}: ${error} (Open console for more details.)`;
  console.error(`${script}:`, e);
  return [node, () => {}];
}

function parseCode(code, parsers) {
  return parsers.reduce((acc, parser) => parser(acc), code);
}

function debounce(callback, wait = 10) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      callback.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function identity(d) {
  return d;
}

function createVariable(block, index, customTransforms) {
  const { lang, t = "", ...rest } = block.dataset;
  const P = [transforms[lang] || identity, ...t.split(",").map((d) => customTransforms[d])].filter(Boolean);

  if (!P.length) return null;

  const dom = block.getElementsByTagName("pre")[0];
  const code = dom.textContent;
  const parsed = parseCode(code, P);
  return {
    code: parsed,
    id: index,
    options: rest,
    ...parseVariable(parsed),
  };
}

function rootsOf(relationById) {
  return Array.from(relationById.entries())
    .filter(([, d]) => d.to.length === 0)
    .map(([id]) => id);
}

function dispose(module) {
  module._scrolled = false;
  const values = module.values();
  try {
    for (const value of values) if (value) value();
  } catch (e) {
    console.error(e);
  } finally {
    module.clear();
  }
}

function clearCells(blocks) {
  for (const block of blocks) {
    const cell = block.__cell__;
    if (cell) cell.innerHTML = "";
  }
}

function setCells(blocks) {
  for (const block of blocks) {
    const { code, inspector, overflow = "auto" } = block.dataset;
    const cell = block.__cell__;
    if (code === "false") block.style.display = "none";
    if (overflow !== "auto" && overflow !== "undefined") {
      cell.style.overflow = overflow;
      cell.style.display = "block"; // TODO Remove this.
    }
    if (inspector === "false") cell.style.display = "none";
  }
}

function printDevTrees(path, relationById, variables) {
  const head = "=".repeat(5) + " " + path.replace("/", "") + " " + "=".repeat(5);
  console.log(`\n${head}`);
  const roots = rootsOf(relationById);
  const print = (id, level = 0) => {
    const { expression } = variables.find((d) => d.id === id);
    const relation = relationById.get(id);
    const { from } = relation;
    const space = "....".repeat(level);
    const lines = expression
      .split("\n")
      .map((d) => `${space}${d}`)
      .join("\n");
    console.log(lines);
    for (const id of from) print(id, level + 1);
  };
  for (const id of roots) print(id);
  console.log("=".repeat(head.length));
}

function getAnchorInCurrentURL() {
  const url = new URL(window.location.href);
  return url.hash.slice(1);
}

function span(text, style) {
  const span = document.createElement("span");
  span.textContent = text;
  if (style) span.style = style;
  return span;
}

function scrollToAnchor() {
  const anchor = getAnchorInCurrentURL();
  if (!anchor) return;
  const a = document.querySelector(`a[href="#${anchor}"]`);
  if (!a) return;
  a.click();
}

function maybeCodegroup(node, code) {
  const group = node.closest(".vp-code-group");
  if (!group) return;
  const parent = group.parentElement;
  parent.insertBefore(node, group);
  if (node.classList.contains("active")) code.classList.add("active");
}

const quoteByBlocks = new Map();

function inferQuoted(blocks) {
  if (quoteByBlocks.has(blocks)) return quoteByBlocks.get(blocks);

  let singleQuotedCount = 0;
  let doubleQuotedCount = 0;

  for (const block of blocks) {
    const text = block.textContent;
    singleQuotedCount += (text.match(/'/g) || []).length;
    doubleQuotedCount += (text.match(/"/g) || []).length;
  }

  quoteByBlocks.set(blocks, singleQuotedCount > doubleQuotedCount);
  return quoteByBlocks.get(blocks);
}

function render(module, { root, isDark, path, transform = {}, isDev = false, numberStyle, stringStyle }) {
  dispose(module);

  const scroll = debounce(scrollToAnchor);

  const blocks = Array.from(root.querySelectorAll(".genji-cell"))
    .filter((node) => node.dataset.options)
    .map((d) => {
      const block = d.nextElementSibling;
      maybeCodegroup(d, block);
      block.__cell__ = d;
      Object.assign(block.dataset, parseMeta(d.dataset.options));
      return block;
    });

  const isSingleQuoted = inferQuoted(blocks);

  if (!blocks.length) return;

  clearCells(blocks);
  setCells(blocks);

  const errors = [];
  const variables = blocks
    .map((d, i) => {
      try {
        return createVariable(d, i, transform);
      } catch (e) {
        errors.push([i, e]);
        return null;
      }
    })
    .filter(Boolean);

  builtinVariable(variables, { isDark });

  const loading = ({ id }) => {
    const block = blocks[id];
    const [node, dispose] = renderLoading();
    node.__dispose__ = dispose;
    mount(block, node);
  };

  const success = ({ id }, { names, values, value: node }) => {
    const block = blocks[id];
    if (!block) return;
    const [normalized, dispose] = renderInspector(node, { isDark });
    normalized.__dispose__ = dispose;
    mount(block, normalized);

    const format = (value) => (typeof value === "string" ? (isSingleQuoted ? `'${value}'` : `"${value}"`) : value);
    const style = (value) => (typeof value === "number" ? numberStyle : stringStyle);

    // Replace magic variables with values.
    // For example: const width = $$number$$ will be replaced with const width = 50.
    if (block.__textNodeByName__) {
      for (const [name, node] of block.__textNodeByName__) {
        const value = values[names.indexOf(name)];
        const stringedValue = format(value);
        node.textContent = stringedValue;
      }
    } else {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      const textNodeByNode = new Map();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent;
        for (const name of names) {
          if (!name.startsWith("$$") || !name.endsWith("$$")) continue;
          const startIndex = text.indexOf(name);
          if (startIndex !== -1) {
            const value = values[names.indexOf(name)];
            const stringedValue = format(value);
            const prefix = text.slice(0, startIndex);
            const suffix = text.slice(startIndex + name.length);
            const parent = node.parentElement;
            const prefixSpan = span(prefix);
            const suffixSpan = span(suffix);
            const valueSpan = span(stringedValue, style(value));
            parent.innerHTML = "";
            if (prefix) parent.appendChild(prefixSpan);
            parent.appendChild(valueSpan);
            if (suffix) parent.appendChild(suffixSpan);
            textNodeByNode.set(name, valueSpan);
          }
        }
      }
      block.__textNodeByName__ = textNodeByNode;
    }

    if (!module._scrolled) scroll();
  };

  const error = (e, { id }) => {
    const block = blocks[id];
    const [error, dispose] = renderError(e, {
      script: `${SCRIPT_PREFIX}-${id}.js`,
    });
    error.__dispose__ = dispose;
    mount(block, error);
  };

  if (isDev) printDevTrees(path, createGraph(variables), variables);

  run(variables, { disposeById: module, loading, success, error });

  for (const [id, e] of errors) error(e, { id });
}

export class Page {
  constructor(options = {}) {
    this._options = options;

    const module = new Map();
    this._module = module;

    // Scroll to anchor
    module._scrolled = false;
    this._onScroll = () => (module._scrolled = true);
    window.addEventListener("wheel", this._onScroll);

    this._events = {};
    this.on("dark", (value) => window.dispatchEvent(new CustomEvent("dark", { detail: value })));
  }
  render(root = document.body) {
    const { library, ...rest } = this._options;
    assignLibrary({
      ...library,
      ...stdlibs,
      Signals,
      Signal,
      Inputs,
    });
    render(this._module, { ...rest, root });
  }
  dispose() {
    dispose(this._module);
    window.removeEventListener("wheel", this._onScroll);
    for (const event in this._events) this._events[event] = [];
  }
  emit(event, ...value) {
    const callbacks = this._events[event] || [];
    for (const callback of callbacks) callback(...value);
  }
  on(event, callback) {
    const callbacks = this._events[event] || [];
    callbacks.push(callback);
    this._events[event] = callbacks;
  }
}
