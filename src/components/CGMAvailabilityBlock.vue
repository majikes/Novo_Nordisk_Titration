<template>
  <div class="p-2 my-2 grid grid-cols-4 rounded-md bg-gray-200 font-mono">
    <div
      class="m-1 p-1 col-span-4 grid grid-cols-4 justify-between rounded-sm"
      :class="{
        'bg-emerald-200': validDays.validPcnt >= thresholdTotal,
        'bg-red-300': validDays.validPcnt < thresholdTotal,
      }"
    >
      <h2 class="flex justify-between col-span-3 text-xl font-semibold p-3">
        {{ participantCGMAvail.username }} :
        {{ validDays.validPcnt }}% ({{ validDays.valid }}/{{ validDays.total }} days)
      </h2>
      <div class="text-m font-semibold px-2 pt-1 w-full">
        <h2 class="flex justify-between">
          <div>first:</div>
          <div>{{ dateFormat(participantCGMAvail.firstTimestamp) }}</div>
        </h2>
        <h2 class="flex justify-between">
          <div>last:</div>
          <div>{{ dateFormat(participantCGMAvail.lastTimestamp) }}</div>
        </h2>
      </div>
    </div>
    <div class="p-1 col-span-4 flex flex-wrap w-full gap-1 justify-start">
      <div
        v-for="(
          cgmDay, index2
        ) in participantCGMAvail.dailyPercentageOfCgmAvailable"
        :key="index2"
        :title="`Day start at ${String(
          new Date(cgmDay.dayStartTimestamp * 1000).toLocaleString('en-US')
        )}`"
        class="aspect-square w-20 force-center-content rounded-sm"
        :class="{
          'bg-emerald-200': cgmDay.percentageOfCgmAvailable >= thresholdDaily,
          'bg-red-300': cgmDay.percentageOfCgmAvailable < thresholdDaily,
        }"
      >
        {{ cgmDay.percentageOfCgmAvailable }}%
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import type { CGMDataAvailType } from "@/types/CGMDataAvailType";

export default defineComponent({
  name: "CGMAvailabilityBlock",
  components: {},
  props: {
    thresholdTotal: {
      required: true,
      type: Number as PropType<number>,
    },
    thresholdDaily: {
      required: true,
      type: Number as PropType<number>,
    },
    participantCGMAvail: {
      required: true,
      type: Object as PropType<CGMDataAvailType>,
    },
  },
  setup(props) {
    const validDays = computed(() => {
      const retObj = {
        total: 0,
        valid: 0,
        validPcnt: 0,
      };
      for (const cgmDay of props.participantCGMAvail
        .dailyPercentageOfCgmAvailable) {
        retObj.total++;
        if (cgmDay.percentageOfCgmAvailable >= props.thresholdDaily) {
          retObj.valid++;
        }
      }
      if (retObj.total > 0) {
        retObj.validPcnt = Math.round((retObj.valid / retObj.total) * 100 * 100) / 100;
      }
      return retObj;
    });

    function dateFormat(timestamp: number) {
      const date = new Date(timestamp * 1000);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hr = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const retStr = `${month}/${day} ${hr}:${min}`;
      return retStr;
    }
    return {
      dateFormat,
      validDays,
    };
  },
});
</script>
