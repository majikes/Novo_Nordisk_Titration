<template>
  <!-- https://feathericons.dev/?search=chevron-down&iconset=feather -->
  <svg
    v-if="desc && visible"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    class="main-grid-item-icon"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
  <!-- https://feathericons.dev/?search=chevron-up&iconset=feather -->
  <svg
    v-if="!desc && visible"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    class="main-grid-item-icon"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
</template>

<script setup lang="ts">
import { defineProps, PropType, ref } from "vue";

const props = defineProps({
  desc: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
  visible: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
});
</script>
