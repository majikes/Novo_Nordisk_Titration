
<template>
  <div v-if="!groupComputed.includes('participant')" class="profile-history">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Basal Dose History</h1>
    </div>
    <div class="flex justify-end my-1">
      <SubjectDropdown v-model="selected" />
    </div>
    <BasalDoseHistoryTable :doseHistory="basalDoseHistoryConditional" />
    <div v-if="debugModeStore.debugMode">

    </div>
  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubjectDropdown from '@/components/SubjectDropdown.vue'
import BasalDoseHistoryTable from '@/components/BasalDoseHistoryTable.vue'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { lowerCase } from 'lodash'
import { useErrorStore } from '@/stores/ErrorStore'
import BasalDoseType from '@/types/BasalDoseType'

export default defineComponent({
  name: 'BasalDoseHistory',
  components: { SubjectDropdown, BasalDoseHistoryTable },
  props: {},
  setup() {
    const debugModeStore = useDebugModeStore()
    const auth = useAuthenticator()
    const errors = useErrorStore()
    const componentName = 'BasalDoseHistory'
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
    const apiRootURL = useApiURL()
    selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string
    watch(selected, () => {
      console.log(`dropdown: ${selected.value}`)
      // console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
      getBasalDoseHistory()
    })



    const basalDoseHistoryTest = [
      { "id": "103", "date": "08/29/2023", "timeOfDayInMinutes": 1340, "basalDoseValue": 40 },
      { "id": "102", "date": "08/22/2023", "timeOfDayInMinutes": 1300, "basalDoseValue": 45 },
      { "id": "101", "date": "08/15/2023", "timeOfDayInMinutes": 1160, "basalDoseValue": 43 }
    ] as BasalDoseType[]
    const basalDoseHistory = ref([] as BasalDoseType[])
    const basalDoseHistoryConditional = computed(() => {
      return debugModeStore.debugMode ? basalDoseHistoryTest : basalDoseHistory.value
    })
    const basalsLoading = ref(false)

    function getBasalDoseHistory() {
      console.log('loading')
      basalsLoading.value = true
      console.log('clearing displayed basal dose history')
      basalDoseHistory.value = [] as BasalDoseType[]
      const endpoint = 'getbasaldosehistory'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&subject_id=${selected.value}`
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
              timeOfDayInMinutes: -1,
              basalDoseValue: -1,
            }
            tmpDose.id = dose.id
            tmpDose.date = dose.date
            tmpDose.timeOfDayInMinutes = dose.timeOfDayInMinutes
            tmpDose.basalDoseValue = dose.basalDoseValue
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

    return {
      debugModeStore, selected, groupComputed, basalsLoading, basalDoseHistory, basalDoseHistoryConditional
    }
  }
})
</script>
