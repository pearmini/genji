import { useRoute, useData } from "vitepress";
import { onMounted, watch } from "vue";
import { Module } from "./module";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ObjectInspector } from "react-inspector";
import { Observable } from "./observable";

function injectGlobal(global) {
  Object.assign(window, {
    ...global,
    display: (callback) => callback(),
    dispose: (node, callback) => {
      Object.assign(node, { __dispose__: callback });
      return node;
    },
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

function normalize(node, options) {
  if (isMountableNode(node)) return node;
  return renderObjectInspector(node, options);
}

function mount(block, node) {
  const cell = document.createElement("div");
  cell.classList.add("genji-cell");
  cell.appendChild(normalize(node));
  block.parentNode.insertBefore(cell, block);
}

function unmount(node) {
  if (node.__dispose__) node.__dispose__();
  node.remove();
}

function render(module, { isDark }) {
  module.dispose();
  const codes = document.querySelectorAll("[data-genji]");
  const blocks = Array.from(codes).filter((code) => {
    if (!code.dataset.genji) return false;
    return true;
  });
  if (!blocks.length) return;
  for (const block of blocks) {
    const { dataset } = block;
    const { lang } = dataset;
    const parser = parsers[lang];
    if (parser) {
      const pre = block.getElementsByClassName("shiki")[0];
      const code = pre.textContent.replace(/\n/g, "");
      const observable = new Observable((observer) => {
        const parsed = parser(code);
        const node = new Function(`return ${parsed}`)();
        const normalized = normalize(node, { isDark });
        observer.next(normalized);
        return () => unmount(normalized);
      });
      const observer = {
        next: (node) => mount(block, node),
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
