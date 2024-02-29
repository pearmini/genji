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

function render() {
  const blocks = document.getElementsByClassName("language-js");
  if (!blocks.length) return;
  for (const block of blocks) {
    const pre = block.getElementsByClassName("shiki")[0];
    const code = pre.textContent.replace(/\n/g, "");
    const node = new Function(`return ${code}`)();
    const cell = document.createElement("div");
    cell.classList.add("genji-cell");
    cell.appendChild(node);
    block.parentNode.insertBefore(cell, block);
  }
}
</script>

<template>
  <Theme.Layout></Theme.Layout>
</template>
