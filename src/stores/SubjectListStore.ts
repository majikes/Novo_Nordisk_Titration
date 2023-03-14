import { defineStore } from "pinia"
import { ref } from "vue"

export const useSubjectListStore = defineStore('subjectListStore', () => {
  const subjectList = ref([] as string[])
  function setSubjectList(subjList:string[]) { subjectList.value = subjList }
  
  return { subjectList, setSubjectList }
})