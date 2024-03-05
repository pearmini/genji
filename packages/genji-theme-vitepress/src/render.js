import { useRoute, useData } from "vitepress";
import { onMounted, watch } from "vue";
import { Module } from "./module";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ObjectInspector } from "react-inspector";
import { Observable } from "./observable";

const SCRIPT_PREFIX = "cell";

function injectGlobal(global) {
  Object.assign(window, {
    ...global,
    display: (callback) => callback(),
    dispose: (node, callback) => {
      Object.assign(node, { __dispose__: callback });
      return node;
    },
    Observable,
  });
}

const parsers = {
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
    render(isDark);
  });

  node.__dispose__ = () => root.unmount();

  return node;
}

function renderLoading() {
  const node = document.createElement("div");
  node.id = "genji-loading";
  node.classList.add("genji-loading");
  return node;
}

function normalize(node, options) {
  if (isMountableNode(node)) return node;
  return renderObjectInspector(node, options);
}

function mount(block, node) {
  const cell = document.createElement("div");
  cell.classList.add("genji-cell");
  cell.appendChild(normalize(node));

  const previous = block.previousElementSibling;
  const exist = previous && previous.classList.contains("genji-cell");

  if (exist) block.parentNode.replaceChild(cell, previous);
  else block.parentNode.insertBefore(cell, block);
}

function unmount(node) {
  if (!node) return;
  if (node.__dispose__) node.__dispose__();
  node.remove();
}

function renderError(e, { script }) {
  const [error] = e.stack.split("\n");
  const node = document.createElement("div");
  node.classList.add("genji-error");
  node.textContent = `${script}: ${error} (Open console for more details.)`;
  console.error(`${script}:`, e);
  return node;
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

function render(module, { isDark }) {
  module.dispose();

  const codes = document.querySelectorAll("[data-genji]");
  const blocks = Array.from(codes).filter((code) => {
    if (!code.dataset.genji) return false;
    return true;
  });

  if (!blocks.length) return;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const { dataset } = block;
    const { lang, parser, code: showCode } = dataset;
    const P = [parsers[lang], window[parser]].filter(Boolean);

    if (P.length) {
      const pre = block.getElementsByClassName("shiki")[0];
      const code = pre.textContent;
      const script = `${SCRIPT_PREFIX}-${i}.js`;

      if (showCode === "false") block.style.display = "none";

      const observable = new Observable((observer) => {
        let normalized;
        try {
          const parsed = parseCode(code, P);

          const node = new Function(
            lines(
              `const value = ${parsed}`,
              `return value //# sourceURL=${script}`
            )
          )();
          const next = (node) => {
            normalized = normalize(node, { isDark });
            observer.next(normalized);
          };
          if (node instanceof Promise) {
            next(renderLoading());
            node
              .then((d) => next(d))
              .catch((e) => {
                throw e;
              });
          } else if (node instanceof Observable) {
            node.subscribe({
              next: (d) => next(d),
              error: (e) => {
                throw e;
              },
            });
          } else {
            next(node);
          }
        } catch (e) {
          normalized = renderError(e, { script });
          observer.error(normalized);
        } finally {
          return () => unmount(normalized);
        }
      });

      const observer = {
        next: debounce((node) => mount(block, node)),
        error: debounce((node) => mount(block, node)),
      };

      module.add(observable, observer);
    }
  }
}

export function useRender({ global }) {
  const route = useRoute();
  const { isDark } = useData();
  const module = new Module();
  const renderModule = () => {
    render(module, { isDark: isDark.value });
  };

  // Avoid mount multiple times because of hot reload in development.
  if (import.meta.env.DEV) {
    if (window.__module__) window.__module__.dispose();
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
