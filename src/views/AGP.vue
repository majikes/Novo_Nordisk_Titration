
<template>
  <div class="agp">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Ambulatory Glucose Profile</h1>
    </div>
    <!-- datepicker / subject dropdown -->
    <div class="grid grid-cols-3 my-1 content-end">
      <div v-if="subjectListStore.currentSubject.interventionArm === 1" class="grid content-end pb-1 pr-5"
        id="titrationdatepickerstandin">
        <VueDatePicker v-model="date" :min-date="dateBoundsUTCString.min" :max-date="dateBoundsUTCString.max"
          :enable-time-picker="false" :disabled="noSubjSelected || !validDateReq" :start-date="dateBoundsUTCString.max"
          range auto-apply :markers="titrationDatesComputed" />
      </div>
      <div v-if="subjectListStore.currentSubject.interventionArm === 1" class="grid content-end">
        <button :class="{ 'btn': !newDateSel, 'btn-highlight': newDateSel }" class="w-52" id="graph-button"
          :disabled="buttonDisabled" @click="graphData">Graph</button>
      </div>
      <div class="col-start-3 ml-auto">
        <SubjectDropdown v-model="selected" />
      </div>
    </div>
    <div v-if="debugModeStore.debugMode">
      <div>{{ date }}</div>
      <div>{{ prevDate }}</div>
      <div>{{ titrationDatesComputed }}</div>
    </div>
    <!-- titrate link / latest basal dose -->
    <div class="grid grid-cols-2 justify-between content-end p-4 bg-gray-200 rounded-lg my-4">
      <button class="btn w-52 force-center-content" :disabled="!subjectListStore.titrateable" @click="titrateRedirect">
        Titrate {{ route.params.subjectId }}
      </button>
      <div class="flex justify-between rounded-lg bg-white px-4 w-full" id="basaldoselatest"
        :title="subjectListStore.lastDoseDateText">
        <div class="force-center-content ">Current basal insulin dose: </div>
        <div class="force-center-content px-2 font-semibold">
          {{ subjectListStore.lastDoseText }}
        </div>
        <div class="force-center-content">
          <router-link class="btn-small force-center-content"
            :to="{ name: 'BasalDoseHistory', params: { subjectId: route.params.subjectId } }">
            History
          </router-link>
        </div>
      </div>
      <div v-if="titrateProblems.visible" class="custom-invalid-feedback col-start-1 flex pt-2.5 justify-start">
        <div>{{ titrateProblems.details }}</div>
      </div>
      <div v-if="doseProblems.visible" class="custom-invalid-feedback col-start-2 flex pt-2.5 justify-end">
        <div>{{ doseProblems.details }}</div>
      </div>
    </div>
    <!-- agp/tir graphs EXPERIMENTAL ARM (1) -->
    <div class="relative" id="agp-container">
      <div v-if="subjectDetailsLoading">
        <LoadingHover>
          <div class="font-semibold">Loading subject valid dates...</div>
        </LoadingHover>
      </div>
      <div v-if="subjectGraphLoading">
        <LoadingHover>
          <div class="font-semibold">
            <!-- Loading graphable data for dates {{`${date[0].getMonth()+1}/${date[0].getDate()}`}} - {{`${date[1].getMonth()+1}/${date[1].getDate()}`}}... -->
            Loading graphable data for specified dates...
          </div>
        </LoadingHover>
      </div>
      <div v-if="subjectListStore.currentSubject.interventionArm === 1" class="grid grid-cols-12 py-1">
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
    <!-- smbg/hypo table CONTROL ARM (0) -->
    <div class="relative" id="smbg-container">
      <div v-if="smbgsLoading">
        <LoadingHover>
          <div class="font-semibold">Loading SMBG table...</div>
        </LoadingHover>
      </div>
      <div v-if="subjectListStore.currentSubject.interventionArm === 0">
        <div class="py-2 font-semibold">SMBGs</div>
        <SMBGTable :smbgs="smbgs" />
      </div>
    </div>

  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuantileChart from '@/components/QuantileChart.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import TiRChart from '@/components/TiRChart.vue'
import SubjectGraphable from '@/types/SubjectGraphable'
import QuantileGraphable from '@/types/QuantileGraphable'
import SubjectDetails from '@/types/SubjectDetails'
import SubjectDropdown from '@/components/SubjectDropdown.vue'
import SubjectDatesFromAPIType from '@/types/SubjectDatesFromAPIType'
import BasalDoseType from '@/types/BasalDoseType'
import { api, dateConvertToISO, dateMatch } from '@/functions/GlobalFunctions'
import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useErrorStore } from '@/stores/ErrorStore'
import { cloneDeep, isEmpty, lowerCase, range } from 'lodash'
import { useSubjectListStore } from '@/stores/SubjectListStore'
import SMBGsAndHyposFromAPIType from '@/types/SMBGsAndHyposFromAPIType'
import SMBGTable from '@/components/SMBGTable.vue'
import SMBGFromAPIType from '@/types/SMBGFromAPIType'
import LoadingHover from '@/components/LoadingHover.vue'

