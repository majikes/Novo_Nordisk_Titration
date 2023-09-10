
<template>
  <div class="agp">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Ambulatory Glucose Profile</h1>
    </div>
    <!-- datepicker / subject dropdown -->
    <div class="control-row content-end">
      <div class="grid content-end pb-1" id="titrationdatepickerstandin">
        <VueDatePicker v-model="date" :min-date="dateBounds.min" :max-date="dateBounds.max" :enable-time-picker="false"
          :disabled="noSubjSelected || !validDateReq" :start-date="dateBounds.max" range auto-apply :markers="titrationDatesComputed" />
      </div>
      <div class="grid content-end">
        <button class="btn w-52" id="graph-button" :disabled="buttonDisabled" @click="graphData">Graph</button>
      </div>
      <SubjectDropdown v-model="selected" />
    </div>
    <div v-if="debugModeStore.debugMode">
      {{titrationDatesComputed}}
    </div>
    <!-- titrate link / latest basal dose -->
    <div class="grid grid-cols-2 justify-between content-end p-4 bg-gray-200 rounded-lg my-4">
      <router-link class="btn w-52 force-center-content"
        :to="{ name: 'TitrateView', params: { subjectId: route.params.subjectId } }">
        Titrate {{ route.params.subjectId }}
      </router-link>
      <div class="flex justify-between rounded-lg bg-white px-4 w-full" id="basaldoselatest" :title="lastDoseDateText">
        <div class="force-center-content ">Current basal insulin dose: </div>
        <div class="force-center-content px-2"
          :class="{ 'text-gray-500': basalsLoading, 'font-semibold': !basalsLoading }">
          {{ lastDoseText }}
        </div>
        <div class="force-center-content">
          <router-link class="btn-small force-center-content"
            :to="{ name: 'BasalDoseHistory', params: { subjectId: route.params.subjectId } }">
            History
          </router-link>
        </div>
      </div>
    </div>
    <div class="grid py-3 content-center place-items-center" v-if="subjectDetailsLoading">Loading subject details...
    </div>
    <!-- agp/tir graphs -->
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
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import QuantileChart from '@/components/QuantileChart.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import TiRChart from '@/components/TiRChart.vue'
import SubjectGraphable from '@/types/SubjectGraphable'
import QuantileGraphable from '@/types/QuantileGraphable'
import SubjectDetails from '@/types/SubjectDetails'
import SubjectDropdown from '@/components/SubjectDropdown.vue'
import SubjectDatesFromAPIType from '@/types/SubjectDatesFromAPIType'
import BasalDoseType from '@/types/BasalDoseType'
import { useSubjectIdStore } from '@/stores/SubjectIdStore'
import { api, dateConvertToISO } from '@/functions/GlobalFunctions'
import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useErrorStore } from '@/stores/ErrorStore'
import { cloneDeep, lowerCase, range } from 'lodash'

