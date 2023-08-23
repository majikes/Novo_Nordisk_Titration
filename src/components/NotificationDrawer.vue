<template>
  <div class="w-full">
    <div class="flex justify-between">
      <div v-if="expanded" class="rounded-md text-sm py-1 px-2 w-40 bg-gray-100" @click="readAll">
        mark all read
      </div>
      <div class="relative flex w-full justify-end">
        <div class="absolute bottom-9 right-0 z-30" id="notification-bubble-container">
          <div v-if="flashErrors.slice(3).length > 0" class="rounded-md p-2 bg-red-400">
            ...{{ flashErrors.slice(3).length }}
          </div>
          <NotificationBubble v-for="(flash, i) in flashErrors.slice(0, 3)"
            v-model:notification="flashErrors.slice(0, 3)[i]" :key="flash.timestamp" />
        </div>
        <div class="flex" :title="expanded ? 'hide notifications' : 'expand notifications'"
          @click="expanded = !expanded">
          <div class="force-center-content">
            <svg class="w-5" :class="{ 'fill-red-500 stroke-white': unreadErrors.length > 0 }" aria-hidden="true"
              fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke-linecap="round"
                stroke-linejoin="round"></path>
            </svg>
          </div>
          <div class="ml-0.5 force-center-content" :class="{ 'font-semibold text-red-500': unreadErrors.length > 0 }">
            {{ unreadErrors.length }}
          </div>
          <div class="ml-1 force-center-content">
            <svg v-if="expanded" class="w-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <svg v-else class="w-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 15.75l7.5-7.5 7.5 7.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full rounded-md font-mono text-xs" :class="{ 'h-40 bg-gray-100 p-2 mt-2 overflow-y-auto': expanded }">
      <div v-if="expanded" class="overflow-x-auto">
        <div v-for="error in errorsReversed" class="flex" :key="error.timestamp"
          :class="{ 'font-semibold': !error.read }" @mouseover="error.read = true">
          <div class="pr-1 items-start">
            <!-- https://feathericons.dev/?search=circle&iconset=feather -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="w-2 h-3"
              :class="{ 'fill-black': !error.read }" fill="none" stroke="currentColor" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="4">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div class="flex text-left">{{ error.date.toISOString() }}: {{ error.message }}</div>
        </div>
        <div v-if="debugModeStore.debugMode">
          {{ errors }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import { useErrorStore } from '@/stores/ErrorStore'
import { useDebugModeStore } from '@/stores/debugModeStore'
import NotificationBubble from './NotificationBubble.vue'

export default defineComponent({
  name: 'NotificationDrawer',
  components: { NotificationBubble },
  props: {},
  setup(props) {
    const errors = useErrorStore()
    const debugModeStore = useDebugModeStore()

    const expanded = ref(false)
    const unreadErrors = computed(() => {
      return errors.errorList.filter(function (value, index) { return !value.read })
    })
    const errorsReversed = computed(() => {
      return [...errors.errorList].sort((a, b) => {
        if (typeof ((a as any)['timestamp']) !== 'undefined' && typeof ((b as any)['timestamp']) !== 'undefined') {
          if ((a as any)['timestamp'] < (b as any)['timestamp']) { return 1 }
          else { return -1 }
        } else { return 1 }
      })
    })
    const flashErrors = computed(() => {
      return errors.errorList.filter(function (value, index) { return value.flash })
    })
    function readAll() {
      for (const error of errors.errorList) {
        error.read = true
        error.flash = false
      }
    }
    // watch(errors, () => {
    //   console.log(errors.errorList[errors.errorList.length-1].message)
    // })
    return { debugModeStore, errors, errorsReversed, expanded, flashErrors, readAll, unreadErrors }
  }
})
</script>