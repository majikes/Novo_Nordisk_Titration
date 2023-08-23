<template>
  <div class="flex items-start gap-1 rounded-md mt-2 p-2 bg-red-400 text-left w-64 min-h-16">
    <div class="pointer-events-none text-sm">
      {{ notification.message }}
    </div>
    <div class="flex items-start p-1 rounded-sm bg-red-300" @click="hide">
      <svg class="w-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import NotificationType from "@/types/NotificationType"

export default defineComponent({
  name: 'NotificationBubble',
  components: {},
  props: {
    notification: {
      required: true,
      type: Object as PropType<NotificationType>
    },
  },
  emits: ['update:notification'],
  setup(props, { emit }) {

    function hide() {
      console.log('hide')
      const curNot = props.notification
      curNot.flash = false
      curNot.read = true
      emit('update:notification', curNot)
    }
    return { hide }
  }
})
</script>