<template>
  <!-- loading hover -->
  <div
    class="z-50 w-64 min-h-20 rounded-lg drop-shadow-lg absolute grid content-center place-items-center top-1/3 left-1/2 -translate-x-1/2 bg-white">
    <div class="p-4 animate-pulse">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">

</script>