export default defineComponent({
  name: 'AGP',
  components: { LoadingHover, QuantileChart, SMBGTable, SubjectDropdown, TiRChart, VueDatePicker },
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
    const subjectListStore = useSubjectListStore()

    const route = useRoute()
    const router = useRouter()
    const selected = ref('')
    selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string
    watch(selected, () => {
      console.log(`dropdown: ${selected.value}`)
    })
    watch(() => subjectListStore.currentSubject.id,
      (subjid) => {
        if (typeof (subjid) !== 'undefined') {
          console.log('valid subject change detected for pinia subject store')
          loaded.value = false
          graphableGlucose.value = {} as QuantileGraphable
          graphableInsulin.value = {} as QuantileGraphable
          tir1Graphable.value = [] as number[]
          tir2Graphable.value = [] as number[]
          getValidDates()
          getTitrationDates()
          getSMBGs()
        }
      })

    // loaded.value = false
    // graphableGlucose.value = {} as QuantileGraphable
    // graphableInsulin.value = {} as QuantileGraphable
    // tir1Graphable.value = [] as number[]
    // tir2Graphable.value = [] as number[]
    // getValidDates()
    // getTitrationDates()
    // getSMBGs()

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
    const prevDate = ref([] as Date[])
    const dateTS = computed(() => {
      let retArr = [] as number[]
      for (const d of date.value) {
        const utcMilllisecondsSinceEpoch = d.getTime() + (d.getTimezoneOffset() * 60 * 1000)
        const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000)
        retArr.push(utcSecondsSinceEpoch)
      }
      return retArr
    })
    const dateBounds = ref({
      min: {} as Date,
      max: {} as Date
    })
    const dateBoundsUTCString = computed(() => {
      const minMaxObj = {
        min: '',
        max: ''
      }
      // console.log('minmaxobj normal: ', dateBounds.value.min, dateBounds.value.max)
      // console.log('min max empty:', isEmpty(dateBounds.value.min), isEmpty(dateBounds.value.max))
      if (typeof (dateBounds.value.min.toLocaleString) === 'function' && typeof (dateBounds.value.max.toLocaleString) === 'function') {
        minMaxObj.min = dateBounds.value.min.toLocaleString('en-US', { timeZone: 'UTC' })
        minMaxObj.max = dateBounds.value.max.toLocaleString('en-US', { timeZone: 'UTC' })
        console.log('minmaxobj: ', minMaxObj)
      }
      return minMaxObj
    })
    const datesValid = computed(() => {
      let retValid = true
      if (date.value.length === 2) {
        const minDate = {
          year: dateBounds.value.min.getUTCFullYear(),
          month: dateBounds.value.min.getUTCMonth(),
          date: dateBounds.value.min.getUTCDate()
        }
        const maxDate = {
          year: dateBounds.value.max.getUTCFullYear(),
          month: dateBounds.value.max.getUTCMonth(),
          date: dateBounds.value.max.getUTCDate()
        }
        const minDateNew = new Date(minDate.year, minDate.month, minDate.date, 0, 0, 0, 0)
        const maxDateNew = new Date(maxDate.year, maxDate.month, maxDate.date, 0, 0, 0, 0)
        for (const d of date.value) {
          const inputDate = {
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate()
          }
          const inputDateNew = new Date(inputDate.year, inputDate.month, inputDate.date, 0, 0, 0, 0)
          console.log('inputDate:', inputDateNew)
          console.log('minDate:', minDateNew)
          console.log('maxDate:', maxDateNew)

          const inMinBound = (inputDateNew >= minDateNew)
          const inMaxBound = (inputDateNew <= maxDateNew)
          console.log('inminbound: ', inMinBound)
          console.log('inmaxbound: ', inMaxBound)
          retValid &&= inMinBound
          retValid &&= inMaxBound
        }
      } else {
        retValid = false
      }
      return retValid
    })

    // some logic to determine whether or not we should highlight the Graph button
    // this works as a computed var without side effects as long as we're always pushing
    // date.value to prevDate.value when we press Graph
    const newDateSel = computed(() => {
      let retBool = false
      if (datesValid.value && (
        (prevDate.value.length === 2 && (!dateMatch(date.value[0],prevDate.value[0]) || !dateMatch(date.value[1],prevDate.value[1]))) ||
        (prevDate.value.length === 0)
      )) {
        // that was a gross conditional. basically, if dates are valid AND (prevDate !== date OR prevDate empty)
        console.log('new dates selected from watcher!')
        console.log(`new dates: ${date.value}`)
        console.log(`old dates: ${prevDate.value}`)
        retBool = true
      }
      return retBool
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

    // not in correct arm, no new rec
    const titrateProblems = computed(() => {
      let problems = {
        visible: false,
        details: ''
      }
      if (!noSubjSelected.value) {
        if (!subjectListStore.loaded) {
          problems.visible = true
          problems.details = `Loading subject list...`
        } else if (subjectListStore.currentSubject.interventionArm === 0) {
          problems.visible = true
          problems.details = `Subject ${subjectListStore.currentSubject.id} is in the Control arm; Titration functions are disabled.`
        } else if (subjectListStore.currentSubject.loading) {
          problems.visible = true
          problems.details = `Loading dose details for subject ${subjectListStore.currentSubject.id} ...`
        } else if (!subjectListStore.currentSubjectNewRec) {
          problems.visible = true
          problems.details = `Subject ${subjectListStore.currentSubject.id} has no new recommended doses.`
        }
      }
      return problems
    })
    const doseProblems = computed(() => {
      let problems = {
        visible: false,
        details: ''
      }
      if (!noSubjSelected.value) {
        if (!isEmpty(subjectListStore.currentSubject.dose_problems)) {
          problems.visible = true
          problems.details = `${subjectListStore.currentSubject.dose_problems}`
        } else if (subjectListStore.currentSubject.loading) {
          problems.visible = true
          problems.details = `Loading dose details for subject ${subjectListStore.currentSubject.id} ...`
        }
      }
      return problems
    })

    //////////////////////////
    // functions
    //////////////////////////

    //////////////////////////
    // experimental arm
    //////////////////////////

    const yesterday_local = ref({} as Date)
    const one_week_ago_local = ref({} as Date)

    const firstDate = ref('')
    const lastDate = ref('')
    const sdError = ref(null)
    const validDateReq = ref(false)
    function getValidDates() {
      // only run for non-empty subjectIDs and subjects in experimental arm
      if (selected.value !== '' && subjectListStore.currentSubject.interventionArm === 1) {
        console.log(`getValidDates subjid: ${selected.value}`)
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

    // const titrationDates = ref([] as Markers[])
    const subjStartDate = ref('' as string)

    // get titration dates as well
    const titrationDatesLoading = ref(false)
    function getTitrationDates() {
      // only run for non-empty subjectIDs and subjects in experimental arm
      if (selected.value !== '' && subjectListStore.currentSubject.interventionArm === 1) {
        subjStartDate.value = ''
        titrationDatesLoading.value = true
        const endpoint = 'gettitratedates'
        const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&subject_id=${selected.value}`
        console.log(`request to ${req_url}`)
        api.getAuth<any>(req_url, tokenComputed.value).then(
          (response: any) => {
            console.log(`${endpoint} success!`)
            console.log(response)
            if (typeof (response.subject_start_date) !== 'undefined') {
              subjStartDate.value = response.subject_start_date
            }
          }).catch(err => {
            errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
            console.log(err.message)
          }).finally(() => {
            titrationDatesLoading.value = false
          })
      }
    }
    getTitrationDates()

    // vue datepicker specific
    // https://vue3datepicker.com/props/general-configuration/#markers
    interface Markers {
      date: Date | string;
      type?: 'dot' | 'line';
      tooltip?: { text: string; color?: string; }[];
      color?: string;
    }

    const titrationDatesComputed = computed(() => {
      const tmpMarkers = [] as Markers[]
      console.log('detected new titration subject startdate')
      if (subjStartDate.value !== '') {
        // 18 week study, draw 20 weeks of titration dates to be safe
        // but ignore first week so start at 1
        const startDateDate = new Date(subjStartDate.value)
        console.log(`subjstartdate: ${startDateDate}`)
        for (const wk of range(1, 20)) {
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

    // const validDates = ref(true)

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
            // reset the Graph button highlighting
            prevDate.value = cloneDeep(date.value)
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

    function titrateRedirect() {
      router.push({ name: 'TitrateView', params: { subjectId: route.params.subjectId } })
    }

    //////////////////////////
    // control arm
    //////////////////////////


    const smbgsLoading = ref(false)
    const smbgs = ref([] as SMBGFromAPIType[])
    function getSMBGs() {
      // only run for non-empty subjectIDs and subjects in experimental arm
      if (selected.value !== '' && subjectListStore.currentSubject.interventionArm === 0) {
        smbgs.value = [] as SMBGFromAPIType[]
        smbgsLoading.value = true

        const endpoint = 'getsmbgsandhypos'
        const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&requestor_username=${auth.user.username}&subject_username=${selected.value}`
        console.log(`request to ${req_url}`)
        api.getAuth<SMBGsAndHyposFromAPIType>(req_url, tokenComputed.value).then(
          (response: SMBGsAndHyposFromAPIType) => {
            console.log(`${endpoint} success!`)
            console.log(response)
            smbgs.value = response.smbgHistory
          }).catch(err => {
            errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
            console.log(err.message)
          }).finally(() => {
            smbgsLoading.value = false
          })
      }
    }
    getSMBGs()

    return {
      selected, date, dateBounds, noSubjSelected,
      subjectDateDisabled, subjectDetailsLoading, subjectListLoading, subjectGraphLoading,
      graphData, graphableGlucose, graphableInsulin, loaded, buttonDisabled, datesValid,
      route, sdError, tir1Graphable, tir2Graphable, validDateReq, subjectListStore,
      titrationDatesComputed, debugModeStore, titrateProblems, doseProblems, titrateRedirect,
      smbgsLoading, smbgs, dateBoundsUTCString, newDateSel, prevDate
    }
  }
})
</script>