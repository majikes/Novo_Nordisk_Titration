import { defineStore } from "pinia"
import { ref } from "vue"
import NotificationType from "@/types/NotificationType"

export const useErrorStore = defineStore('errorStore', () => {
  const errorList = ref([] as NotificationType[])
  function errorLog(message:string, flash=false) {
    const now = new Date()
    errorList.value.push({
      timestamp: Number(now),
      timestr: String(now),
      date: now,
      message: message,
      read: false,
      flash: flash 
    })
  }
  function setErrorList(errList:NotificationType[]) { errorList.value = errList }
  
  return { errorList, errorLog, setErrorList }
})