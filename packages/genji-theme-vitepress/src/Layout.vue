<script setup>
import { useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { onMounted, watch } from "vue";
import * as stdlib from "./stdlib";

const { Layout } = DefaultTheme;

const route = useRoute();
watch(
  () => route.path,
  () => setTimeout(() => render())
);

onMounted(() => {
  injectStdlib();
  render();
});

function injectStdlib() {
  Object.assign(window, stdlib);
}

function render() {
  const block = document.getElementsByClassName("language-js")[0];
  if (!block) return;
  const pre = document.getElementsByClassName("shiki")[0];
  if (!pre) return;
  const code = pre.textContent.replace(/\n/g, "");
  const node = new Function(`return ${code}`)();
  const cell = document.createElement("div");
  cell.classList.add("genji-cell");
  cell.appendChild(node);
  block.parentNode.insertBefore(cell, block);
}
</script>

<template>
  <Layout></Layout>
</template>
