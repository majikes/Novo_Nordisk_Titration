<template>
  <div v-if="groupComputed.includes('crc') || groupComputed.includes('cdt technical') || groupComputed.includes('cdt overseer')" class="cgm-data-availability">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">CGM Data Availability</h1>
    </div>
    <div v-for="(cgmValidList, index) in cgmAvailabilityPercentagesValid" :key="index"
      class="p-2 my-2 grid grid-cols-4 rounded-md bg-gray-200 font-mono">
      <div class="m-1 p-1 col-span-4 grid grid-cols-4 justify-between rounded-sm" :class="{
        'bg-emerald-200': cgmValidList.percentageOfCgmAvailable >= thresholdTotal,
        'bg-red-300': cgmValidList.percentageOfCgmAvailable < thresholdTotal
      }">
        <h2 class="flex justify-between col-span-3 text-xl font-semibold p-3">
          {{ cgmValidList.username }} : {{ cgmValidList.percentageOfCgmAvailable }}%
        </h2>
        <div class="text-m font-semibold px-2 pt-1 w-full">
          <h2 class="flex justify-between">
            <div>first:</div>
            <div>{{ dateFormat(cgmValidList.firstTimestamp) }}</div>
          </h2>
          <h2 class="flex justify-between">
            <div>last:</div>
            <div>{{ dateFormat(cgmValidList.lastTimestamp) }}</div>
          </h2>
        </div>
      </div>
      <div class="p-1 col-span-4 flex flex-wrap w-full gap-1 justify-start">
        <div v-for="(cgmDay, index2) in cgmValidList.dailyPercentageOfCgmAvailable" :key="index2"
          :title="`Day start at ${String(new Date(cgmDay.dayStartTimestamp * 1000).toLocaleString('en-US'))}`"
          class="aspect-square w-20 force-center-content rounded-sm" :class="{
            'bg-emerald-200': cgmDay.percentageOfCgmAvailable >= thresholdDaily,
            'bg-red-300': cgmDay.percentageOfCgmAvailable < thresholdDaily
          }">
          {{ cgmDay.percentageOfCgmAvailable }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { type CGMDataAvailType } from '@/types/CGMDataAvailType'
import { cloneDeep, lowerCase } from 'lodash'
import type { CGMDataAvailDayType } from '@/types/CGMDataAvailDayType'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useErrorStore } from '@/stores/ErrorStore'

export default defineComponent({
  name: 'CGMDataAvailability',
  components: {},
  props: {},
  setup() {
    const apiRootURL = useApiURL()
    const auth = useAuthenticator()
    const errors = useErrorStore()
    const route = useRoute()
    const router = useRouter()
    const componentName = 'CGMDataAvailability'
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
    // const debugModeStore = useDebugModeStore()
    // const auth = useAuthenticator()
    // const errors = useErrorStore()
    // const componentName = 'BasalDoseHistory'
    // const groupComputed = computed(() => {
    //   let group = [] as string[]
    //   if (typeof (auth.user) !== 'undefined' &&
    //     typeof (auth.user.signInUserSession) !== 'undefined' &&
    //     typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
    //     group = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
    //   }
    //   console.log(`group: ${group}`)
    //   return group
    // })
    // const tokenComputed = computed(() => {
    //   // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
    //   let token = ''
    //   if (typeof (auth.user.signInUserSession) !== 'undefined' && typeof (auth.user.signInUserSession.idToken.jwtToken) !== 'undefined') {
    //     token = auth.user.signInUserSession.idToken.jwtToken
    //   }
    //   console.log(`token: ${token}`)
    //   return token
    // })
    // const route = useRoute()
    const thresholdTotal = ref(70)
    const thresholdDaily = ref(70)

    const validIDRegex = /^102\d{3}$/

    const cgmAvailabilityPercentages = ref([] as CGMDataAvailType[])
    const cgmAvailabilityPercentagesValid = computed(() => {
      const retArr = [] as any[]
      for (const subj of cgmAvailabilityPercentages.value) {
        if (subj.username !== null && validIDRegex.test(subj.username)) {
          const subjCopy = {} as CGMDataAvailType
          subjCopy.username = String(subj.username)
          subjCopy.percentageOfCgmAvailable = Number(subj.percentageOfCgmAvailable)
          subjCopy.dailyPercentageOfCgmAvailable = [] as CGMDataAvailDayType[]
          const tmpDays = [...subj.dailyPercentageOfCgmAvailable]
          for (const day of tmpDays) {
            const tmpDay = {} as CGMDataAvailDayType
            tmpDay.dayStartTimestamp = day.dayStartTimestamp
            tmpDay.percentageOfCgmAvailable = Math.round(day.percentageOfCgmAvailable * 100) / 100
            subjCopy.dailyPercentageOfCgmAvailable.push(tmpDay)

          }
          subjCopy.firstTimestamp = subj.firstTimestamp
          subjCopy.lastTimestamp = subj.lastTimestamp
          retArr.push(subjCopy)
        }
      }
      return retArr
    })

    function dateFormat(timestamp: number) {
      const date = new Date(timestamp * 1000)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hr = (String(date.getHours())).padStart(2, '0')
      const min = (String(date.getMinutes())).padStart(2, '0')
      const retStr = `${month}/${day} ${hr}:${min}`
      return retStr
    }

    const cgmAvailabilityLoading = ref(false)
    function getCgmAvailabilityPercentage() {
      cgmAvailabilityLoading.value = true
      console.log('loading')
      const endpoint = 'getCgmAvailabilityPercentage'
      // const req_username = auth.user.username
      const req_username = 'testuser'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${req_username}`
      console.log(`request to ${req_url}`)
      // api.getAuth<any>(req_url, tokenComputed.value).then(
      api
        .get<CGMDataAvailType[]>(req_url)
        .then((response: CGMDataAvailType[]) => {
          console.log(`successful ${endpoint} request`)
          console.log(response)
          cgmAvailabilityPercentages.value = response
        })
        .catch((err) => {
          console.log(err.message)
          // errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        })
        .finally(() => {
          cgmAvailabilityLoading.value = false
          console.log('done')
        })
    }
    getCgmAvailabilityPercentage()

    return {
      cgmAvailabilityPercentages,
      cgmAvailabilityPercentagesValid,
      dateFormat,
      thresholdTotal,
      thresholdDaily,
      debugModeStore,
      groupComputed
    }
  }
})
</script>
