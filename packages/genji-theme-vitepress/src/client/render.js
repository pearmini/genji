import { useRoute, useData } from "vitepress";
import { onMounted, watch, onBeforeUnmount } from "vue";
import { tokenize, parseScript } from "esprima";
import { traverse } from "estraverse";
import { Inspector } from "@observablehq/inspector";
import * as Signals from "./signal";
import * as Inputs from "./inputs";
import * as libs from "./stdlib";
import Signal from "./signal";
import { dev } from "./dev";
import { onHMR } from "./hmr";

const SCRIPT_PREFIX = "cell";

function injectGlobal(global = {}) {
  Object.assign(window, {
    ...global,
    ...libs,
    Signals,
    Signal,
    Inputs,
  });
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
  const previous = block.previousElementSibling;
  const exist = previous && previous.classList.contains("genji-cell");
  if (!exist) return;
  if (previous.firstChild) {
    if (previous.firstChild.__dispose__) previous.firstChild.__dispose__();
    previous.replaceChild(node, previous.firstChild);
  } else previous.appendChild(node);
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

function lines(...L) {
  return L.join(`\n`);
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

function splitByEqual(content) {
  const index = content.split("").findIndex((d) => d === "=");
  const before = content.slice(0, index);
  const after = content.slice(index + 1, content.length);
  return [before, after];
}

function createAssignmentNode(code, ast) {
  const [name, value] = splitByEqual(code);
  const params = ast.body[0]?.expression?.right?.params || [];
  return [name.trim(), value.trim(), params];
}

function createVariableNode(code, ast) {
  const [prefix, value] = splitByEqual(code);
  const name = prefix.trim().split(" ").pop();
  const params = ast.body[0]?.declarations[0]?.init?.params || [];
  return [name.trim(), value.trim(), params];
}

function createFunctionNode(code, ast) {
  const { name } = ast.body[0].id;
  const { params } = ast.body[0];
  const normalized = params.map((d) => {
    // function add(a, b = 10) { return a + b; }
    if (d.type === "AssignmentPattern") return d.left;
    return d;
  });
  return [name, code, normalized];
}

function createCallNode(code) {
  return [undefined, code];
}

function createExpressionNode(code) {
  return [undefined, code];
}

function typeOfExpression(ast) {
  return ast.body[0]?.expression?.type;
}

function typeOfBody(ast) {
  return ast.body[0]?.type;
}

function isAssignment(ast) {
  return typeOfExpression(ast) === "AssignmentExpression";
}

function isCall(ast) {
  return typeOfExpression(ast) === "CallExpression";
}

function isVariableDeclaration(ast) {
  return typeOfBody(ast) === "VariableDeclaration";
}

function isFunctionDeclaration(ast) {
  return typeOfBody(ast) === "FunctionDeclaration";
}

function isExpression(ast) {
  return typeOfBody(ast) === "ExpressionStatement";
}

function normalizeVariable(ast, code) {
  if (isAssignment(ast)) return createAssignmentNode(code, ast);
  if (isCall(ast)) return createCallNode(code);
  if (isFunctionDeclaration(ast)) return createFunctionNode(code, ast);
  if (isVariableDeclaration(ast)) return createVariableNode(code, ast);
  if (isExpression(ast)) return createExpressionNode(code, ast);
  return [undefined, ""];
}

// TODO
function getExternalDeps(ast) {
  const externalDeps = [];
  traverse(ast, {
    enter: function () {},
  });
  return externalDeps;
}

function parseVariable(code) {
  const tokens = tokenize(code);
  const ast = parseScript(code);
  const [name, expression, params = []] = normalizeVariable(ast, code);
  const deps = getExternalDeps(ast);
  const paramNames = params.map((d) => d.name);
  return { name, expression, tokens, ast, params: paramNames, deps };
}

function identity(d) {
  return d;
}

function createVariable(block, index, customTransforms) {
  const { lang, t = "", ...rest } = block.dataset;
  const P = [transforms[lang] || identity, ...t.split(",").map((d) => customTransforms[d])].filter(Boolean);

  if (!P.length) return null;

  const dom = block.getElementsByClassName("shiki")[0];
  const code = dom.textContent;
  const parsed = parseCode(code, P);
  return {
    code: parsed,
    id: index,
    options: rest,
    ...parseVariable(parsed),
  };
}

function builtinVariable(variables) {
  const builtins = [
    ["width", "width = Signals.width()"],
    ["now", "now = Signals.now()"],
  ];
  const names = new Set(variables.map((d) => d.name));
  let id = -1;
  for (const [name, code] of builtins) {
    if (names.has(name)) continue;
    const variable = {
      code,
      id: id--,
      options: {},
      ...parseVariable(code),
    };
    variables.push(variable);
  }
  return variables;
}

function createGraph(nodes) {
  const relationById = new Map(nodes.map((n) => [n.id, { from: [], to: [] }]));
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      const r1 = relationById.get(n1.id);
      const r2 = relationById.get(n2.id);
      const ref1 = isReference(n1, n2);
      const ref2 = isReference(n2, n1);
      if (ref1) {
        r1.to.push(n2.id);
        r2.from.push(n1.id);
      }
      if (ref2) {
        r1.from.push(n2.id);
        r2.to.push(n1.id);
      }
    }
  }
  return relationById;
}

