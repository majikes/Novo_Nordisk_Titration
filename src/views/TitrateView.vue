
<template>
  <div class="titration-view">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Subject Titration</h1>
    </div>
    <!-- subject dropdown -->
    <div class="flex justify-end content-end">
      <SubjectDropdown v-model="selected" />
    </div>

    <!-- Quantile graph and TIR -->
    <div class="grid grid-cols-12 min-h-[400px] py-1">
      <LoadingHover v-if="!loaded">
        <div class="font-semibold">Loading...</div>
      </LoadingHover>
      <div class="col-span-11">
        <!-- glucose row -->
        <div class="py-2" id="quantile-caption"><span class="font-semibold">Glucose</span></div>
        <div class="relative" id="quantile-container">
          <QuantileChart v-if="loaded" :graphableData="graphableGlucose" :loaded="loaded" dataType="glucose" />
        </div>
      </div>
      <div class="grid">
        <div class="pl-3 py-2" id="tir1-caption"><span class="font-semibold">Prev week</span></div>
        <TiRChart class="h-80 w-10 justify-self-center" v-if="loaded" :tirData="tir1Graphable" :loaded="loaded" />
      </div>
    </div>

    <!-- titrate link / latest basal dose -->
    <div class="grid grid-cols-2 justify-between content-end p-4 gap-2 bg-gray-200 rounded-lg my-4">
      <div class="flex justify-between rounded-lg bg-white px-4 py-3 w-full" id="basaldoselatest"
        :title="lastDoseDateText">
        <!-- :title="lastDoseDate" -->
        <div class="force-center-content ">Current basal insulin dose: </div>
        <div class="force-center-content px-2"
          :class="{ 'text-gray-500': basalsLoading, 'font-semibold': !basalsLoading }">
          {{ lastDoseText }}
        </div>
      </div>
      <div class="flex items-center justify-end">
        <router-link :to="{ name: 'BasalDoseHistory', params: { subjectId: route.params.subjectId } }">
          <div class="btn force-center-content w-52">
            History
          </div>
        </router-link>
      </div>

      <div class="flex justify-between rounded-lg bg-white px-4 py-3 w-full" id="basaldoserec"
        :title="lastRecDoseDateText">
        <div class="force-center-content"
          :class="{ 'text-gray-400': !lastRecIsNewRec, 'font-semibold': lastRecIsNewRec }">
          {{ lastRecIsNewRec ? 'NEW' : 'Latest' }} recommended basal insulin dose:
        </div>
        <div class="force-center-content px-2 font-semibold" :class="{ 'text-gray-400': !lastRecIsNewRec }">
          {{ lastRecDoseText }}
        </div>
      </div>
      <div class="grid grid-cols-2">
        <div class="flex">
          <div class="force-center-content px-2 font-semibold">
            <input type="text" id="small-input" class="block w-12 p-2 border
              rounded-lg text-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 
              border-gray-600 placeholder-gray-500 text-white disabled:bg-white disabled:text-gray-400 
              disabled:border-transparent disabled:placeholder-gray-400" :disabled="modifyDisabled || !lastRecIsNewRec"
              placeholder="N/A" v-model="newDoseModel" />
          </div>
          <div class="flex px-2 items-center gap-2" :class="{ 'text-gray-400': !lastRecIsNewRec }">
            <input type="checkbox" v-model="modifyFlag" :disabled="!lastRecIsNewRec" />
            Modify dose
          </div>
        </div>
        <button class="btn force-center-content w-52" :disabled="!lastRecIsNewRec || !newDoseValid"
          :class="{ 'font-semibold': newDoseValid }" @click="submitTitration">
          CONFIRM + SEND {{ newDoseValid ? `${newDoseModel}U` : '' }}
          <!-- {{newDoseTextConditional}} -->
        </button>
      </div>
      <div class="custom-invalid-feedback flex col-span-2 justify-end">
        <!--:class="{ 'invisible': idValid, 'visible': !idValid }">-->
        <div>{{ newDoseProblems }}</div>
      </div>
    </div>
    <!-- debug stuff -->
    <div v-if="debugModeStore.debugMode">
      <div>modifyFlag: {{ modifyFlag }}</div>
      <div>newDoseIsDigits: {{ newDoseIsDigits }}</div>
      <div>newDoseProblems: {{ newDoseProblems }}</div>
      <div>newDoseModel: {{ newDoseModel }}</div>
      <div>lastRecIsNewRec: {{ lastRecIsNewRec }}</div>
      <div>basalDoseHistory.length: {{ basalDoseHistory.length }}</div>
      <div>basalDoseHistory[0]: {{ basalDoseHistory[0] }}</div>
      <div>lastRecDose: {{ lastRecDose }}</div>
      <div>isEmpty(lastRecDose): {{ isEmpty(lastRecDose) }}</div>
      <div>lastRecDose.dose_TS !== undefined: {{ typeof (lastRecDose.dose_TS) !== 'undefined' }}</div>
      <div>basalDoseHistory: {{ basalDoseHistory }}</div>
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
import BasalDoseType from '@/types/BasalDoseType'
import RecBasalDoseType from '@/types/RecBasalDoseType'
import { api } from '@/functions/GlobalFunctions'
import TiRChart from '@/components/TiRChart.vue'
import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useErrorStore } from '@/stores/ErrorStore'
import { isEmpty, lowerCase } from 'lodash'
import '@vuepic/vue-datepicker/dist/main.css'
import LoadingHover from '@/components/LoadingHover.vue'
// import { max } from 'lodash'

