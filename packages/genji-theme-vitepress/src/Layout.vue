<script setup>
import { useRoute } from "vitepress";
import { onMounted, watch, defineProps } from "vue";
import { Module } from "./module";

const { global = {}, Theme } = defineProps(["global", "Theme"]);

const route = useRoute();

const module = new Module();

// Avoid mount multiple times because of hot reload in development.
if (import.meta.env.DEV) {
  if (window.__module__) window.__module__.dispose();
  window.__module__ = module;
}

watch(
  () => route.path,
  () => setTimeout(() => render())
);

onMounted(() => {
  injectGlobal();
  render();
});

function injectGlobal() {
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

function mount(block, node) {
  const cell = document.createElement("div");
  cell.classList.add("genji-cell");
  cell.appendChild(node);
  block.parentNode.insertBefore(cell, block);
}

function unmount(node) {
  if (node.__dispose__) node.__dispose__();
  node.remove();
}

function render() {
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
      module.add(parser(code), {
        next: (node) => mount(block, node),
        complete: unmount,
      });
    }
  }
}
</script>

<template>
  <Theme.Layout></Theme.Layout>
</template>
