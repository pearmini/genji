<script setup>
import { defineProps } from "vue";
import { useRender } from "./render";
import "./style.css";

const { global = {}, Theme } = defineProps(["global", "Theme"]);

useRender({ global });
</script>

<template>
  <Theme.Layout></Theme.Layout>
</template>
