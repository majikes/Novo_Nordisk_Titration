<template>
  <div v-if="validPage" class="add-non-participant">
    <div class="control-row" id="header">
      <h1 class="text-2xl font-bold capitalize">Add Physician</h1>
    </div>

    <div class="grid grid-cols-2 mt-4">
      <!-- form fields -->
      <div class="adduser-form-cell">
        <label for="validationCustom01">First Name</label>
        <input type="text" :disabled="modalVisible" v-model="inputObj.firstname" class="adduser-text-input peer"
          id="validationCustom01" placeholder="First Name" required>
        <div class="invalid-feedback">
          Please enter a first name.
        </div>
      </div>
      <div class="adduser-form-cell">
        <label for="validationCustom02">Last Name</label>
        <input type="text" :disabled="modalVisible" v-model="inputObj.lastname" class="adduser-text-input peer"
          id="validationCustom02" placeholder="Last Name" required>
        <div class="invalid-feedback">
          Please enter a last name.
        </div>
      </div>
      <div class="adduser-form-cell">
        <div class="flex relative justify-between">
          <label for="validationCustom03">Username</label>
          <div class="force-center-content">
            <svg class="w-5 peer" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <ToolTip displaySide="mid">
              <div class="text-sm px-2">
                <div class="font-semibold">Existing usernames:</div>
                <div v-for="username in usernames" :key="username">{{ username }}</div>
              </div>
            </ToolTip>
          </div>
        </div>
        <input type="text" :disabled="modalVisible || usernamesLoading" v-model="inputObj.username"
          class="custom-text-input peer" :class="{ 'custom-valid': usernameValid, 'custom-invalid': !usernameValid }"
          id="validationCustom03" :placeholder="usernameFieldLoading" required>
        <div class="custom-invalid-feedback" :class="{ 'invisible': usernameValid, 'visible': !usernameValid }">
          Please enter a unique username.
        </div>
      </div>
      <div class="adduser-form-cell">
        <label for="validationCustom04">Email</label>
        <input type="email" :disabled="modalVisible" v-model="inputObj.email" class="adduser-text-input peer"
          id="validationCustom04" placeholder="fake.name@example.com" required>
        <div class="invalid-feedback">
          Must be a valid email.
        </div>
      </div>
      <div class="adduser-form-cell">
        <label for="validationCustom05">Role</label>
        <select :disabled="modalVisible" v-model="inputObj.role" class="adduser-select-input peer"
          id="validationCustom05" required>
          <option disabled value="" selected>Select role...</option>
          <option v-for="role in roles" :value="role" :key="role">{{ role }}</option>
        </select>
        <div class="invalid-feedback">Please select a role.</div>
      </div>
      <div class="adduser-form-cell">
        <label for="validationCustom06">Site</label>
        <select :disabled="modalVisible || sitesLoading" v-model="inputObj.site" class="adduser-select-input peer"
          id="validationCustom06" required>
          <option disabled value="" selected>{{ sitesLoading ? 'Loading...' : 'Select site...' }}</option>
          <option v-for="site in sites" :value="site.name" :key="site.id">{{ site.name }}</option>
        </select>
        <div class="invalid-feedback">Please select a site.</div>
      </div>
    </div> <!-- end form fields -->
    <div v-if="debugModeStore.debugMode">
      <div>{{ inputObj }}</div>
      <div>{{ groupComputed }}</div>
    </div>

    <!-- "sumbit" control -->
    <div v-if="debugModeStore.debugMode">
      <!-- <div>sites: {{sites}}</div> -->
      <div>{{ inputValid }}</div>
      <div>inputValid.valid: {{ inputValid.valid }}</div>
    </div>
    <div class="adduser-form-cell flex justify-center">
      <div class="adduser-form-cell flex justify-center">
        <button class="btn w-96" :disabled="!inputValid.valid" @click="showModal">
          Add User
        </button>
      </div>
      <div v-if="debugModeStore.debugMode" class="adduser-form-cell flex justify-center">
        <button class="btn w-96 font-semibold bg-rose-300" @click="addUser">
          DEBUG ADD USER
        </button>
      </div>
    </div>

    <!-- "are you sure" modal -->
    <div v-if="modalVisible" class="adduser-modal bg-transparent" id="modal-container">
      <div class="bg-gradient-to-b from-orange-100 from-0% via-white via-5% to-white to-10% rounded-lg w-full p-4">
        <div class="flex justify-center my-6 font-semibold">
          Review Information:
        </div>
        <div class="p-4 rounded-lg bg-white">
          <div class="flex justify-center mt-2 mb-4">
            <div class="font-semibold mx-2">Primary Info:</div>
          </div>
          <div class="p-4 mb-4 rounded-lg bg-gray-100">
            <div v-for="(value, key) in inputObj" class="grid grid-cols-2 px-4 py-1" :key="key">
              <div class="font-semibold">{{ (inputNameMap as any)[key.toLowerCase()] }}</div>
              <div>{{ value }}</div>
            </div>
          </div>
          <!-- <div class="flex justify-center my-2">
            <div class="font-semibold mx-2">Sleep:</div>
            <div class="mx-2">
              {{ `${String(sleep.sleepStart).padStart(2, '0')}:00 - ${String(sleep.sleepEnd).padStart(2, '0')}:00` }}
            </div>
          </div> -->
        </div>
        <div class="p-4 rounded-lg border-2 border-orange-300">
          <div class="control-row font-semibold">Confirm information and add user to system?</div>
          <div class="flex justify-between gap-4 mt-4 mb-2">
            <button class="profile-confirm-btn w-64 bg-gray-100" @click="hideModal">Cancel</button>
            <button class="profile-confirm-btn w-64 bg-emerald-100 font-semibold" @click="addUser">Confirm</button>
            <button v-if="debugModeStore.debugMode" class="profile-confirm-btn w-64 bg-rose-300 font-semibold"
              @click="addUserRedirect">
              Redirect only
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { cloneDeep, lowerCase } from 'lodash'
import { useErrorStore } from '@/stores/ErrorStore'
import ToolTip from '@/components/ToolTip.vue'

