<template>
  <!-- loading hover -->
  <div
    class="z-10 w-64 h-20 rounded-lg drop-shadow-lg absolute grid content-center place-items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white">
    <div class="p-4 bg-white animate-pulse">
      <div v-if="typeof(custom) === 'undefined'" class="font-semibold">
        Loading...
      </div>
      <div v-else class="font-semibold">
        {{ custom }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'LoadingHover',
  components: {},
  props: {
    custom: {
      required: false,
      type: String as PropType<string>
    },
  },
  setup(props) {
    return {}
  }
})
</script>