// TODO: work with deps to avoid wrong execution order.
function isReference(n1, n2) {
  const { name } = n1;
  const { tokens, params } = n2;
  return tokens
    .filter((d) => !params.includes(d.value))
    .some((d, i) => {
      return (
        d.type === "Identifier" &&
        d.value === name &&
        // Is not a variable assignment.
        (!tokens[i + 1] || tokens[i + 1].value !== "=") &&
        // Is not a variable declaration.
        (!tokens[i - 1] || tokens[i - 1].value !== "let") &&
        (!tokens[i - 1] || tokens[i - 1].value !== "const") &&
        (!tokens[i - 1] || tokens[i - 1].value !== "var") &&
        // Is not a object property.
        (!tokens[i - 1] || tokens[i - 1].value !== ".")
      );
    });
}

function isCircular(relationById, id) {
  const relation = relationById.get(id);
  const { from, to } = relation;
  return from.some((id) => to.includes(id));
}

function leavesOf(relationById) {
  return Array.from(relationById.entries())
    .filter(([, d]) => {
      const { from } = d;
      if (from.length === 0) return true;
      if (from.every((d) => isCircular(relationById, d))) return true;
      return false;
    })
    .map(([id]) => id);
}

function rootsOf(relationById) {
  return Array.from(relationById.entries())
    .filter(([, d]) => d.to.length === 0)
    .map(([id]) => id);
}

