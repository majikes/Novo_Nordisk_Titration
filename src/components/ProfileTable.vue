<template>
  <div>
    <div class="grid grid-cols-4 py-2 bg-neutral-200">
      <div class="font-bold px-4">Time [h]</div>
      <div class="font-bold px-4">Basal [U/h]</div>
      <div class="font-bold px-4">ISF [mg/dL/U]</div>
      <div class="font-bold px-4">CR [g/U]</div>
    </div>
    <div v-for="(row, index) in profile" :key="index"
      class="grid grid-cols-4 py-2">
      <div v-for="(cell, subindex) in row" :key="subindex"
        class="px-4">
        {{ cell }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'

export default defineComponent({
  components: {},
  props: {
    profile: {
      required: true,
      type: Array as PropType<number[][]>
    },
  },
  setup(props) {
    
    return { }
  }
})
</script>