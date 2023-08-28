
<template>
  <div class="agp">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">AGP</h1>
    </div>
    <div class="control-row content-end">
      <div>
        <label for="startDate">Start date:</label>
        <input type="date" class="form-input date-input" id="startDate" :disabled="subjectDateDisabled" :min="firstLog"
          :max="lastLog" v-model="startDate">
      </div>
      <div>
        <label for="endDate">End date:</label>
        <input type="date" class="form-input date-input" id="endDate" :disabled="subjectDateDisabled" :min="firstLog"
          :max="lastLog" v-model="endDate">
      </div>
      <div class="grid content-end">
        <button class="form-input btn" id="graph-button" :disabled="buttonDisabled" @click="graphData">Graph</button>
      </div>
      <SubjectDropdown v-model="selected"/>
    </div>
    <div class="control-row content-end py-3">
      <div id="titrate-link">
        <!-- <router-link class="form-input btn"
          :to="{ name: 'TitrationView', params: { subjectId: route.params.subjectId } }">Titrate
        </router-link> -->
      </div>
    </div>
    <div class="grid py-3 content-center place-items-center" v-if="subjectDetailsLoading">Loading subject details...
    </div>

    <div class="grid grid-cols-12 py-1">
      <div class="col-span-10">
        <!-- glucose row -->
        <div class="py-2" id="quantile-caption"><span class="font-semibold">Glucose</span></div>
        <div id="quantile-container">
          <QuantileChart v-if="loaded" :graphableData="graphableGlucose" :loaded="loaded" dataType="glucose" />
        </div>
      </div>
      <div class="grid">
        <div class="pl-3 py-2" id="tir1-caption"><span class="font-semibold">Plotted period</span></div>
        <TiRChart class="h-80 w-10 justify-self-center" v-if="loaded" :tirData="tir1Graphable" :loaded="loaded" />
      </div>
      <div class="grid">
        <div class="pl-3 py-2" id="tir2-caption"><span class="font-semibold">1 week before</span></div>
        <TiRChart class="h-80 w-10 justify-self-center" v-if="loaded" :tirData="tir2Graphable" :loaded="loaded" />
      </div>
    </div>

  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QuantileChart from '@/components/QuantileChart.vue'
import SubjectGraphable from '@/types/SubjectGraphable'
import QuantileGraphable from '@/types/QuantileGraphable'
import SubjectDetails from '@/types/SubjectDetails'
import SubjectDropdown from '@/components/SubjectDropdown.vue'
import { useSubjectIdStore } from '@/stores/SubjectIdStore'
import { api, dateConvertToISO } from '@/functions/GlobalFunctions'
import TiRChart from '@/components/TiRChart.vue'
import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
import { first } from 'lodash'

export default defineComponent({
  name: 'AGP',
  components: { QuantileChart, SubjectDropdown, TiRChart },
  setup() {
    const apiRootURL = useApiURL()
    const apiRootURLNovo = useApiURLNovo()
    // initialize selected ref() used for dropdown v-model to url value
    // and treat undefined param as '' to properly select empty option
    const route = useRoute()
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
    const startDate = ref('')
    const endDate = ref('')
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
    const graphableInsulin = ref({} as QuantileGraphable)
    const tir1Graphable = ref([] as number[])
    const tir2Graphable = ref([] as number[])
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
        const defaultStartDate = '01/01/2021'
        const startDates = {
          '81101': '07/27/2021',
          '81102': '08/12/2021',
          '81103': '08/19/2021',
          '81104': '08/13/2021',
          '81105': '08/13/2021',
          '81106': '08/12/2021',
          '81107': '08/13/2021',
          '81108': '08/26/2021',
          '81109': '09/02/2021',
          '81110': '08/24/2021',
          '81111': '08/25/2021',
          '81113': '10/14/2021',
          '81114': '09/24/2021',
          '81115': '09/13/2021',
          '81116': '09/13/2021',
          '81117': '10/01/2021',
          '81118': '09/22/2021',
          '81119': '10/08/2021',
          '81120': '10/21/2021',
          '81121': '10/18/2021',
          '81122': '10/15/2021',
          '81123': '10/20/2021',
          '81124': '10/20/2021',
          '81125': '10/18/2021',
          '81126': '10/25/2021',
          '81127': '10/22/2021',
          '81128': '10/25/2021',
          '81129': '10/27/2021',
          '81130': '10/21/2021',
          '81131': '10/22/2021'
        }
        const endDate = '12/31/2023'
        console.log('HARDCODED DATERANGE GET')
        const startDate = '08/12/2021'
        if (selected.value in startDates) {
          const storedStart = (startDates as any)[selected.value]
          // console.log(`subjid: ${selected.value}; storedVal: ${storedStart}`)
          firstLog.value = dateConvertToISO(storedStart)
          let endTmp = new Date(storedStart)
          endTmp.setMonth(endTmp.getMonth() + 2)
          ///lastLog.value = endTmp.toISOString().split('T')[0]
          lastLog.value = dateConvertToISO(endDate)
        } else { 
          firstLog.value = dateConvertToISO(startDate)
          lastLog.value = dateConvertToISO(endDate)
        }
        

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
    //   } else {
    //     const firstLogDate = new Date(firstLog.value)
    //     const lastLogDate = new Date(lastLog.value)
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
        ///const req_url = `${apiRootURL}/getsubjects?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
        const req_url = `${apiRootURLNovo}/agp?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
        console.log(`request to ${req_url}`)
        api.get<SubjectGraphable>(req_url).then(
          (subjectGraphable: SubjectGraphable) => {
            console.log('success!')
            console.log(subjectGraphable)
            graphableGlucose.value.id = selected.value
            graphableInsulin.value.id = selected.value
            const glucTraces = [
              { label: '05th Percentile', trace: subjectGraphable.glucose05th },
              { label: '25th Percentile', trace: subjectGraphable.glucose25th },
              { label: 'Median', trace: subjectGraphable.glucose50th },
              { label: '75th Percentile', trace: subjectGraphable.glucose75th },
              { label: '95th Percentile', trace: subjectGraphable.glucose95th },
            ]
            const insTraces = [
              { label: '05th Percentile', trace: subjectGraphable.iob05th },
              { label: '25th Percentile', trace: subjectGraphable.iob25th },
              { label: 'Median', trace: subjectGraphable.iob50th },
              { label: '75th Percentile', trace: subjectGraphable.iob75th },
              { label: '95th Percentile', trace: subjectGraphable.iob95th },
            ]
            graphableGlucose.value.traceGroups = [
              {
                type: 'glucose',
                traces: glucTraces,
              },
            ]
            graphableInsulin.value.traceGroups = [
              {
                type: 'insulin',
                traces: insTraces,
                colors: {
                  inner: 'rgba(219, 39, 119, 0.7)',
                  outer: 'rgba(244, 114, 182, 0.7)'
                }
              },
            ]
            tir1Graphable.value = subjectGraphable.tControlMean
            tir2Graphable.value = subjectGraphable.tControlMean
            loaded.value = true
          }).catch(err => {
            graphError.value = err.message
            console.log(graphError.value)
          }).finally(() => {
            subjectGraphLoading.value = false
          })
      }
    }

    return {
      selected, changeSelected,
      subjectDateDisabled, subjectDetailsLoading, subjectListLoading, subjectGraphLoading,
      graphData, graphableGlucose, graphableInsulin, loaded, startDate, endDate, firstLog, lastLog, buttonDisabled,
      route, sdError, tir1Graphable, tir2Graphable
    }
  }
})
</script>