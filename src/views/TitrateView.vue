
<template>
  <div v-if="groupComputed.includes('physician')" class="titration-view">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Subject Titration</h1>
    </div>
    <!-- subject dropdown -->
    <div class="flex justify-end content-end">
      <SubjectDropdown v-model="selected" :titratable-only="true" :disabledProp="modalVisible" />
    </div>

    <!-- Loading screen -->
    <div v-if="!subjectListStore.loaded">
      <LoadingHover>
        <div class="font-semibold">Loading subject list...</div>
      </LoadingHover>
    </div>
    <!-- Visible Titrate stuff -->
    <div v-else-if="titratePageVisible">
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
          :title="subjectListStore.lastDoseDateText">
          <!-- :title="lastDoseDate" -->
          <div class="force-center-content ">Current basal insulin dose: </div>
          <div class="force-center-content px-2"
            :class="{ 'text-gray-500': !subjectListStore.loaded, 'font-semibold': subjectListStore.loaded }">
            {{ subjectListStore.lastDoseText }}
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
          :title="subjectListStore.lastRecDoseDateText">
          <div class="force-center-content"
            :class="{ 'text-gray-400': !subjectListStore.currentSubjectNewRec, 'font-semibold': subjectListStore.currentSubjectNewRec }">
            {{ subjectListStore.currentSubjectNewRec ? 'NEW' : 'Latest' }} recommended basal insulin dose:
          </div>
          <div class="force-center-content px-2 font-semibold"
            :class="{ 'text-gray-400': !subjectListStore.currentSubjectNewRec }">
            {{ subjectListStore.lastRecDoseText }}
          </div>
        </div>
        <div class="grid grid-cols-2">
          <div class="flex">
            <div class="force-center-content px-2 font-semibold">
              <input type="text" id="small-input" class="block w-12 p-2 border
                rounded-lg text-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700
                border-gray-600 placeholder-gray-500 text-white disabled:bg-white disabled:text-gray-400
                disabled:border-transparent disabled:placeholder-gray-400" :disabled="newRecDisplayDisabled"
                placeholder="N/A" v-model="newDoseModel" />
            </div>
            <div class="flex px-2 items-center gap-2" :class="{ 'text-gray-400': newRecInputDisabled }">
              <input type="checkbox" v-model="modifyFlag" :disabled="newRecInputDisabled" />
              Modify dose
            </div>
          </div>
          <div class="flex">
            <button class="btn force-center-content w-52" :disabled="newRecShowModalDisabled"
              :class="{ 'font-semibold': newDoseValid }" @click="showModal">
              CONFIRM + SEND {{ newDoseValid ? `${newDoseModel}U` : '' }}
              <!-- {{newDoseTextConditional}} -->
            </button>
          </div>
          <!-- are you sure? modal -->
          <div v-if="modalVisible" class="adduser-modal bg-transparent" id="modal-container">
            <LoadingHover v-if="submitTitrationLoading">
              <div class="font-semibold">Submitting...</div>
            </LoadingHover>
            <div class="bg-gradient-to-b from-orange-100 from-0% via-white via-5% to-white to-10% rounded-lg w-full p-4">
              <div class="flex justify-center my-6 font-semibold">
                Review Information:
              </div>
              <div class="p-4 rounded-lg bg-white">
                <div class="flex justify-between">
                  <div class="font-semibold">Participant ID:</div>
                  <div>{{ selected }}</div>
                </div>
                <div class="flex justify-between">
                  <div class="font-semibold">Dose:</div>
                  <div>{{ `${newDoseModel}U` }}</div>
                </div>
              </div>
              <div class="p-4 rounded-lg border-2 border-orange-300">
                <div class="control-row font-semibold">Confirm information and add subject to system?</div>
                <div class="flex justify-between gap-4 mt-4 mb-2">
                  <button class="profile-confirm-btn w-64 bg-gray-100" @click="hideModal"
                    :disabled="submitTitrationLoading">
                    Cancel
                  </button>
                  <button class="profile-confirm-btn w-64 bg-emerald-100 font-semibold" :disabled="submitTitrationLoading"
                    @click="submitTitration">
                    {{ submitTitrationLoading ? 'Submitting...' : 'Confirm' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="custom-invalid-feedback flex col-span-2 justify-end">
          <!--:class="{ 'invisible': idValid, 'visible': !idValid }">-->
          <div>{{ newDoseProblems }}</div>
        </div>
      </div>
    </div>
    <!-- Titrate not visible -->
    <div v-else class="w-full h-40 force-center-content text-l font-semibold">
      <div v-if="selected !== ''">
        {{ subjectListStore.currentSubject.id }} is in the {{ (subjectListStore.interventionMap as
          any)[subjectListStore.currentSubject.interventionArm]
        }} arm - Titration functions disabled.
      </div>
      <div v-else>
        No subject selected.
      </div>
    </div>
    <!-- debug stuff -->
    <div v-if="debugModeStore.debugMode">
      <div>modifyFlag: {{ modifyFlag }}</div>
      <div>newDoseIsDigits: {{ newDoseIsDigits }}</div>
      <div>newDoseProblems: {{ newDoseProblems }}</div>
      <div>newDoseModel: {{ newDoseModel }}</div>
      <div>subjectListStore.currentSubjectNewRec: {{ subjectListStore.currentSubjectNewRec }}</div>
      <div>subjectListStore.subjectListTitratable: {{ subjectListStore.subjectListTitratable }}</div>
      <div>subjectListStore.subjectListSorted: {{ subjectListStore.subjectListSorted }}</div>
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
import { api } from '@/functions/GlobalFunctions'
import TiRChart from '@/components/TiRChart.vue'
import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useErrorStore } from '@/stores/ErrorStore'
import { isEmpty, lowerCase } from 'lodash'
import '@vuepic/vue-datepicker/dist/main.css'
import LoadingHover from '@/components/LoadingHover.vue'
import { useSubjectListStore } from '@/stores/SubjectListStore'
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

    const subjectListStore = useSubjectListStore()
    const titratePageVisible = computed(() => {
      if (subjectListStore.loaded && subjectListStore.currentSubject.interventionArm === 1) {
        return true
      } else {
        return false
      }
    })

    // 'loading' and other flags that we'll need
    // primarily used to enable and disable fields for input
    const subjectListLoading = ref(true)
    const subjectDetailsLoading = ref(false)
    const subjectGraphLoading = ref(false)

    // const subjectIdStore = useSubjectIdStore()
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
      // console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
      // router.push({ name: 'AGP', params: { subjectId: selected.value } })
      // loaded.value = false
      if (titratePageVisible.value) {
        graphData()
      }
      // getBasalDoseHistory()
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

    watch(() => subjectListStore.currentSubject.rec_dose_value,
      (newRecDoseVal) => {
        if (typeof (newRecDoseVal) !== 'undefined') {
          if (newRecDoseVal === null || newRecDoseVal < 0) {
            newDoseModel.value = null
          } else {
            newDoseModel.value = String(newRecDoseVal)
          }
        }
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
      if (!isEmpty(subjectListStore.currentSubject.dose_problems) || !isEmpty(subjectListStore.currentSubject.rec_dose_problems)) {
        problemStr = `${subjectListStore.currentSubject.dose_problems}; ${subjectListStore.currentSubject.rec_dose_problems}`
      } else if (!subjectListStore.currentSubjectNewRec) {
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

    const submitTitrationLoading = ref(false)
    function submitTitration() {
      submitTitrationLoading.value = true
      const endpoint = 'saveandsendnewbasaldose'
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&subject_id=${selected.value}`
      console.log(`request to ${req_url}`)

      const nowTS = Math.floor(Date.now() / 1000)
      const inputJSON = JSON.stringify({
        src_id: 1,
        arm_type: 1,
        basalDose: {
          username: selected.value,
          doseValue: Number(newDoseModel.value),
        },
        subject_username: selected.value,
        project: "novonordisktitration",
        requestor: {
          username: auth.user?.username,
          role: groupComputed.value.includes('physician') ? "physician" : `${groupComputed.value}`,
        },
      })
      //  error output:
      // {
      //   "__type": "com.amazon.coral.service#SerializationException",
      //     "Message": "Start of structure or map found where not expected."
      // }
      //  valid output:
      // {
      //   "executionArn": "arn:aws:states:us-east-1:582050746740:execution:Novo_Titration_Optimize_Save_and_Notify_Recommendations:1707172562-saveandsendnewbasaldose-giuliophys-41104-43U",
      //   "startDate": 1707172567.247
      // }

      const requestObj = {
        input: inputJSON,
        name: `${nowTS}-saveandsendnewbasaldose-${auth.user?.username}-${selected.value}-${newDoseModel.value}U`,
        stateMachineArn: "arn:aws:states:us-east-1:582050746740:stateMachine:Novo_Titration_Optimize_Save_and_Notify_Recommendations"
      }
      console.log('attempting request with requestObj:', requestObj)
      api.postAuth<any, any>(req_url, tokenComputed.value, JSON.stringify(
        requestObj
      )).then(
        (response: any) => {
          console.log(response)
          // TODO need correct response format
          if (typeof(response['startDate']) === undefined) {
            console.log(`${endpoint} success!`)
            hideModal()
            // HORRIBLE BUT FORCE REFRESHING THE PAGE IS EASIEST RN.
            router.push({ name: 'TitrateView', params: { subjectId: '' } })
          } else {
            console.log('error detected')
            let tmpErr = '' 
            if (typeof(response['message']) !== undefined) {
              tmpErr = response['message']
            } else if (typeof(response['Message']) !== undefined) {
              tmpErr = response['Message']
            } else {
              tmpErr = `${response}`
            }
            errors.errorLog(`${componentName}; request to ${req_url}: ${tmpErr}`, true)
          }
        }).catch(err => {
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
          console.log(err.message)
        }).finally(() => {
          submitTitrationLoading.value = false
          // submitTitrationRedirect()
        })
    }

    const modalVisible = ref(false)
    function showModal() {
      modalVisible.value = true
    }

    const newRecDisplayDisabled = computed(() => {
      if (debugModeStore.debugMode) {
        return modifyDisabled.value || false
      } else {
        return modifyDisabled.value || !subjectListStore.currentSubjectNewRec || modalVisible.value
      }
    })
    const newRecInputDisabled = computed(() => {
      if (debugModeStore.debugMode) {
        return false
      } else {
        return !subjectListStore.currentSubjectNewRec || modalVisible.value
      }
    })
    const newRecShowModalDisabled = computed(() => {
      if (debugModeStore.debugMode) {
        return false
      } else {
        return !subjectListStore.currentSubjectNewRec || !newDoseValid.value || modalVisible.value
      }
    })

    function hideModal() {
      modalVisible.value = false
    }

    function submitTitrationRedirect() {
      router.push({ name: 'StudyOverview' })
    }

    return {
      selected, subjectDetailsLoading, subjectListLoading, subjectGraphLoading,
      graphData, graphableGlucose, loaded, submitTitration,
      route, tir1Graphable, modifyFlag, debugModeStore, groupComputed, modifyDisabled,
      newDoseModel, newDoseMin, submitTitrationLoading, modalVisible,
      newDoseMax, newDoseValid, newDoseProblems, isEmpty, showModal, hideModal,
      newDoseIsDigits, subjectListStore, titratePageVisible, newRecDisplayDisabled,
      newRecInputDisabled, newRecShowModalDisabled,
    }
  }
})
</script>  