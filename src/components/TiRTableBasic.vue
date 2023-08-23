<template>
  <div class="flex justify-between gap-2">
    <div>Time &gt; 250</div>
    <div>{{ tirData.gt250 }} &percnt;</div>
  </div>
  <div class="flex justify-between gap-2">
    <div>Time in 180-250</div>
    <div>{{ tirData.bt180250 }} &percnt;</div>
  </div>
  <div class="flex justify-between gap-2">
    <div>Time in 70-180</div>
    <div>{{ tirData.bt70180 }} &percnt;</div>
  </div>
  <div class="flex justify-between gap-2">
    <div>Time in 54-70</div>
    <div>{{ tirData.bt5470 }} &percnt;</div>
  </div>
  <div class="flex justify-between gap-2">
    <div>Time &lt; 54</div>
    <div>{{ tirData.lt54 }} &percnt;</div>
  </div>
</template>
<script lang="ts">

import { defineComponent, PropType, ref } from 'vue'
import TiRType from '@/types/TiRType'
// import { useDebugModeStore } from '@/stores/debugModeStore'

export default defineComponent({
  name: 'TiRTableBasic',
  components: {},
  props: {
    tirData: {
      required: true,
      // type: Array as PropType<string[]>
      type: Object as PropType<TiRType>
    },
  },

  setup(props) {
    return {}
  }
})
</script>

<style scoped>

</style>