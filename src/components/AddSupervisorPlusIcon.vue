<template>
  <!-- https://feathericons.dev/?search=plus-square&iconset=feather -->
  <div
    class="w-6 h-6 p-1 aspect-square absolute -bottom-3.5 -right-2 rounded-md z-10"
    :class="containerClassObj"
    :title="containerClassTooltip"
    @click="showAddSupervisorListModal"
  >
    <div class="w-full aspect-square" ref="resizeRef">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        :width="width"
        :height="height"
        class="main-grid-item-icon"
        :class="svgClassObj"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
        <line x1="12" x2="12" y1="8" y2="16" />
        <line x1="8" x2="16" y1="12" y2="12" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, PropType, ref } from "vue";
import { useElementSize } from "@vueuse/core";

// TODO are we REALLY going down the path of creating fancy splines
// in order to make a nice lil manila-folder like tabular extension
// of the parent bg color??? ..... seems unnecessary
// ... although if we push it down enough we only need the one
// surrounding curve?? maybe. idk.

const props = defineProps({
  disabled: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
  evenrow: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
});

const emit = defineEmits(["addSupervisorClick"]);

function showAddSupervisorListModal() {
  if (!props.disabled) {
    emit("addSupervisorClick")
  }
}

const svgClassObj = computed(() => {
  const retObj = {
    "fill-white stroke-gray-300": props.disabled,
    "fill-white stroke-emerald-500": !props.disabled,
  };
  return retObj;
});
const containerClassObj = computed(() => {
  const retObj = {
    "bg-gradient-to-t via-gray-100 from-gray-100": !props.evenrow,
    "bg-gradient-to-t via-white from-white": props.evenrow,
  };
  return retObj;
});
const containerClassTooltip = computed(() => {
  return !props.disabled
    ? "Add new supervisor"
    : "Function temporarily disabled";
});

const resizeRef = ref(null);
const { width, height } = useElementSize(resizeRef);
</script>
