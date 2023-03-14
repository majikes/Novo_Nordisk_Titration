import { defineStore } from "pinia"
import { ref } from "vue"
import Trace from "@/types/Trace"

export const useTitrateVariableStore = defineStore('titrateVariableStore', () => {
  // const subjectList = ref([[]] as Trace[][])
  const nominal_quants = ref([] as Trace[])
  const optimal_quants = ref([] as Trace[])
  function setNominal(nominalQuants:Trace[]) { nominal_quants.value = nominalQuants }
  function setOptimal(optimalQuants:Trace[]) { optimal_quants.value = optimalQuants }
  
  return { nominal_quants, optimal_quants, setNominal, setOptimal }
})