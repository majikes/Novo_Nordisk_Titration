<template>
  <div class="smbg-history-table-simple-row" id="smbg-history-table-header">
    <div class="font-bold px-4">Date</div>
    <div class="font-bold px-4">Time [hh:mm]</div>
    <div class="font-bold px-4">Hypo Value [mg/dL]</div>
  </div>
  <div
    v-if="empty"
    class="flex justify-center font-semibold my-4 text-amber-500"
  >
    No hypo history detected
  </div>
  <div
    v-for="(hypo, index) in hypos"
    :key="index"
    class="smbg-history-table-simple-row"
  >
    <div class="px-4">{{ hypo.hypoDate }}</div>
    <div class="px-4">{{ formatTime(hypo.hypoTime) }}</div>
    <div class="px-4">{{ hypo.hypoValue }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, PropType } from "vue";
import HypoFromAPIType from "@/types/HypoFromAPIType";

const props = defineProps({
  hypos: {
    required: true,
    type: Array as PropType<HypoFromAPIType[]>,
  },
});
const empty = computed(() => {
  let retBool = false;
  if (props.hypos.length === 0) {
    retBool = true;
  }
  return retBool;
})
function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const minutesRemaining = minutes % 60;

  // Format the hours and minutes to always be two digits
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutesRemaining.toString().padStart(2, "0");

  const retStr = `${formattedHours}:${formattedMinutes}`;

  return retStr;
}
</script>
