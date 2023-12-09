<template>
  <div class="smbg-history-table-simple-row" id="smbg-history-table-header">
    <div class="font-bold px-4">Date</div>
    <div class="font-bold px-4">Time [m]</div>
    <div class="font-bold px-4">SMBG[mg/dL]</div>
  </div>
  <div v-for="(smbg, index) in smbgs" :key="index" class="smbg-history-table-simple-row">
    <div class="px-4">{{smbg.smbgDate}}</div>
    <div class="px-4">{{smbg.smbgTime}}</div>
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
    return {  }
  }
})
</script>