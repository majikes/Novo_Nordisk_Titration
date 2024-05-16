<template>
  <!-- https://feathericons.dev/?search=plus-square&iconset=feather -->
  <div
    class="z-30 w-80 text-sm min-h-16 p-2 bg-white rounded-md drop-shadow-lg absolute grid bottom-2 right-20"
    v-on-click-outside="cancelModal"
  >
    <div class="flex justify-between pl-1.5 mb-1 font-semibold">
      <div>{{ supervisee.supervisee_username }} - add supervisor(s)</div>
      <div
        ref="cancelContainer"
        class="w-6 h-6 p-1 rounded-md aspect-square group hover:bg-rose-500 hover:stroke-white"
        @click="cancelModal"
      >
        <!-- https://feathericons.dev/?search=xsquare&iconset=feather -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          :width="width"
          :height="height"
          class="group-hover:stroke-white"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
          <line x1="9" x2="15" y1="9" y2="15" />
          <line x1="15" x2="9" y1="9" y2="15" />
        </svg>
      </div>
    </div>
    <div
      v-for="(supervisor, index) in supervisoroptions"
      class="py-0.5 px-1.5 my-0.5 grid grid-cols-3 gap-2 border rounded-md w-full hover:bg-gray-100"
      :class="{
        'border-emerald-300': supervisorsSelected[index],
        'border-transparent': !supervisorsSelected[index],
      }"
      :key="index"
      @click="toggleSupervisor(index)"
    >
      <div>{{ supervisor.supervisor_username }}</div>
      <div>{{ supervisor.supervisor_role_name }}</div>
      <div class="flex justify-between">
        <div>{{ supervisor.supervisor_site_name }}</div>
        <div
          v-if="supervisorsSelected[index]"
          class="aspect-square force-center-content h-full"
        >
          <!-- https://feathericons.dev/?search=check&iconset=feather -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            class="stroke-emerald-300"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    </div>
    <div class="mt-2 flex justify-end">
      <div
        class="w-24 p-1 rounded-md text-center bg-gray-100"
        :class="confirmButtonState"
        @click="confirmButton"
      >
        Confirm
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, PropType, ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import {
  type UserSupervisedByGroupBySuperviseeType,
  type Supervisor,
} from "@/types/UserSupervisedByTypes";
import { useElementSize } from "@vueuse/core";

// TODO are we REALLY going down the path of creating fancy splines
// in order to make a nice lil manila-folder like tabular extension
// of the parent bg color??? ..... seems unnecessary
// ... although if we push it down enough we only need the one
// surrounding curve?? maybe. idk.

const props = defineProps({
  index: {
    required: true,
    type: Number as PropType<number>,
  },
  supervisee: {
    required: true,
    type: Object as PropType<UserSupervisedByGroupBySuperviseeType>,
  },
  supervisoroptions: {
    required: true,
    type: Object as PropType<Supervisor[]>,
  },
});

const emit = defineEmits(["cancelClick", "confirmClick"]);

const cancelContainer = ref(null);
const { width, height } = useElementSize(cancelContainer);

const supervisorsSelected = ref(
  new Array(props.supervisoroptions.length).fill(false) as boolean[]
);
function toggleSupervisor(index: number) {
  supervisorsSelected.value[index] = !supervisorsSelected.value[index];
}

const confirmEnabled = computed(() => {
  for (const selection of supervisorsSelected.value) {
    if (selection) {
      return true;
    }
  }
  return false;
});
const confirmButtonState = computed(() => {
  const retObj = {
    "text-gray-500": !confirmEnabled.value,
    "hover:bg-emerald-300 hover:text-white": confirmEnabled.value,
  };
  return retObj;
});

function cancelModal() {
  emit("cancelClick");
}
function confirmButton() {
  if (confirmEnabled.value) {
    const tmpSupervisors = [] as Supervisor[];
    for (const [idx, selected] of supervisorsSelected.value.entries()) {
      if (selected) {
        tmpSupervisors.push(props.supervisoroptions[idx]);
      }
    }
    emit("confirmClick", props.supervisee, tmpSupervisors, props.index);
  }
}
</script>
