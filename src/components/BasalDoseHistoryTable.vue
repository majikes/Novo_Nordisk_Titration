<template>
  <div class="dose-history-table-simple-row" id="dose-history-table-header">
    <div class="font-bold px-4">Date</div>
    <div class="font-bold px-4">Time [h]</div>
    <div class="font-bold px-4">Basal [U]</div>
  </div>
  <div v-for="(row, index) in doseHistory" :key="index" class="dose-history-table-simple-row">
    <div v-for="(elem, subindex) in row" :key="subindex" class="px-4">
      {{ elem }}
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import BasalDoseType from '@/types/BasalDoseType'

export default defineComponent({
  name: 'BasalDoseHistoryTable',
  components: {},
  props: {
    doseHistory: {
      required: true,
      type: Array as PropType<BasalDoseType[]>
    }
  },
  setup(props) {
    return {  }
  }
})
</script>