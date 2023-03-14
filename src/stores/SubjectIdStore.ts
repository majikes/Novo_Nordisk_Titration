import { defineStore } from "pinia"
import { ref } from "vue"

export const useSubjectIdStore = defineStore('subjectIdStore', () => {
  const subjectId = ref('')
  function setSubject(subjid:string) { subjectId.value = subjid }
  
  return { subjectId, setSubject }
})