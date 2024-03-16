<script setup>
import { defineProps } from "vue";
import { useRender } from "./render";
import "./reset.css";
import "./style.css";
import "./inspector.css";
import "./inputs.css";

const { global = {}, Theme } = defineProps(["global", "Theme"]);

useRender({ global });
</script>

<template>
  <Theme.Layout></Theme.Layout>
</template>