export default defineComponent({
  name: 'TitrateView',
  components: { LoadingHover, QuantileChart, SubjectDropdown, TiRChart },
  setup() {
    const apiRootURL = useApiURL()
    const auth = useAuthenticator()
    const errors = useErrorStore()
    const route = useRoute()
    const router = useRouter()
    const componentName = 'TitrateView'
    const debugModeStore = useDebugModeStore()
    // let groups = ref([] as string[])
    // if (typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
    //   groups.value = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
    // }
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
    const selected = ref('')
    selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string

    // 'loading' and other flags that we'll need
    // primarily used to enable and disable fields for input
    const subjectListLoading = ref(true)
    const subjectDetailsLoading = ref(false)
    const subjectGraphLoading = ref(false)

    const subjectIdStore = useSubjectIdStore()
    // the actual graphable data we'll be updating
    // TODO find out how we strictly type this without populating data
    // i think it might just be ref({} as SubjectGraphable), idk
    const graphableGlucose = ref({} as QuantileGraphable)
    const tir1Graphable = ref([] as number[])
    ///const tir2Graphable = ref([] as number[])
    // loaded flag for QuantileChart etc, should be false when subj changes
    const loaded = ref(false)

    const modifyFlag = ref(false)
    const modifyDisabled = computed(() => { return !modifyFlag.value })

    watch(selected, () => {
      console.log(`dropdown: ${selected.value}`)
      console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
      // router.push({ name: 'AGP', params: { subjectId: selected.value } })
      // loaded.value = false
      graphData()
      getLatestRecDose()
      getBasalDoseHistory()
    })

    //////////////////////////
    // functions
    //////////////////////////

    // setting start and end dates manually
    const yesterday_local = ref({} as Date)
    const one_week_ago_local = ref({} as Date)
    // get / update data to graph
    const graphError = ref(null)
    function graphData() {
      yesterday_local.value = new Date()
      yesterday_local.value.setDate(yesterday_local.value.getDate() - 1)
      one_week_ago_local.value = new Date()
      one_week_ago_local.value.setDate(one_week_ago_local.value.getDate() - 7)

      const startTS = Math.floor((new Date(yesterday_local.value).valueOf()) / 1000)
      const endTS = Math.floor((new Date(one_week_ago_local.value).valueOf()) / 1000)
      console.log(`graphing from ${one_week_ago_local.value} to ${yesterday_local.value}...`)
      console.log(startTS, endTS)

      loaded.value = false
      subjectGraphLoading.value = true
      // TODO pass dates as arguments
      ///const req_url = `${apiRootURL}/getsubjects?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
      const req_url = `${apiRootURL}/agp?subject_id=${selected.value}&day1=${startTS.valueOf()}&day2=${endTS.valueOf()}`
      console.log(`request to ${req_url}`)
      api.getAuth<SubjectGraphable>(req_url, tokenComputed.value).then(
        (subjectGraphable: SubjectGraphable) => {
          console.log('success!')
          console.log(subjectGraphable)
          graphableGlucose.value.id = selected.value
          // graphableInsulin.value.id = selected.value
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
          // graphableInsulin.value.traceGroups = [
          //   {
          //     type: 'insulin',
          //     traces: insTraces,
          //     colors: {
          //       inner: 'rgba(219, 39, 119, 0.7)',
          //       outer: 'rgba(244, 114, 182, 0.7)'
          //     }
          //   },
          // ]
          tir1Graphable.value = subjectGraphable.tControlMean
          // tir2Graphable.value = subjectGraphable.tControlMean
          loaded.value = true
        }).catch(err => {
          graphError.value = err.message
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
          console.log(graphError.value)
        }).finally(() => {
          subjectGraphLoading.value = false
        })

    }
    graphData()
    // for lambda insert into basal_profile table

    const lastDoseText = computed(() => {
      let doseStr = 'N/A'
      if (basalsLoading.value) {
        doseStr = 'Loading...'
      } else if (basalDoseHistory.value.length <= 0) {
        doseStr = 'N/A'
      } else if (typeof (basalDoseHistory.value[0]) !== 'undefined') {
        doseStr = `${basalDoseHistory.value[0].basalDoseValue}U`
      }
      return doseStr
    })
    const lastDoseDateText = computed(() => {
      let retStr = ''
      if (!basalsLoading.value && basalDoseHistory.value.length > 0 && typeof (basalDoseHistory.value[0]) !== 'undefined') {
        const fullDate = new Date(basalDoseHistory.value[0].time * 1000)
        retStr = `${fullDate.toISOString()}`
      }
      return retStr
    })

    const basalDoseHistory = ref([] as BasalDoseType[])
    const basalsLoading = ref(false)

    function getBasalDoseHistory() {
      console.log('loading')
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

    const lastRecDoseText = computed(() => {
      let doseStr = 'N/A'
      if (lastRecDoseLoading.value) {
        doseStr = 'Loading...'
      } else if (typeof (lastRecDose.value.dose_TS) === 'undefined') {
        doseStr = 'N/A'
      } else {
        doseStr = `${lastRecDose.value.dose_value}U`
      }
      return doseStr
    })
    const lastRecDoseDateText = computed(() => {
      let retStr = ''
      if (!lastRecDoseLoading.value && typeof (lastRecDose.value.dose_TS) !== 'undefined') {
        const fullDate = new Date(lastRecDose.value.dose_TS * 1000)
        retStr = `${fullDate.toISOString()}`
      }
      return retStr
    })

    const lastRecIsNewRec = computed(() => {
      let retBool = false
      if (basalDoseHistory.value.length > 0 && typeof (basalDoseHistory.value[0]) !== 'undefined' && typeof (lastRecDose.value.dose_TS) !== 'undefined') {
        const newestBasalTS = basalDoseHistory.value[0].time
        const newestRecBasalTS = lastRecDose.value.dose_TS
        console.log(`nominal: ${newestBasalTS}`)
        console.log(`rec    : ${newestRecBasalTS}`)
        retBool ||= newestRecBasalTS > newestBasalTS
      }
      return retBool
    })

    const newDoseModel = ref(null as string | null)
    const newDoseMin = 0
    const newDoseMax = 100
    const newDoseRegex = /^\d+$/
    const newDoseIsDigits = computed(() => {
      return typeof (newDoseModel.value) === 'string' &&
        newDoseModel.value.match(newDoseRegex) !== null
    })
    const newDoseValid = computed(() => {
      const newDoseNum = Number(newDoseModel.value)
      return newDoseIsDigits.value &&
        newDoseNum >= newDoseMin &&
        newDoseNum <= newDoseMax
    })
    const newDoseProblems = computed(() => {
      let problemStr = ''
      if (!lastRecIsNewRec.value) {
        problemStr = 'Last recommended dose is older than last implemented dose'
      } else if (!newDoseIsDigits.value) {
        problemStr = 'Please enter a whole number for the basal dose'
      } else {
        const newDoseNum = Number(newDoseModel.value)
        if (newDoseNum < newDoseMin || newDoseNum > newDoseMax) {
          problemStr = `Entered value ${newDoseNum} is outside the ${newDoseMin}-${newDoseMax} bounds`
        }
      }
      return problemStr
    })

    const lastRecDose = ref({} as RecBasalDoseType)
    const lastRecDoseLoading = ref(false)

    function getLatestRecDose() {
      lastRecDoseLoading.value = true
      lastRecDose.value = {} as RecBasalDoseType
      const endpoint = 'titrate'
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&subject_id=${selected.value}`
      console.log(`request to ${req_url}`)
      api.getAuth<RecBasalDoseType>(req_url, tokenComputed.value).then(
        (response: RecBasalDoseType) => {
          console.log(`${endpoint} success!`)
          console.log(response)
          lastRecDose.value.dose_TS = response.rec_dose_TS
          lastRecDose.value.dose_value = response.rec_dose_value
          newDoseModel.value = String(response.dose_value)
        }).catch(err => {
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
          console.log(err.message)
        }).finally(() => {
          lastRecDoseLoading.value = false
        })
    }
    getLatestRecDose()

    const submitLoading = ref(false)
    function submitTitration() {
      submitLoading.value = true
      const endpoint = 'saveandsendnewbasaldose'
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&subject_id=${selected.value}`
      console.log(`request to ${req_url}`)
      const requestObj = {
        newdose: Number(newDoseModel.value)
      }
      api.postAuth<any, any>(req_url, tokenComputed.value, JSON.stringify(
        requestObj
      )).then(
        (response: any) => {
          console.log(`${endpoint} success!`)
          console.log(response)
          // TODO need correct response format
        }).catch(err => {
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
          console.log(err.message)
        }).finally(() => {
          submitLoading.value = false
          // submitTitrationRedirect()
        })
    }

    function submitTitrationRedirect() {
      router.push({ name: 'StudyOverview' })
    }

    return {
      selected, subjectDetailsLoading, subjectListLoading, subjectGraphLoading, lastDoseText,
      graphData, graphableGlucose, loaded, submitTitration, lastRecDoseLoading, lastDoseDateText,
      route, tir1Graphable, modifyFlag, debugModeStore, groupComputed, modifyDisabled,
      basalsLoading, lastRecDoseDateText, lastRecDoseText, lastRecIsNewRec, newDoseModel, newDoseMin,
      newDoseMax, newDoseValid, newDoseProblems, basalDoseHistory, lastRecDose, isEmpty,
      newDoseIsDigits,
    }
  }
})
</script>  