
<template>
  <div class="participant-management">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">User Management</h1>
    </div>
    <div class="my-8 grid grid-cols-4 gap-2" id="add-user">
      <!-- <SubjectDropdown/> -->
      <UserDropdown userType="Physician" />
      <router-link class="user-mgmt-btn w-full bg-gray-100" :to="{ name: 'AddParticipant' }">Add new user</router-link>
    </div>

    <div class="flex justify-between my-4 px-4 py-2 rounded-lg bg-gray-200">
      <div class="user-mgmt-cell" id="id-header">
        <strong>ID</strong>
      </div>
      <!-- <div v-if="groupComputed.includes('admin')" class="user-mgmt-cell" id="role-header">
        <strong>Role</strong>
      </div> -->
      <div class="user-mgmt-cell flex justify-center" id="status-header">
        <strong>Status</strong>
      </div>
      <div class="user-mgmt-cell flex justify-end" id="status-control-header">
        <strong>Status Control</strong>
      </div>
    </div>
    <div v-if="debugModeStore.debugMode">
      <!-- <div> -->
      <div>{{ groupComputed }}</div>
      <div>{{ subjectsorted }}</div>
      <div>{{ subjectActiveStore }}</div>
    </div>
    <!-- <div>{{ subjectActiveStore }}</div> -->
    <div v-if="loading">Loading...</div>
    <div v-else class="group control-row rounded-lg mx-4 pt-1 pb-2 px-4 even:bg-gray-100"
      v-for="subject in subjectsorted" :key="subject.id">
      <div class="user-mgmt-cell grid content-center">
        <router-link :to="{ name: 'AGP', params: { subjectId: subject.id } }">
          {{ subject.id }}
        </router-link>
      </div>
      <div class="flex">
        <div class="user-mgmt-cell grid content-center justify-center" :class="{
          userMgmtActive: subjectActiveStore[subject.id] === 'active' && !subjectLoadingStore[subject.id],
          'text-gray-300': subjectLoadingStore[subject.id]
        }">
          {{ subjectLoadingStore[subject.id] ? 'loading...' : subjectActiveStore[subject.id] }}
        </div>
        <div v-if="debugModeStore.debugMode" @click="errorTest" class="force-center-content"
          :id="`error-test-${subject.id}`">
          <!-- https://feathericons.dev/?search=smile&iconset=feather -->
          <svg class="w-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
            height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="1.5">
            <circle class="pointer-events-none" cx="12" cy="12" r="10" />
            <path class="pointer-events-none" d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line class="pointer-events-none" x1="9" x2="9.01" y1="9" y2="9" />
            <line class="pointer-events-none" x1="15" x2="15.01" y1="9" y2="9" />
          </svg>
        </div>
      </div>
      <div class="user-mgmt-cell grid content-center justify-end">
        <select class="activity-select-input" name="status-control" :id="`status-control-select-${subject.id}`"
          v-model="subjectActiveStore[subject.id]" :disabled="subjectLoadingStore[subject.id]"
          @change="updateActiveStatus">
          <option>active</option>
          <option>inactive</option>
        </select>
      </div>
    </div>
    <!-- v-for div, full span, containing 3 sub divs
      each with 1/3 span or so.
      not its own component, not isolated enough i think -->
  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import Subject from '@/types/Subject'
import SubjectCardFromAPIType from '@/types/SubjectCardFromAPIType'
import { api, subject_convert } from '@/functions/GlobalFunctions'
// import { active } from 'd3-transition'
import { useApiURL } from '@/globalConfigPlugin'
import { lowerCase } from 'lodash'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { jSXAttribute } from '@babel/types'
import { useErrorStore } from '@/stores/ErrorStore'

