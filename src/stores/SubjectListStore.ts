import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { type SubjectListItemType } from "@/types/SubjectListItemType"

export const useSubjectListStore = defineStore('subjectListStore', () => {
  const interventionMap = {
    '0': 'Control',
    '1': 'Experimental'
  }
  const loaded = ref(false)
  const loadedTS = ref(null as number | null)
  const currentSubject = ref({} as SubjectListItemType)
  // const currentSubjectID = computed(() => currentSubject.value.id)
  // const currentSubjectArm = computed(() => currentSubject.value.interventionArm)
  const currentSubjectNewRec = computed(() => {
    let retBool = false
    if (currentSubject.value.dose_value !== null && currentSubject.value.dose_TS !== null &&
      currentSubject.value.rec_dose_value !== null && currentSubject.value.rec_dose_TS !== null &&
      currentSubject.value.dose_value >= 0 && currentSubject.value.dose_TS > 0 &&
      currentSubject.value.rec_dose_value >= 0 && currentSubject.value.rec_dose_TS > 0) {
      retBool = currentSubject.value.rec_dose_TS > currentSubject.value.dose_TS
    }
    return retBool
  })

  const lastRecDoseText = computed(() => {
    let doseStr = 'N/A'
    if (!loaded.value || currentSubject.value.loading) {
      doseStr = 'Loading...'
    } else if (
      typeof (currentSubject.value.rec_dose_TS) === 'undefined' ||
      currentSubject.value.rec_dose_value === null ||
      currentSubject.value.rec_dose_value === -1
    ) {
      doseStr = 'N/A'
    } else {
      doseStr = `${currentSubject.value.rec_dose_value}U`
    }
    return doseStr
  })
  const lastRecDoseDateText = computed(() => {
    let retStr = ''
    if (
      loaded.value &&
      typeof (currentSubject.value.rec_dose_TS) !== 'undefined' &&
      currentSubject.value.rec_dose_TS !== null &&
      currentSubject.value.rec_dose_TS !== -1
    ) {
      const fullDate = new Date(currentSubject.value.rec_dose_TS * 1000)
      retStr = `${fullDate.toISOString()}`
    }
    return retStr
  })

  const lastDoseText = computed(() => {
    let doseStr = 'N/A'
    if (!loaded.value || currentSubject.value.loading) {
      doseStr = 'Loading...'
    } else if (
      typeof (currentSubject.value.dose_TS) === 'undefined' ||
      currentSubject.value.dose_value === null ||
      currentSubject.value.dose_value === -1
    ) {
      doseStr = 'N/A'
    } else {
      doseStr = `${currentSubject.value.dose_value}U`
    }
    return doseStr
  })
  const lastDoseDateText = computed(() => {
    let retStr = ''
    if (
      loaded.value &&
      typeof (currentSubject.value.dose_TS) !== 'undefined' &&
      currentSubject.value.dose_TS !== null &&
      currentSubject.value.dose_TS !== -1
    ) {
      const fullDate = new Date(currentSubject.value.dose_TS * 1000)
      retStr = `${fullDate.toISOString()}`
    }
    return retStr
  })

  const absLastDoseText = computed(() => {
    let doseStr = 'N/A'
    if (!loaded.value || currentSubject.value.loading) {
      doseStr = 'Loading...'
    } else if (
      typeof (currentSubject.value.abs_dose_TS) === 'undefined' ||
      currentSubject.value.abs_dose_value === null ||
      currentSubject.value.abs_dose_value === -1
    ) {
      doseStr = 'N/A'
    } else {
      doseStr = `${currentSubject.value.abs_dose_value}U`
    }
    return doseStr
  })
  const absLastDoseDateText = computed(() => {
    let retStr = ''
    if (
      loaded.value &&
      typeof (currentSubject.value.abs_dose_TS) !== 'undefined' &&
      currentSubject.value.abs_dose_TS !== null &&
      currentSubject.value.abs_dose_TS !== -1
    ) {
      const fullDate = new Date(currentSubject.value.abs_dose_TS * 1000)
      retStr = `${fullDate.toISOString()}`
    }
    return retStr
  })



  const titratable = computed(() => {
    let retBool = false
    if (currentSubject.value.interventionArm === 1 && currentSubjectNewRec.value) {
      retBool = true
    }
    return retBool
  })

  // const subjectDisplayText = computed(() => { 
  //   if (loaded.value && typeof(currentSubject.value.id) !== 'undefined') {
  //     return currentSubject.value.id
  //   } else {
  //     return 'Loading...'
  //   }
  // })
  const subjectList = ref([] as SubjectListItemType[])
  const subjectListSorted = computed(() => {
    return [...subjectList.value].sort((a, b) => {
      if (a.id > b.id) { return 1 }
      else { return -1 }
    })
  })
  const subjectListTitratable = computed(() => {
    const tmpList = [] as SubjectListItemType[]
    for (const subj of [...subjectListSorted.value]) {
      if (subj.interventionArm === 1 && !subj.loading &&
        subj.dose_value !== null && subj.dose_TS !== null &&
        subj.rec_dose_value !== null && subj.rec_dose_TS !== null &&
        subj.dose_value >= 0 && subj.dose_TS > 0 &&
        subj.rec_dose_value >= 0 && subj.rec_dose_TS > 0 &&
        subj.rec_dose_TS > subj.dose_TS) {
        tmpList.push(subj)
      }
    }
    return tmpList
  })
  // idk what this should actually do in the case where nothing is found...
  // for now defaulting to nothing, so it won't overwrite anything
  function setCurrentSubject(id: string) {
    console.log(`setting current subject to ${id}`)
    const searchRes = subjectList.value.find(obj => obj.id === id)
    if (typeof (searchRes) !== 'undefined') {
      currentSubject.value = searchRes
    } else {
      currentSubject.value = {} as SubjectListItemType
    }
  }
  // function setSubjectList(subjList:SubjectListItemType[]) { subjectList.value = subjList }

  return {
    currentSubject,
    currentSubjectNewRec,
    loaded,
    loadedTS,
    setCurrentSubject,
    subjectList,
    subjectListSorted,
    interventionMap,
    lastRecDoseText,
    lastRecDoseDateText,
    lastDoseText,
    lastDoseDateText,
    absLastDoseText,
    absLastDoseDateText,
    titratable,
    subjectListTitratable,

  }
})