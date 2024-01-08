
<template>
  <div v-if="!groupComputed.includes('participant')" class="app-download">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">App Download Info</h1>
    </div>
    <div class="flex justify-center my-3">
      <div class="font-semibold px-2">Current auth details for wrapper app installation</div>
    </div>
    <div class="flex justify-center my-3">
      <div class="font-semibold px-2">ID: </div>{{cfAuthUserDisp}}
    </div>
    <div class="flex justify-center my-3">
      <div class="font-semibold px-2">Pass: </div>{{cfAuthPassDisp}}
    </div>
    <div class="flex justify-center my-3">
      <div class="font-semibold px-2">Created at: </div>{{cfAuthTimeDisp}}
    </div>
    <div class="flex justify-center my-3">
      <div class="font-semibold px-2">Download portal: </div><a href="https://d1z29ffuot81x8.cloudfront.net/">https://d1z29ffuot81x8.cloudfront.net/</a>
    </div>
  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { lowerCase } from 'lodash'
import { useErrorStore } from '@/stores/ErrorStore'

export default defineComponent({
  name: 'AppDownload',
  components: { },
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
    const apiRootURL = useApiURL()

    const cfAuthUser = ref('N/A')
    const cfAuthPass = ref('N/A')
    const cfAuthTime = ref('N/A')
    const cfAuthLoading = ref(false)
    const cfAuthUserDisp = computed(() => {
      let retStr = ''
      if (cfAuthLoading.value) {
        retStr = 'Loading...'
      } else {
        retStr = cfAuthUser.value
      }
      return retStr
    })
    const cfAuthPassDisp = computed(() => {
      let retStr = ''
      if (cfAuthLoading.value) {
        retStr = 'Loading...'
      } else {
        retStr = cfAuthPass.value
      }
      return retStr
    })
    const cfAuthTimeDisp = computed(() => {
      let retStr = ''
      if (cfAuthLoading.value) {
        retStr = 'Loading...'
      } else {
        retStr = cfAuthTime.value
      }
      return retStr
    })
    function getCFAuthDetails() {
      console.log('loading')
      cfAuthLoading.value = true
      const endpoint = 'getcfauthdetails'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.getAuth<any>(req_url, tokenComputed.value).then(
        (response: any) => {
          console.log(`successful ${endpoint} request`)
          console.log(response)
          if (typeof(response['username']) !== 'undefined') {
            cfAuthUser.value = response['username']
          }
          if (typeof(response['password']) !== 'undefined') {
            cfAuthPass.value = response['password']
          }
          if (typeof(response['created_at']) !== 'undefined') {
            cfAuthTime.value = response['created_at']
          }
        }).catch(err => {
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          console.log('done')
          cfAuthLoading.value = false
        })
    }
    getCFAuthDetails()

    return {
      debugModeStore, groupComputed, cfAuthLoading, cfAuthUserDisp, cfAuthPassDisp, cfAuthTimeDisp,

    }
  }
})
</script>
