<template>
  <div class="group control-row rounded-lg w-full mx-4 pt-1 pb-2 px-4 even:bg-gray-100">
    <div v-if="groupComputed.includes('admin')" class="user-mgmt-cell grid content-center">
      {{ userlistitem.fullname }}
    </div>
    <div v-else class="user-mgmt-cell grid content-center">
      <router-link :to="{ name: 'AGP', params: { subjectId: userlistitem.id } }">
        {{ userlistitem.id }}
      </router-link>
    </div>
    <div v-if="groupComputed.includes('admin')" class="user-mgmt-cell grid content-center">
      {{ userlistitem.role }}
    </div>
    <div class="flex">
      <div class="user-mgmt-cell grid content-center justify-center" :class="{
        userMgmtActive: isActive && !loading,
        'text-gray-300': loading
      }">
        {{ loading ? 'updating...' : statusString }}
      </div>
    </div>
    <div class="user-mgmt-cell grid content-center justify-end">
      <select class="activity-select-input" name="status-control" :id="`status-control-select-${userlistitem.id}`"
        v-model="active" :disabled="loading" @change="updateActiveStatus">
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">

import { computed, defineComponent, PropType, ref } from 'vue'
import { useApiURL } from '@/globalConfigPlugin'
import { api } from '@/functions/GlobalFunctions'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useErrorStore } from '@/stores/ErrorStore'
import UserListItem from '@/types/UserListItem'
import { lowerCase } from 'lodash'

export default defineComponent({
  components: {},
  props: {
    userlistitem: {
      required: true,
      type: Object as PropType<UserListItem>
    },
  },
  setup(props, { emit }) {
    const apiRootURL = useApiURL()
    const auth = useAuthenticator()
    const errors = useErrorStore()
    const componentName = 'UserManagementListItem'
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

    const options = ref([
      { text: 'active', value: 1 },
      { text: 'inactive', value: 0 },
      // { text: 'unknown', value: -1 }
    ])

    const active = ref(props.userlistitem.active)
    const statusString = computed(() => {
      if (active.value === 1) { return 'active' }
      else if (active.value === 0) { return 'inactive' }
      else { return 'unknown' }
    })
    const isActive = computed(() => { return active.value === 1 })
    // const computedActive = computed(() => { return lowerCase(status.value) === 'active' })
    
    const loading = ref(false)
    const updateMsg = ref(null)
    function updateActiveStatus() {
      updateMsg.value = null
      const selectedStatus = active.value === 1 // ? '1' : '0'
      const selectedId = props.userlistitem.id
      loading.value = true
      console.log(`${selectedId}: ${selectedStatus}`)

      // const oldStatus = selectedStatus === '1' ? '0' : '1'
      const oldStatus = !selectedStatus
      // basically a flag that we check at .finally() to see if we need to swap back
      let toggleChange = false
      let updateEndpoint = 'updatesubjectstatus'
      let idparam = 'subject_id'
      if (groupComputed.value.includes('admin') || groupComputed.value.includes('superadmin')) {
        updateEndpoint = 'updateuserstatus'
        idparam = 'user_id'
      }
      const req_url = `${apiRootURL}/${updateEndpoint}?username=${auth.user.username}&status_type=active&${idparam}=${selectedId}&new_active_status=${selectedStatus}&old_active_status=${oldStatus}`
      api.getAuth<any[]>(req_url, tokenComputed.value).then(
        (response: any) => {
          console.log('active status change')
          console.log(response)
          if (typeof (response.ttest) !== 'undefined' &&
            typeof (response.ttest.result) !== 'undefined' &&
            typeof (response.ttest.message) !== 'undefined'
          ) {
            // if (response.update_success !== -1) {
            //   toggleChange = true
            // }
            console.log(response.ttest.message)
            if (!response.ttest.result) {
              errors.errorLog(`${componentName}; tandem connect test for subject ${selectedId}: ${response.ttest.message}`)
            }
            updateMsg.value = response.ttest.message
          }
          if (typeof (response.body) !== 'undefined') {
            const response_body = JSON.parse(response.body)
            console.log(response_body)
            if (typeof (response_body.update_success) !== 'undefined' && response_body.update_success !== -1) {
              toggleChange = true
            }
          }
        }).catch(err => {
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          if (toggleChange) {
            active.value = selectedStatus ? 1 : 0
          } else {
            active.value = oldStatus ? 1 : 0
          }
          loading.value = false
        })
    }

    return { active, isActive, loading, updateActiveStatus, debugModeStore, 
      groupComputed, options, statusString
    }
  }
})
</script>