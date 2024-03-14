import { useRoute, useData } from "vitepress";
import { onMounted, watch } from "vue";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ObjectInspector } from "react-inspector";
import { Observable } from "./observable";
import { tokenize, parseScript } from "esprima";

const SCRIPT_PREFIX = "cell";

function injectGlobal(global) {
  Object.assign(window, {
    ...global,
    display: (callback) => callback(),
    Observable,
  });
}

const transforms = {
  js: (d) => d,
  javascript: (d) => d,
};

function isMountableNode(node) {
  return node instanceof HTMLElement || node instanceof SVGElement;
}

function renderObjectInspector(data, { isDark }) {
  const node = document.createElement("div");
  node.classList.add("genji-object-inspector");

  const root = createRoot(node);
  const render = (isDark) => {
    root.render(
      createElement(ObjectInspector, {
        data,
        showNonenumerable: true,
        theme: isDark ? "chromeDark" : "chromeLight",
      })
    );
  };

  render(isDark);

  // Rerender when theme changes.
  window.addEventListener("theme-change", (event) => {
    const { isDark } = event.detail;
    if (root.isMounted) render(isDark);
  });

  return [node, () => root.unmount()];
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
  return [name, code, params];
}

function createCallNode(code, ast) {
  return [, code];
}

function createExpressionNode(code, ast) {
  return [, code];
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

function parseVariable(code) {
  const tokens = tokenize(code);
  const ast = parseScript(code);
  const [name, expression, params = []] = normalizeVariable(ast, code);
  const paramNames = params.map((d) => d.name);
  return { name, expression, tokens, ast, params: paramNames };
}

function createVariable(block, index) {
  const { lang, t = "" } = block.dataset;
  const P = [transforms[lang], ...t.split(",").map((d) => window[d])].filter(
    Boolean
  );

  if (!P.length) return null;

  const dom = block.getElementsByClassName("shiki")[0];
  const code = dom.textContent;
  const parsed = parseCode(code, P);
  return {
    code: parsed,
    id: index,
    ...parseVariable(parsed),
  };
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
      if (ref1 && ref2) {
        throw new Error(`Circular Reference for ${n1.name} and ${n2.name}`);
      }
      if (ref1) {
        r1.to.push(n2.id);
        r2.from.push(n1.id);
      } else if (ref2) {
        r1.from.push(n2.id);
        r2.to.push(n1.id);
      }
    }
  }
  return relationById;
}

function isReference(n1, n2) {
  const { name } = n1;
  const { tokens, params } = n2;
  return tokens
    .filter((d) => !params.includes(d.value))
    .some((d) => d.type === "Identifier" && d.value === name);
}

function rootsOf(relationById) {
  return Array.from(relationById.entries())
    .filter(([, d]) => d.from.length === 0)
    .map(([id]) => id);
}

function execute(
  id,
  nodeById,
  relationById,
  valueById,
  countById,
  disposeById,
  hooks
) {
  const delay = 10;
  const loading = debounce(hooks.loading, delay);
  const success = debounce(hooks.success, delay);
  const error = debounce(hooks.error, delay);

  const node = nodeById.get(id);

  const { expression } = node;
  const relation = relationById.get(id);
  const { from, to } = relation;
  const names = from.map((id) => nodeById.get(id).name);
  const deps = from.map((id) => valueById.get(id));

  const executeDeps = () => {
    for (const toId of to) {
      const count = countById.get(toId);
      if (count - 1 <= 0) {
        countById.set(toId, 0);
        execute(
          toId,
          nodeById,
          relationById,
          valueById,
          countById,
          disposeById,
          hooks
        );
      } else {
        countById.set(toId, count - 1);
      }
    }
  };

  const next = (values) => {
    let dispose = () => {};
    const unsubscribe = (callback) => (dispose = callback);

    const output = new Function(
      "unsubscribe",
      ...names,
      lines(
        `const value = ${expression}`,
        `return value //# sourceURL=${SCRIPT_PREFIX}-${id}.js`
      )
    )(unsubscribe, ...values);

    if (output instanceof Observable) {
      let resolved = false;

      const subscription = output.subscribe({
        next: (value) => {
          if (resolved) {
            // If a node is mounted, there is new need to update the node.
            setTimeout(() => {
              valueById.set(id, value);
              executeDeps();
            }, delay);
          } else {
            valueById.set(id, value);
            executeDeps();
            success(node);
          }
        },
        resolve: (value) => {
          resolved = true;
          valueById.set(id, value);
          success(node);
        },
      });

      const prevDispose = disposeById.get(id);
      prevDispose && prevDispose();

      dispose = () => subscription.unsubscribe();
      disposeById.set(id, dispose);
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

function render(module, { isDark }) {
  dispose(module);

  const codes = document.querySelectorAll("[data-genji]");
  const blocks = Array.from(codes).filter((code) => {
    if (!code.dataset.genji) return false;
    return true;
  });

  createCells(blocks);

  if (!blocks.length) return;

  const variables = blocks.map(createVariable).filter(Boolean);
  const relationById = createGraph(variables);
  const nodeById = new Map(variables.map((d) => [d.id, d]));
  const valueById = new Map(variables.map((d) => [d.id, undefined]));
  const countById = new Map(
    variables.map((d) => [d.id, relationById.get(d.id).from.length])
  );
  const roots = rootsOf(relationById);

  for (const root of roots) {
    execute(root, nodeById, relationById, valueById, countById, module, {
      loading: ({ id }) => {
        const block = blocks[id];
        const [node, dispose] = renderLoading();
        node.__dispose__ = dispose;
        mount(block, node);
      },
      success: ({ id }) => {
        const block = blocks[id];
        const node = valueById.get(id);
        const [normalized, dispose] = renderInspector(node, { isDark });
        normalized.__dispose__ = dispose;
        mount(block, normalized);
      },
      error: (e, { id }) => {
        const block = blocks[id];
        const [error, dispose] = renderError(e, {
          script: `${SCRIPT_PREFIX}-${id}.js`,
        });
        error.__dispose__ = dispose;
        mount(block, error);
      },
    });
  }
}

export function useRender({ global }) {
  const route = useRoute();
  const { isDark } = useData();
  const module = new Map();

  const renderModule = () => {
    render(module, { isDark: isDark.value });
  };

  // Avoid mount multiple times because of hot reload in development.
  if (import.meta.env.DEV) {
    if (window.__module__) dispose(window.__module__);
    window.__module__ = module;
  }

  watch(
    () => route.path,
    () => setTimeout(() => renderModule())
  );

  watch(
    () => isDark.value,
    () => {
      window.dispatchEvent(
        new CustomEvent("theme-change", { detail: { isDark: isDark.value } })
      );
    }
  );

  onMounted(() => {
    injectGlobal(global);
    renderModule();
  });
}
