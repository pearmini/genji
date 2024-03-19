<script setup>
import { defineProps } from "vue";
import { useRender } from "./render";
import "./reset.css";
import "./style.css";
import "./inspector.css";
import "./inputs.css";

const { transform = {}, library = {}, Theme } = defineProps(["transform", "library", "Theme"]);

useRender({ transform, library });
</script>

<template>
  <Theme.Layout></Theme.Layout>
</template>