export default defineComponent({
  name: 'AGP',
  components: { QuantileChart, SubjectDropdown, TiRChart, VueDatePicker },
  setup() {
    const debugModeStore = useDebugModeStore()
    const auth = useAuthenticator()
    const apiRootURL = useApiURL()
    const apiRootURLNovo = useApiURLNovo()
    // initialize selected ref() used for dropdown v-model to url value
    // and treat undefined param as '' to properly select empty option
    const errors = useErrorStore()
    const componentName = 'AGP'
    const groupComputed = computed(() => {
      let group = [] as string[]
      if (typeof (auth.user) !== 'undefined' &&
        typeof (auth.user.signInUserSession) !== 'undefined' &&
        typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
        group = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
      }
      console.log(`group: ${group}`)
      return group
    })
    const tokenComputed = computed(() => {
      // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
      let token = ''
      if (typeof (auth.user.signInUserSession) !== 'undefined' && typeof (auth.user.signInUserSession.idToken.jwtToken) !== 'undefined') {
        token = auth.user.signInUserSession.idToken.jwtToken
      }
      console.log(`token: ${token}`)
      return token
    })
    const route = useRoute()
    const selected = ref('')
    selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string
    watch(selected, () => {
      console.log(`dropdown: ${selected.value}`)
      console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
      loaded.value = false
      graphableGlucose.value = {} as QuantileGraphable
      graphableInsulin.value = {} as QuantileGraphable
      tir1Graphable.value = [] as number[]
      tir2Graphable.value = [] as number[]
      getValidDates()
      getBasalDoseHistory()
      getTitrationDates()
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
    const datesLoaded = ref(false)

    // date bounds load
    // TODO CHECK BULLSHIT UTC STUFF
    const date = ref([] as Date[])
    const dateTS = computed(() => {
      let retArr = [] as number[]
      for (const d of date.value) {
        const utcMilllisecondsSinceEpoch = d.getTime() + (d.getTimezoneOffset() * 60 * 1000)
        const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000)
        retArr.push(utcSecondsSinceEpoch)
      }
      return retArr
    })
    // const startDate = 
    const dateBounds = ref({
      min: {} as Date,
      max: {} as Date
    })
    const datesValid = computed(() => {
      let retValid = true
      if (date.value !== null && date.value.length === 2) {
        for (const d of date.value) {
          retValid &&= d >= dateBounds.value.min
          retValid &&= d <= dateBounds.value.max
        }
      } else {
        retValid = false
      }
      return retValid
    })

    // 'loading' and other flags that we'll need
    // primarily used to enable and disable fields for input
    const subjectListLoading = ref(true)
    const subjectDetailsLoading = ref(false)
    const subjectGraphLoading = ref(false)
    const customRangeDrawn = ref(false)
    // this one is a computed value
    // true if subjid is empty OR if subjectDetails are loading
    const subjectDateDisabled = computed(() => {
      return (subjectDetailsLoading.value || selected.value === '')
    })
    const noSubjSelected = computed(() => {
      return selected.value === ''
    })
    // then computed value that disables button
    // if either date input is empty ('')
    const buttonDisabled = computed(() => {
      return (!datesValid.value)
    })

    //////////////////////////
    // functions
    //////////////////////////

    const yesterday_local = ref({} as Date)
    const one_week_ago_local = ref({} as Date)

    const firstDate = ref('')
    const lastDate = ref('')
    const sdError = ref(null)
    const validDateReq = ref(false)
    function getValidDates() {
      console.log(`getValidDates subjid: ${selected.value}`)
      if (selected.value !== '') {
        // reset firstDate and lastDate
        date.value = [] as Date[]
        firstDate.value = ''
        lastDate.value = ''
        customRangeDrawn.value = false
        subjectDetailsLoading.value = true
        datesLoaded.value = false
        subjectGraphLoading.value = true
        validDateReq.value = false

        yesterday_local.value = new Date()
        yesterday_local.value.setDate(yesterday_local.value.getDate() - 1)
        one_week_ago_local.value = new Date()
        one_week_ago_local.value.setDate(one_week_ago_local.value.getDate() - 7)

        const endpoint = 'getsubjectvaliddates'
        const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&subject_id=${selected.value}`
        console.log(`request to ${req_url}`)
        api.getAuth<SubjectDatesFromAPIType>(req_url, tokenComputed.value).then(
          (firstAGPResponse: SubjectDatesFromAPIType) => {
            console.log(`first AGP get SUCCESS for subject ${selected.value}`)
            console.log(firstAGPResponse)
            if (typeof (firstAGPResponse.startAndEndDates) !== 'undefined') {
              validDateReq.value = true
              console.log('start and end dates:', firstAGPResponse.startAndEndDates)
              const dateBoundMin = new Date(firstAGPResponse.startAndEndDates.min_TS * 1000)
              const dateBoundMax = new Date(firstAGPResponse.startAndEndDates.max_TS * 1000)
              console.log('datebounds:', dateBoundMin, dateBoundMax)
              dateBounds.value.min = dateBoundMin
              dateBounds.value.max = dateBoundMax
            }
            datesLoaded.value = true
          }).catch(err => {
            sdError.value = err.message
            errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
            dateBounds.value.min = yesterday_local.value
            dateBounds.value.max = one_week_ago_local.value
            console.log(sdError.value)
          }).finally(() => {
            subjectDetailsLoading.value = false
            subjectGraphLoading.value = false
          })
      }
    }
    // initial invoke on page load to get available date ranges
    // watch
    getValidDates()


    const basalDoseHistory = ref([] as BasalDoseType[])
    const lastDoseText = computed(() => {
      let doseStr = 'N/A'
      if (basalsLoading.value) {
        doseStr = 'Loading...'
      } else if (basalDoseHistory.value.length <= 0) {
        doseStr = 'N/A'
      } else {
        doseStr = `${basalDoseHistory.value[0].basalDoseValue}U`
      }
      return doseStr
    })
    const lastDoseDateText = computed(() => {
      let retStr = ''
      if (!basalsLoading.value && basalDoseHistory.value.length) {
        const fullDate = new Date(basalDoseHistory.value[0].time * 1000)
        retStr = `${fullDate.toUTCString()}`
      }
      return retStr
    })

    const basalsLoading = ref(false)
    function getBasalDoseHistory() {
      console.log('loading dose histories')
      basalsLoading.value = true
      console.log('clearing displayed basal dose history')
      basalDoseHistory.value = [] as BasalDoseType[]
      const endpoint = 'getbasaldosehistory'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&subject_username=${selected.value}`
      console.log(`request to ${req_url}`)
      // server response:
      // {"id":"103","date":"08/29/2023", "timeOfDayInMinutes":1340, "basalDoseValue":40}
      api.getAuth<any[]>(req_url, tokenComputed.value).then(
        (doseHistoryList: any[]) => {
          console.log('successful basal dose history request')
          console.log(doseHistoryList)
          for (const dose of doseHistoryList) {
            const tmpDose = {
              id: '',
              date: '',
              basalDoseTimeOfDayInMinutes: -1,
              basalDoseValue: -1,
              src_id: '-1',
              time: -1,
            }
            tmpDose.id = dose.id
            tmpDose.date = dose.date
            tmpDose.basalDoseTimeOfDayInMinutes = dose.basalDoseTimeOfDayInMinutes
            tmpDose.basalDoseValue = dose.basalDoseValue
            tmpDose.src_id = dose.src_id
            tmpDose.time = dose.time
            basalDoseHistory.value.push(tmpDose)
          }
        }).catch(err => {
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          console.log('done')
          basalsLoading.value = false
        })
    }
    getBasalDoseHistory()

    // vue datepicker specific
    // https://vue3datepicker.com/props/general-configuration/#markers
    interface Markers {
      date: Date | string;
      type?: 'dot' | 'line';
      tooltip?: { text: string; color?: string; }[];
      color?: string;
    }

    // const titrationDates = ref([] as Markers[])
    const subjStartDate = ref('' as string)

    const titrationDatesComputed = computed(() => {
      const tmpMarkers = [] as Markers[]
      console.log('detected new titration subject startdate')
      if (subjStartDate.value !== '') {
        // 18 week study, draw 20 weeks of titration dates to be safe
        // but ignore first week so start at 1
        const startDateDate = new Date(subjStartDate.value)
        console.log(`subjstartdate: ${startDateDate}`)
        for(const wk of range(1,20)) {
          const tmpMarker = {} as Markers
          startDateDate.setDate(startDateDate.getDate() + (7))
          tmpMarker.date = cloneDeep(startDateDate)
          tmpMarker.type = 'dot'
          // console.log(`marker ${wk}:`, tmpMarker)
          // TODO
          // add color and tooltip
          tmpMarkers.push(tmpMarker)
        }
      }
      return tmpMarkers
    })

    // get titration dates as well
    const titrationDatesLoading = ref(false)
    function getTitrationDates() {
      subjStartDate.value = ''
      titrationDatesLoading.value = true
      const endpoint = 'gettitratedates'
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&subject_id=${selected.value}`
      console.log(`request to ${req_url}`)
      api.getAuth<any>(req_url, tokenComputed.value).then(
        (response: any) => {
          console.log(`${endpoint} success!`)
          console.log(response)
          if (typeof(response.subject_start_date) !== 'undefined') {
            subjStartDate.value = response.subject_start_date
          }
        }).catch(err => {
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
          console.log(err.message)
        }).finally(() => {
          titrationDatesLoading.value = false
        })
    }
    getTitrationDates()


    const validDates = ref(true)

    // get / update data to graph
    const graphError = ref(null)
    function graphData() {
      if (!datesValid.value) {
        console.log(`${date.value}: invalid range`)
      } else {
        console.log(`${date.value}: VALID`)
        // console.log('graphing...')
        // console.log(startTS,endTS)
        loaded.value = false
        subjectGraphLoading.value = true
        // TODO pass dates as arguments
        ///const req_url = `${apiRootURL}/getsubjects?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
        // const req_url = `${apiRootURLNovo}/agp?username=${auth.user.username}&subject_id=${selected.value}&day1=${date.value[0].toISOString().split('T')[0]}&day2=${date.value[1].toISOString().split('T')[0]}`
        const req_url = `${apiRootURLNovo}/agp?username=${auth.user.username}&subject_id=${selected.value}&day1=${dateTS.value[0]}&day2=${dateTS.value[1]}`
        console.log(`request to ${req_url}`)
        api.getAuth<SubjectGraphable>(req_url, tokenComputed.value).then(
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
      selected, date, dateBounds, noSubjSelected, lastDoseDateText,
      subjectDateDisabled, subjectDetailsLoading, subjectListLoading, subjectGraphLoading,
      graphData, graphableGlucose, graphableInsulin, loaded, buttonDisabled, datesValid,
      route, sdError, tir1Graphable, tir2Graphable, validDateReq, lastDoseText, basalsLoading,
      titrationDatesComputed, debugModeStore
    }
  }
})
</script>