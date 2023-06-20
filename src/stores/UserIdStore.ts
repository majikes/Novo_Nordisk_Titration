import { defineStore } from "pinia"
import { ref } from "vue"

export const useUserIdStore = defineStore('userIdStore', () => {
  const userId = ref('')
  function setUser(usrid:string) { userId.value = usrid }
  
  return { userId, setUser }
})