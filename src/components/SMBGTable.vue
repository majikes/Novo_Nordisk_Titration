<template>
  <div class="smbg-history-table-simple-row" id="smbg-history-table-header">
    <div class="font-bold px-4">Date</div>
    <div class="font-bold px-4">Time [hh:mm]</div>
    <div class="font-bold px-4">SMBG[mg/dL]</div>
  </div>
  <div v-for="(smbg, index) in smbgs" :key="index" class="smbg-history-table-simple-row">
    <div class="px-4">{{smbg.smbgDate}}</div>
    <div class="px-4">{{formatTime(smbg.smbgTime)}}</div>
    <div class="px-4">{{smbg.smbgValue}}</div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import SMBGFromAPIType from '@/types/SMBGFromAPIType'

export default defineComponent({
  name: 'SMBGTable',
  components: {},
  props: {
    smbgs: {
      required: true,
      type: Array as PropType<SMBGFromAPIType[]>
    }
  },
  setup(props) {
    function formatTime(minutes: number) {
      const hours = Math.floor(minutes / 60);
      const minutesRemaining = minutes % 60;

      // Format the hours and minutes to always be two digits
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutesRemaining.toString().padStart(2, "0");

      const retStr = `${formattedHours}:${formattedMinutes}`

      return retStr;
    }

    return { formatTime }
  }
})
</script>