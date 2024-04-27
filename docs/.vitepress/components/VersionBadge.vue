<script setup>
import { defineProps } from 'vue';

const { version } = defineProps(["version"]);

</script>

<template>
  <Badge type="info" class="version">
    <a :href="`https://github.com/pearmini/genji/releases/tag/${version}`" target="_blank">^{{ version }}</a>
  </Badge>
</template>

<style>
.VPBadge.version {
  background-color: var(--vp-c-brand-1) !important;
}

.VPBadge.version a {
  color: var(--vp-c-white) !important;
}
</style>