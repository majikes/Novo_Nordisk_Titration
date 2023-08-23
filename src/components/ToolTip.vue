<template>
  <div
    class="absolute z-30 opacity-80 top-1/2 invisible peer-hover:visible bg-gray-700 text-white rounded-md p-2 min-w-max pointer-events-none"
    :class="{'left-0 -translate-x-40': displaySide==='left', 'right-0 translate-x-40': displaySide==='right' }">
          <slot></slot>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'ToolTip',
  components: {},
  props: {
    displaySide: {
      required: true,
      type: String as PropType<'left'|'right'|'mid'>
    },
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