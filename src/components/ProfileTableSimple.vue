<template>
  <div class="profile-table-simple-row" id="profile-table-header">
    <div class="font-bold px-4">Time</div>
    <div class="font-bold px-4">Basal [U/h]</div>
    <div class="font-bold px-4">ISF [mg/dL/U]</div>
    <div class="font-bold px-4">CR [g/U]</div>
  </div>
  <div v-for="(row, index) in profileFormatted" :key="index" class="profile-table-simple-row">
    <div v-for="(elem, subindex) in row" :key="subindex" class="px-4">
      {{ elem }}
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'ProfileTableSimple',
  components: {},
  props: {
    profile: {
      required: true,
      type: Array as PropType<number[][]>
    }
  },
  setup(props) {
    function minToTime(min: number) {
      return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
    }

    const profileFormatted = computed(() => {
      const retArr = [] as string[][]
      for (const row of props.profile) {
        retArr.push([
          minToTime(row[0]),
          String(row[1]),
          String(row[2]),
          String(row[3])
        ])
      }
      return retArr
    })

    return { profileFormatted }
  }
})
</script>