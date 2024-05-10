<template>
  <div class="dose-history-table-simple-row" id="dose-history-table-header">
    <div class="font-bold px-4">Date</div>
    <div class="font-bold px-4">Time [hh:mm]</div>
    <div class="font-bold px-4">Basal [U]</div>
    <div class="font-bold px-4">Source</div>
  </div>
  <div
    v-if="empty"
    class="flex justify-center font-semibold my-4 text-amber-500"
  >
    No basal dose history detected
  </div>
  <div
    v-else
    v-for="(dose, index) in doseHistory"
    :key="index"
    class="dose-history-table-simple-row"
  >
    <div class="px-4">{{ dose.date }}</div>
    <div class="px-4">{{ dose.formattedTime }}</div>
    <div class="px-4">{{ dose.basalDoseValue }}</div>
    <div v-if="dose.src_id === '2'" class="px-4 text-green-400">
      {{ formatSrcString(dose.src_id) }}
    </div>
    <div v-else class="px-4">{{ formatSrcString(dose.src_id) }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, PropType } from "vue";
import { type BasalDoseType } from "@/types/BasalDoseTypes";

const props = defineProps({
  doseHistory: {
    required: true,
    type: Array as PropType<BasalDoseType[]>,
  },
});
const empty = computed(() => {
  let retBool = false;
  if (props.doseHistory.length === 0) {
    retBool = true;
  }
  return retBool;
});
function formatSrcString(src_id: string) {
  let retStr = "unknown";
  if (src_id === "0") {
    retStr = "Automated system";
  } else if (src_id === "1") {
    retStr = "Physician";
  } else if (src_id === "2") {
    retStr = "Participant";
  }
  return retStr;
}
</script>