export default defineComponent({
  name: 'ParticipantManagement',
  components: {},
  setup() {
    const apiRootURL = useApiURL()
    const auth = useAuthenticator()
    const errors = useErrorStore()
    const componentName = 'ParticipantManagement'
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

    const subjectActiveStore = ref({} as any)
    const subjectLoadingStore = ref({} as any)
    const subjects = ref<any[]>([])
    const subjectsorted = computed(() => {
      const sortkey = groupComputed.value.includes('admin') ? 'fullname' : 'id'
      return [...subjects.value].sort((a, b) => {
        if (typeof (a[sortkey]) !== 'undefined' && typeof (b[sortkey]) !== 'undefined') {
          if (a[sortkey] > b[sortkey]) { return 1 }
          else { return -1 }
        }
        else { return 1 }
      })
    })

    // TODO ADD DROPDOWN DISABLE
    // TODO CHECK UPDATE ACTIVE STATUS API  
    const updateMsg = ref(null)
    // const updateLoading = ref(false)
    const updateActiveStatus = (e: Event) => {
      updateMsg.value = null
      const selectedStatus = lowerCase((e.target as HTMLInputElement).value) === 'active'// ? '1' : '0'
      const selectedId = (e.target as HTMLInputElement).id.split('-').slice(3).join('')
      subjectLoadingStore.value[selectedId] = true
      console.log(`${selectedId}: ${selectedStatus}`)

      // const oldStatus = selectedStatus === '1' ? '0' : '1'
      const oldStatus = !selectedStatus
      // basically a flag that we check at .finally() to see if we need to swap back
      let toggleChange = false
      let updateEndpoint = 'updateparticipantstatus'
      let idparam = 'subject_id'
      // if (groupComputed.value.includes('admin') || groupComputed.value.includes('superadmin')) {
      //   updateEndpoint = 'updateuserstatus'
      //   idparam = 'user_id'
      // }
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
            subjectActiveStore.value[selectedId] = selectedStatus ? 'active' : 'inactive'
          } else {
            subjectActiveStore.value[selectedId] = oldStatus ? 'active' : 'inactive'
          }
          subjectLoadingStore.value[selectedId] = false
        })
    }

    const errorTest = (e: Event) => {
      const selectedElem = (e.target as HTMLInputElement)
      const selectedId = selectedElem.id.split('-').slice(2).join('')
      console.log(selectedElem)
      errors.errorLog(`${componentName}; tandem connect test for subject ${selectedId}: FAKE TCONNECT FAIL`,true)
    }

    const error = ref(null)
    const loading = ref(true)
    onMounted(async () => {
      console.log('loading subject list')
      let endpoint = 'getparticipantidssupervisedbytheuser'
      // if (groupComputed.value.includes('admin')) {
      //   endpoint = 'getassignedusers'
      // }
      const list_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}`
      await api.getAuth<any[]>(list_url, tokenComputed.value).then(
        (subjectlist: any[]) => {
          // clear the mapping
          // TODO ADAPT MAPPING
          console.log('successful subject list request')
          console.log(subjectlist)
          subjectActiveStore.value = {}
          subjectLoadingStore.value = {}
          // const true_subjectlist: Subject[] = subjectlist.map(subject_convert)
          // console.log(true_subjectlist)
          subjects.value = []
          if (endpoint === 'getassignedusers') {
            for (const user of subjectlist) {
              const tmpUser = {
                id: -1,
                fname: '',
                lname: '',
                fullname: '',
                role: '',
                active: -1,
              }
              tmpUser.id = user[0]
              tmpUser.fname = user[1]
              tmpUser.lname = user[2]
              tmpUser.fullname = `${user[1]} ${user[2]}`
              tmpUser.active = user[3]
              tmpUser.role = user[4]
              subjects.value.push(tmpUser)
            }
          }
          else {
            for (const subj of subjectlist) {
              const tmpUser = {
                id: '',
                active: -1,
              }
              tmpUser.id = subj['id']
              tmpUser.active = subj['active']
              subjects.value.push(tmpUser)
            }
          }
          for (const subject of subjects.value) {
            subjectActiveStore.value[subject.id] = subject.active === 1 ? 'active' : 'inactive'
            subjectLoadingStore.value[subject.id] = false
          }
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
          errors.errorLog(`${componentName}; request to ${list_url}: ${err.message}`)
        }).finally(() => {
          loading.value = false
        })
    })

    return {
      error, groupComputed, loading, subjects, subjectsorted, subjectActiveStore, updateActiveStatus,
      debugModeStore, subjectLoadingStore, errorTest
    }
  }
})
</script>