function execute(id, nodeById, relationById, valueById, countById, disposeById, idByName, hooks) {
  const { loading, success, error } = hooks;

  const node = nodeById.get(id);

  const { expression, name } = node;

  if (name !== undefined && idByName.get(name) !== id) {
    error(new SyntaxError(`Identifier ${name} has already been declared.`), node);
    return;
  }

  const relation = relationById.get(id);
  const { from, to } = relation;
  const names = from.map((id) => nodeById.get(id).name);
  const deps = from.map((id) => valueById.get(id));

  for (const fromId of from) {
    const { from: fromIds } = relationById.get(fromId);
    if (fromIds.includes(id)) {
      error(new SyntaxError(`Circular dependency detected.`), node);
      return;
    }
  }

  const executeDeps = () => {
    for (const toId of to) {
      const count = countById.get(toId);
      if (count - 1 <= 0) {
        countById.set(toId, 0);
        execute(toId, nodeById, relationById, valueById, countById, disposeById, idByName, hooks);
      } else {
        countById.set(toId, count - 1);
      }
    }
  };

  const next = (values) => {
    let dispose = () => {};
    const unsubscribe = (callback) => (dispose = callback);

    let output;
    try {
      const e = expression === "" ? "undefined" : expression;
      output = new Function(
        "unsubscribe",
        ...names,
        lines(`const value = ${e}`, `return value //# sourceURL=${SCRIPT_PREFIX}-${id}.js`),
      )(unsubscribe, ...values);
    } catch (e) {
      error(e, node);
      return;
    }

    if (output instanceof Signal) {
      try {
        let resolved = false;

        // Make sure next is called after view is called.
        const next = (value) => {
          setTimeout(() => {
            // If a node is mounted, there is new need to update the node.
            if (resolved) {
              setTimeout(() => {
                valueById.set(id, value);
                executeDeps();
              }, 0);
            } else {
              valueById.set(id, value);
              executeDeps();
              success(node);
            }
          }, 0);
        };

        const view = (value) => {
          resolved = true;
          valueById.set(id, value);
          success(node);
        };

        const subscription = output.subscribe(next, view);

        const prevDispose = disposeById.get(id);
        prevDispose && prevDispose();

        dispose = () => subscription.unsubscribe();
        disposeById.set(id, dispose);
      } catch (e) {
        error(e, node);
        return;
      }
    } else {
      if (output instanceof Promise) loading(node);

      const promise = Promise.resolve(output)
        .then((value) => {
          const prevDispose = disposeById.get(id);
          prevDispose && prevDispose();

          valueById.set(id, value);
          disposeById.set(id, dispose);
          success(node);
          return Promise.resolve(value);
        })
        .catch((e) => error(e, node));

      valueById.set(id, promise);
      executeDeps();
    }
  };

  if (deps.some((d) => d instanceof Promise)) {
    loading(node);
    Promise.all(deps)
      .then((values) => next(values))
      .catch((e) => error(e, node));
  } else {
    next(deps);
  }
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

function createCells(blocks) {
  const oldBlocks = document.querySelectorAll(".genji-cell");
  oldBlocks.forEach((block) => block.remove());
  for (const block of blocks) {
    const container = document.createElement("div");
    container.classList.add("genji-cell");
    block.parentNode.insertBefore(container, block);
  }
}

function hideCells(blocks) {
  for (const block of blocks) {
    const { code, inspector } = block.dataset;
    if (code === "false") block.style.display = "none";
    if (inspector === "false") {
      const sibling = block.previousElementSibling;
      if (sibling.classList.contains("genji-cell")) {
        sibling.style.display = "none";
      }
    }
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

function scrollToAnchor() {
  const anchor = getAnchorInCurrentURL();
  if (!anchor) return;
  const a = document.querySelector(`a[href="#${anchor}"]`);
  if (!a) return;
  a.click();
}

function render(module, { isDark, path, transform = {} }) {
  dispose(module);

  const codes = document.querySelectorAll("[data-genji]");
  const blocks = Array.from(codes).filter((code) => {
    if (!code.dataset.genji) return false;
    return true;
  });
  const scroll = debounce(scrollToAnchor);

  if (!blocks.length) return;

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

  builtinVariable(variables);
  createCells(blocks);
  hideCells(blocks);

  const relationById = createGraph(variables);
  const nodeById = new Map(variables.map((d) => [d.id, d]));
  const valueById = new Map(variables.map((d) => [d.id, undefined]));
  const countById = new Map(variables.map((d) => [d.id, relationById.get(d.id).from.length]));
  const idByName = new Map();
  for (const { name, id } of variables) {
    if (!idByName.has(name) && name !== undefined) idByName.set(name, id);
  }

  const leaves = leavesOf(relationById);

  dev(() => printDevTrees(path, relationById, variables), false);

  const loading = ({ id }) => {
    const block = blocks[id];
    const [node, dispose] = renderLoading();
    node.__dispose__ = dispose;
    mount(block, node);
  };

  const success = ({ id }) => {
    const block = blocks[id];
    const node = valueById.get(id);
    if (!block) return;
    const [normalized, dispose] = renderInspector(node, { isDark });
    normalized.__dispose__ = dispose;
    mount(block, normalized);
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

  for (const root of leaves) {
    execute(root, nodeById, relationById, valueById, countById, module, idByName, {
      loading,
      success,
      error,
    });
  }

  for (const [id, e] of errors) error(e, { id });
}

export function useRender({ library, transform }) {
  const route = useRoute();
  const { isDark, site } = useData();
  const module = new Map();

  module._scrolled = false;

  const renderPage = () => {
    setTimeout(() => {
      render(module, { isDark: isDark.value, path: route.path, transform });
    }, 20);
  };

  // Avoid mount multiple times because of hot reload in development.
  dev(() => {
    if (window.__module__) dispose(window.__module__);
    window.__module__ = module;
  });

  dev(() => {
    onHMR(() => renderPage(), site.value.base);
  });

  watch(
    () => route.path,
    () => renderPage(),
  );

  watch(
    () => isDark.value,
    () => {
      window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: isDark.value } }));
    },
  );

  const onScroll = () => {
    module._scrolled = true;
  };

  onMounted(() => {
    injectGlobal(library);
    renderPage();
    window.addEventListener("wheel", onScroll);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("wheel", onScroll);
  });
}
