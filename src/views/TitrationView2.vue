
<template>
    <div class="titration-view">
      <div class="control-row" id="header">
        <h1 class="text-2xl font-bold">Subject Titration</h1>
      </div>
    
      <div class="grid place-content-center">
        <SubjectDropdown v-model="selected" @change="changeSelected"/>
      </div>

      <!-- Quantile graph and TIR -->
      <div class="grid grid-cols-12 py-1">
        <div class="col-span-10">
          <!-- glucose row -->
          <div class="py-2" id="quantile-caption"><span class="font-semibold">Glucose</span></div>
          <div id="quantile-container">
            <!-- loading hover -->
            <div v-if="subjectGraphLoading"
              class="z-10 w-64 h-20 rounded-lg drop-shadow-lg absolute grid content-center place-items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white">
              <div class="p-4 bg-white animate-pulse">
                <div class="font-semibold">Loading...</div>
                <!-- <div>(current wait time ~10 seconds)</div> -->
              </div>
            </div>
            <QuantileChart v-if="loaded" :graphableData="graphableGlucose" :loaded="loaded" dataType="glucose" />
          </div>
        </div>

        <div class="grid">
          <div class="pl-3 py-2" id="tir1-caption"><span class="font-semibold">1 week before</span></div>
          <TiRChart class="h-80 w-10 justify-self-center" v-if="loaded" :tirData="tir1Graphable" :loaded="loaded" />
        </div>
      </div>


      <!-- Old and New basal doses, Modify and Confirm buttons -->
      <div class="grid place-content-center pl-3 py-20">
        <div class="grid grid-cols-3 place-content-center">
          <div class="col-span-1 flex justify-start">
            <p>Old Basal insulin dose:</p>  
          </div>
          <div class="col-span-1 flex justify-start">
            {{ "10U" }}
          </div>
        </div>

        <div class="grid grid-cols-3 place-content-center">
            <div class="col-span-1 flex justify-start">
              <p>New Basal insulin dose: </p>  
            </div>
            <div class="col-span-1 flex justify-start">
              <input type="text" id="small-input" class="block w-12 p-2 text-gray-900 border border-gray-300 
              rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value="20">
            </div>
            <div class="col-span-1 flex justify-start">
              <div id="basal-history">
                <button class="btn w-48" id="view-basal-history-button" @click="navigateToBasalDoseHistory">View History</button>
              </div>
            </div>  
        </div>

        <div class="grid grid-cols-3 place-content-center">
          <div class="col-span-1 flex justify-start pl-3">
            <button class="btn w-48" @click="modifyNewBasalInsulinDose">MODIFY</button>
          </div>
          <div class="col-span-2 flex justify-start pl-3">
            <button class="btn w-48" @click="confirmAndSendDoseToParticipants">CONFIRM AND SEND TO PARTICIPANT</button>
          </div>
        </div>
      </div>

      
    </div>
  </template>
    
  <script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useSubjectIdStore } from '@/stores/SubjectIdStore'
  import { useTitrateVariableStore } from '@/stores/TitrateVariableStore'
  import SubjectDropdown from '@/components/SubjectDropdown.vue'
  import QuantileChart from '@/components/QuantileChart.vue'
  import SubjectGraphable from '@/types/SubjectGraphable'
  import QuantileGraphable from '@/types/QuantileGraphable'
  import TitrateGraphable from '@/types/TitrateGraphable'
  import { api, dateConvertToISO } from '@/functions/GlobalFunctions'
  import TiRChart from '@/components/TiRChart.vue'
  import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
  import { isEmpty, cloneDeep, split } from 'lodash'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  // import { max } from 'lodash'
  
  export default defineComponent({
  name: 'TitrateView',
  components: { QuantileChart, SubjectDropdown, TiRChart },
  setup() {
    const apiRootURL = useApiURL()
    const apiRootURLNovo = useApiURLNovo()
    // initialize selected ref() used for dropdown v-model to url value
    // and treat undefined param as '' to properly select empty option
    const route = useRoute()
    const router = useRouter()
    const selected = ref('')
    selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string

    // 'loading' and other flags that we'll need
    // primarily used to enable and disable fields for input
    const subjectListLoading = ref(true)
    const subjectDetailsLoading = ref(false)
    const subjectGraphLoading = ref(false)
    // this one is a computed value
    // true if subjid is empty OR if subjectDetails are loading
    const subjectDateDisabled = computed(() => {
      return (subjectDetailsLoading.value || selected.value === '')
    })

    // v-model of date inputs
    let startDate = ref('')
    let endDate = ref('')
    // then computed value that disables button
    // if either date input is empty ('')
    const buttonDisabled = computed(() => {
      return (startDate.value === '' || endDate.value === '')
    })

    const subjectIdStore = useSubjectIdStore()
    // the actual graphable data we'll be updating
    // TODO find out how we strictly type this without populating data
    // i think it might just be ref({} as SubjectGraphable), idk
    const graphableGlucose = ref({} as QuantileGraphable)
    const tir1Graphable = ref([] as number[])
    ///const tir2Graphable = ref([] as number[])
    // loaded flag for QuantileChart etc, should be false when subj changes
    const loaded = ref(false)

    //////////////////////////
    // functions
    //////////////////////////

    // subjectList load
    // const subjectList = ref<string[]>([])
    // const error = ref(null)
    // onMounted(async () => {
    //   await api.get<string[]>('http://localhost:3000/subjectListLimited').then(
    //     (apiSubjectList:string[]) => {
    //       subjectList.value = apiSubjectList
    //     }).catch(err => {
    //       error.value = err.message
    //       console.log(error.value)
    //     }).finally(() => {
    //       subjectListLoading.value = false
    //     })
    // })

    // route change callback on select change
    // const router = useRouter()
    function changeSelected(event: Event) {
      // TODO idk if we even need this guard anymore thanks to v-model
      if (event.target instanceof HTMLSelectElement) {
        console.log(`dropdown: ${selected.value}`)
        console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
        // router.push({ name: 'AGP', params: { subjectId: selected.value } })
        // loaded.value = false
        getDateRangeLimits()
      }
    }

    // get / update optimal data to graph
    // function checkAndGraph() {
    //   if (selected.value === '') {
    //     // buttondisabled is true automatically because selected === ''
    //   }
    //   else {
    //     loaded.value = false
    //     subjectGraphLoading.value = true
    //     // TODO pass dates as arguments
    //     // api.get<any>(`${apiRootURL}/titrate?subject_id=${selected.value}`).then(
    //     ///const req_url = `${apiRootURL}/titrate?subject_id=${selected.value}`
    //     const req_url = `${apiRootURLNovo}/agp?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
    //     console.log(`request to ${req_url}`)
    //     api.get<SubjectGraphable>(req_url).then(
    //       (subjectGraphable: SubjectGraphable) => {
    //         console.log('success!')
    //         console.log(subjectGraphable)
    //         graphableGlucose.value.id = selected.value
    //         const glucTraces = [
    //           { label: '05th Percentile', trace: subjectGraphable.glucose05th },
    //           { label: '25th Percentile', trace: subjectGraphable.glucose25th },
    //           { label: 'Median', trace: subjectGraphable.glucose50th },
    //           { label: '75th Percentile', trace: subjectGraphable.glucose75th },
    //           { label: '95th Percentile', trace: subjectGraphable.glucose95th },
    //         ]
    //         graphableGlucose.value.traceGroups = [
    //           {
    //             type: 'glucose',
    //             traces: glucTraces,
    //           },
    //         ]
    //         tir1Graphable.value = subjectGraphable.tControlMean
    //         loaded.value = true
    //       }).catch(err => {
    //         graphError.value = err.message
    //         console.log(graphError.value)
    //       }).finally(() => {
    //         subjectGraphLoading.value = false
    //       })
    //   }
    // }

    // TODO on changeSelected and on pageload IF selected != '', get subject details
    // while loading, disable date inputs, subject dropdown, 'graph' button
    // incoming dates from API are MM/DD/YYYY, min and max HTML attrs are YYYY-MM-DD
    const firstLog = ref('')
    const lastLog = ref('')
    const sdError = ref(null)
    function getDateRangeLimits() {
      console.log(`getDateRangeLimits subjid: ${selected.value}`)
      if (selected.value !== '') {
        // reset firstLog and lastLog
        firstLog.value = ''
        lastLog.value = ''
        subjectDetailsLoading.value = true
        // await api.get
        // api call for deets, for now only firstLog and lastLog
        // const req_url = `${apiRootURL}/getsubjects?subject_id=${selected.value}`
        // console.log(`request to ${req_url}`)
        // api.get<SubjectDetails>(req_url).then(
        //   (subjectDetails: SubjectDetails) => {
        //     firstLog.value = dateConvertToISO(subjectDetails.firstLog)
        //     lastLog.value = dateConvertToISO(subjectDetails.lastLog)
        //     console.log(`subject available dates: ${firstLog.value} - ${lastLog.value}`)
        //     console.log(subjectDetails)
        //   }).catch(err => {
        //     sdError.value = err.message
        //     console.log(sdError.value)
        //   }).finally(() => {
        //     subjectDetailsLoading.value = false
        //   })

        startDate.value = '01/25/2023'
        endDate.value = '02/06/2023'

        firstLog.value = dateConvertToISO(startDate.value)
        lastLog.value = dateConvertToISO(endDate.value)
        
        console.log(`dates: ${firstLog.value} - ${lastLog.value}`)
        subjectDetailsLoading.value = false
      }
    }
    // initial invoke on page load to get available date ranges
    getDateRangeLimits()


    // helper function to just validate date range input
    // TODOS:
    // - make sure range is in correct order
    // - implement validation from adduser??
    // - implement daterangepicker
    // const validDates = computed(() => {
    //   if (firstLog.value === '' || lastLog.value === '' || startDate.value === '' || endDate.value === '') {
    //     return false
    //g.value)
    //     const startDateDate = new Date(startDate.value)
    //     const endDateDate = new Date(endDate.value)
    //     if (endDateDate > lastLogDate || startDateDate < firstLogDate || startDateDate > endDateDate) {
    //       return false
    //     } else {
    //       return true
    //     }
    //   }
    // })
    const validDates = ref(true)

    // first run on setup/load
    ///graphData()
    // ...then watch and update both on subject change
    watch(selected, () => {
      console.log(`dropdown: ${selected.value}`)
      console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
      // router.push({ name: 'AGP', params: { subjectId: selected.value } })
      // loaded.value = false
      getDateRangeLimits()      
      graphData()
    })
    // get / update data to graph
    const graphError = ref(null)
    function graphData() {

      if (!validDates.value) {
        console.log(`${startDate.value} - ${endDate.value}: invalid range`)
      } else {
        console.log(`${startDate.value} - ${endDate.value}: VALID`)
        const startTS = Math.floor((new Date(startDate.value).valueOf()) / 1000)
        const endTS = Math.floor((new Date(endDate.value).valueOf()) / 1000)
        // console.log('graphing...')
        // console.log(startTS,endTS)
        loaded.value = false
        subjectGraphLoading.value = true
        // TODO pass dates as arguments
        const req_url = `${apiRootURLNovo}/agp?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
        console.log(`request to ${req_url}`)
        api.get<SubjectGraphable>(req_url).then(
          (subjectGraphable: SubjectGraphable) => {
            console.log('success!')
            console.log(subjectGraphable)
            graphableGlucose.value.id = selected.value
            const glucTraces = [
              { label: '05th Percentile', trace: subjectGraphable.glucose05th },
              { label: '25th Percentile', trace: subjectGraphable.glucose25th },
              { label: 'Median', trace: subjectGraphable.glucose50th },
              { label: '75th Percentile', trace: subjectGraphable.glucose75th },
              { label: '95th Percentile', trace: subjectGraphable.glucose95th },
            ]
            graphableGlucose.value.traceGroups = [
              {
                type: 'glucose',
                traces: glucTraces,
              },
            ]
            tir1Graphable.value = subjectGraphable.tControlMean
            ///tir2Graphable.value = subjectGraphable.tControlMean
            loaded.value = true
          }).catch(err => {
            graphError.value = err.message
            console.log(graphError.value)
          }).finally(() => {
            subjectGraphLoading.value = false
          })
      }
    }

    function navigateToBasalDoseHistory(){
      router.push({ name: 'ProfileView', params: { subjectId: selected.value } })
    }

    function modifyNewBasalInsulinDose(){
      console.log("Make new Basal dose editable/modifyable");
    }

    function confirmAndSendDoseToParticipants(){
      console.log("Confirm and send Dose to the participants");
    }

    return {
      selected, changeSelected,
      subjectDateDisabled, subjectDetailsLoading, subjectListLoading, subjectGraphLoading,
      graphData, graphableGlucose, loaded, startDate, endDate, firstLog, lastLog, buttonDisabled,
      route, sdError, tir1Graphable, navigateToBasalDoseHistory, modifyNewBasalInsulinDose, confirmAndSendDoseToParticipants
    }
  }
})
  </script>  