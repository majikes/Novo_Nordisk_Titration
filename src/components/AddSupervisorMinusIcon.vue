<template>
  <div
    class="w-6 h-6 p-1 aspect-square absolute -top-2.5 -right-2.5 rounded-md z-10"
    :class="containerClassObj"
    title="Remove supervisor"
    @click="$emit('removeSupervisorClick')"
  >
    <div class="w-full aspect-square" ref="resizeRef">
      <!-- https://feathericons.dev/?search=minus-square&iconset=feather -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        :width="width"
        :height="height"
        class="fill-white stroke-rose-500 hover:fill-rose-500 hover:stroke-white"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
        <line x1="8" x2="16" y1="12" y2="12" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, PropType, ref } from "vue";
import { useElementSize } from "@vueuse/core";

// TODO are we REALLY going down the path of creating fancy splines
// in order to make a nice lil manila-folder like tabular extension
// of the parent bg color??? ..... seems unnecessary
// ... although if we push it down enough we only need the one
// surrounding curve?? maybe. idk.

const props = defineProps({
  evenrow: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
});
const containerClassObj = computed(() => {
  const retObj = {
    "bg-gray-100": !props.evenrow,
    "bg-white": props.evenrow,
  };
  return retObj;
});


const resizeRef = ref(null);
const { width, height } = useElementSize(resizeRef);
</script>
