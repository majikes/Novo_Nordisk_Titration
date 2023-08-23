import { defineStore } from "pinia"
import { ref } from "vue"

export const useDebugModeStore = defineStore('debugModeStore', () => {
  const debugMode = ref(false)
  const debugModeVisible = ref(true)
  function setSubject(debug:boolean, debugVisible:boolean) { 
    debugMode.value = debug
    debugModeVisible.value = debugVisible
  }
  
  return { debugMode, debugModeVisible, setSubject }
})