export default defineComponent({
  name: 'AddPhysician',
  components: { ToolTip },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const apiRootURL = useApiURL()
    const auth = useAuthenticator()

    const errors = useErrorStore()
    const componentName = 'AddNonParticipant'
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
    const debugModeStore = useDebugModeStore()
    const validPage = computed(() => {
      // literally only disallowed for participants
      let valid = false
      if (!groupComputed.value.includes('participant')) { valid ||= true }
      return valid
    })

    const modalVisible = ref(false)

    const inputObj = ref({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      role: '',
      site: '',
    })

    const inputNameMap = {
      firstname: 'First name',
      lastname: 'Last name',
      username: 'Username',
      email: 'email',
      role: 'Role',
      site: 'Site',
    }

    const sites = ref([] as any[])
    const roles = computed(() => {
      let returnRoles = [] as string[]
      if (groupComputed.value.includes('crc') || groupComputed.value.includes('physician') || groupComputed.value.includes('admin')) {
        returnRoles = ['crc', 'physician']
      } else if (groupComputed.value.includes('superadmin')) {
        returnRoles = ['admin', 'superadmin']
      }
      return returnRoles
    })

    const sitesLoading = ref(false)
    const siteErrors = ref(null)
    function loadSites() {
      sitesLoading.value = true
      // TODO add real logic pls
      // Parameters to send: username, project
      // Example: username = 'pcolmegna', project = 'pedapai'
      const endpoint = 'getprojectsites'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&project=pedapai&role=${groupComputed.value[0]}`
      console.log(`request to ${req_url}`)
      api.getAuth<any>(req_url, tokenComputed.value).then(
        (response: any) => {
          // sites.value = ['site 1', 'site 2', 'site 3']
          console.log('successful sites request')
          console.log(response)
          if (typeof (response.sites) !== 'undefined') {
            sites.value = response.sites
          }
        }).catch(err => {
          siteErrors.value = err.message
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          sitesLoading.value = false
        })
    }
    loadSites()

    const usernames = ref([] as string[])
    const usernamesLoading = ref(false)
    const usernameErrors = ref(null)
    function loadSubjectIDS() {
      usernamesLoading.value = true
      // Endpoint: // /getallnonparticipantusernames
      // Input: username(string)
      const endpoint = 'getallusernames'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.getAuth<any>(req_url, tokenComputed.value).then(
        (response: any) => {
          // sites.value = ['site 1', 'site 2', 'site 3']
          console.log(`successful ${endpoint} request`)
          console.log(response)
          if (typeof (response.usernames) !== 'undefined') {
            usernames.value = response.usernames
          }
          // TODO ADD LOGIC THAT POPULATES EITHER
          // physicians OR crcs
          // DEPENDING ON USER GROUP
        }).catch(err => {
          usernameErrors.value = err.message
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          usernamesLoading.value = false
        })
    }
    loadSubjectIDS()

    const usernameFieldLoading = computed(() => {
      return usernamesLoading.value ? 'Loading Usernames...' : 'Username'
    })

    const addUserDisabled = computed(() => {
      return true
    })

    const usernameNotEmpty = computed(() => { return inputObj.value.username !== '' })
    const usernameNotTaken = computed(() => { return !usernames.value.includes(inputObj.value.username) })
    const usernameValid = computed(() => { return usernameNotEmpty.value && usernameNotTaken.value })

    const inputValid = computed(() => {
      const problems = [] as string[]
      let validTmp = true

      const firstnameValid = inputObj.value.firstname !== ''
      if (!firstnameValid) { problems.push('Input a first name') }
      validTmp &&= firstnameValid

      const lastnameValid = inputObj.value.lastname !== ''
      if (!lastnameValid) { problems.push('Input a last name') }
      validTmp &&= lastnameValid

      if (!usernameNotEmpty.value) { problems.push('Input a username') }
      if (!usernameNotTaken.value) { problems.push('Username already taken') }
      validTmp &&= usernameNotEmpty.value && usernameNotTaken.value

      const emailExists = inputObj.value.email !== ''
      // regex for the email from here -> https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
      // const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      // const emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      // this is the dumbest regex from that post, but also the safest. hopefully form input
      // will indicate to users before submission whether what they've entered is in fact ok
      const emailRegEx = /^\S+@\S+\.\S+$/
      const emailValid = inputObj.value.email.match(emailRegEx) !== null
      if (!emailExists) { problems.push('Input an email') }
      if (!emailValid) { problems.push('Not a valid email') }
      validTmp &&= emailExists && emailValid

      const roleValid = roles.value.includes(inputObj.value.role)
      if (!roleValid) { problems.push('Select a role') }
      validTmp &&= roleValid

      if (['admin', 'physician', 'crc'].includes(inputObj.value.role)) {
        let siteValid = false //sites.value.includes(inputObj.value.site)
        for (const site of sites.value) {
          if (typeof (site.name) !== 'undefined') {
            siteValid ||= lowerCase(inputObj.value.site) === lowerCase(site.name)
          }
        }
        if (!siteValid) { problems.push('Select a site') }
        validTmp &&= siteValid
      }

      return {
        valid: validTmp,
        problems: problems,
      }
    })

    function showModal() {
      modalVisible.value = true
    }

    function hideModal() {
      modalVisible.value = false
    }

    const addUserLoading = ref(false)
    const addUserErrors = ref(null)
    function addUser() {
      addUserLoading.value = true
      const site = inputObj.value.role === 'superadmin' ? '' : inputObj.value.site
      const requestObj = {
        requestor: {
          username: auth.user.username,
          role: groupComputed.value[0],
        },
        new_user: {
          firstname: inputObj.value.firstname,
          lastname: inputObj.value.lastname,
          username: inputObj.value.username,
          email: inputObj.value.email,
          role: inputObj.value.role,
          site: site,
        },
        project: 'pedapai'
      }

      console.log('POST request to /addnewuser')
      console.log(requestObj)
      const req_url = `${apiRootURL}/addnewuser?username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.postAuth<any, any>(req_url, tokenComputed.value, JSON.stringify(
        requestObj
      )).then((response: any) => {
        console.log(response)
        addUserRedirect()
      }).catch(err => {
        addUserErrors.value = err.message
        console.log(err.message)
        errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
      }).finally(() => {
        addUserLoading.value = false
      })
    }

    function addUserRedirect() {
      router.push({ name: 'StudyOverview' })
    }

    return {
      route, auth, debugModeStore, inputObj, addUser, showModal, hideModal, modalVisible,
      roles, sites, inputValid, inputNameMap, addUserRedirect, validPage, groupComputed,
      usernameNotEmpty, usernameNotTaken, usernameValid, usernamesLoading, usernameErrors,
      sitesLoading, siteErrors, addUserLoading, addUserErrors, usernameFieldLoading, usernames
    }
  }
})
</script>