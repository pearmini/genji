<script setup>
import { useRoute } from "vitepress";
import { onMounted, watch, defineProps } from "vue";

const { global = {}, Theme } = defineProps(["global", "Theme"]);

const route = useRoute();

watch(
  () => route.path,
  () => setTimeout(() => render())
);

onMounted(() => {
  injectGlobal();
  render();
});

function injectGlobal() {
  Object.assign(window, global);
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

function render() {
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
      const node = new Function(`return ${parser(code)}`)();
      mount(block, node);
    }
  }
}
</script>

<template>
  <Theme.Layout></Theme.Layout>
</template>
