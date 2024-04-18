
<template>
  <div v-if="auth.authStatus === 'authenticated' && auth.route === 'authenticated'" id="content-wrapper"
    class="text-gray-700 h-screen flex flex-col">
    <!-- nav bar links -->
    <nav class="flex flex-row justify-center my-4">
      <router-link
        v-if="groupComputed.includes('physician') || groupComputed.includes('crc') || groupComputed.includes('admin') || groupComputed.includes('cdt overseer')"
        class="nav-link group" :to="{ name: 'StudyOverview' }">
        <div class="flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Home
        </div>
      </router-link>
      <router-link v-if="groupComputed.includes('physician') || groupComputed.includes('crc') || groupComputed.includes('cdt overseer')" class="nav-link group"
        :to="{ name: 'AGP', params: { subjectId: route.params.subjectId } }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          AGP
        </div>
      </router-link>
      <router-link v-if="groupComputed.includes('physician') || groupComputed.includes('cdt overseer')" class="nav-link group"
        :to="{ name: 'TitrateView', params: { subjectId: route.params.subjectId } }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Titrate
        </div>
      </router-link>
      <!-- <router-link v-if="!groupComputed.includes('admin')" class="nav-link group"
        :to="{ name: 'ProfileHistory', params: { subjectId: route.params.subjectId } }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Profile History
        </div>
      </router-link> -->
      <router-link v-if="groupComputed.includes('physician') || groupComputed.includes('crc')" class="nav-link group"
        :to="{ name: 'ParticipantManagement' }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Participant Management
        </div>
      </router-link>
      <router-link v-if="groupComputed.includes('admin') || groupComputed.includes('superadmin')" class="nav-link group"
        :to="{ name: 'NonParticipantManagement' }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          {{ groupComputed.includes('admin') ? 'Physician / CRC' : 'Admin' }} Management
        </div>
      </router-link>
      <!-- <router-link
        v-if="groupComputed.includes('admin') || groupComputed.includes('physician') || groupComputed.includes('crc')"
        class="nav-link group" :to="{ name: 'DataDownload' }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Download
        </div>
      </router-link> -->
      <!-- <router-link v-if="groupComputed.includes('participant')" class="nav-link group" :to="{ name: 'DataEntry' }">
        <div class=" flex">
          <svg class="w-5 nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Participant Home
        </div>
      </router-link>
      <router-link v-if="groupComputed.includes('participant')" class="nav-link group"
        :to="{ name: 'SmbgTitrationRules' }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          SMBG Titration rules
        </div>
      </router-link> -->
      <router-link v-if="groupComputed.includes('crc') || groupComputed.includes('cdt technical') || groupComputed.includes('cdt overseer')" class="nav-link group" :to="{ name: 'CGM Data Availability' }">
        <div class="flex">
          <!-- https://feathericons.dev/?search=check-circle&iconset=feather -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="nav-svg" fill="none"
            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          CGM Data Availability
        </div>
      </router-link>
      <router-link v-if="!groupComputed.includes('participant')" class="nav-link group" :to="{ name: 'AppDownload' }">
        <div class=" flex">
          <!-- https://feathericons.dev/?search=box&iconset=feather -->
          <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" x2="12" y1="22.08" y2="12" />
          </svg>
          App Download
        </div>
      </router-link>
      <router-link class="nav-link group" :to="{ name: 'UserSettings' }">
        <div class=" flex">
          <svg class="nav-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          {{ auth.user?.username || 'Settings' }}
        </div>
      </router-link>
    </nav>
    <!-- main view -->
    <router-view class="mx-auto max-w-[900px] overflow-y-scroll overflow-x-visible flex-1 main-container" />
    <!-- footer / drawer -->
    <div class="flex w-full text-center px-4 py-3 gap-2">
      <div class="flex items-end">
        <DebugButton v-if="groupComputed.includes('cdt dev') || groupComputed.includes('cdt technical') || groupComputed.includes('superadmin') || groupComputed.includes('cdt overseer')" />
      </div>
      <NotificationDrawer />
    </div>
  </div>
  <Authenticator :hide-sign-up="true"></Authenticator>
</template>


<script lang="ts">
import { computed, defineComponent, onBeforeMount, onMounted, ref, reactive } from 'vue'
import { api, subject_convert } from '@/functions/GlobalFunctions'
import { useApiURL, useApiURLNovo } from '@/globalConfigPlugin'
import { useDebugModeStore } from '@/stores/debugModeStore'
import DebugButton from './components/DebugButton.vue'
import NotificationDrawer from './components/NotificationDrawer.vue'
import Subject from '@/types/Subject'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { Auth, Amplify } from 'aws-amplify'
import { useRoute } from 'vue-router'
import awsconfig from '@/aws-exports.js'
import { lowerCase } from 'lodash'
Amplify.configure(awsconfig)

// General:

// GET /getsubjects

// SubjectOverview:

// GET /generatedataforstudyoverview

// AGP:

// GET /getsubjectvaliddates
// GET /generatedataforagp
// GET /gettitratedates
// GET /getbasaldosehistory

// Titrate:

// POST /sendnewbasaldose

// History:

// (duplicate) GET /getbasaldosehistory

// Participant Management:

// GET /getsubjectsandstatus
// (maybe POST) GET /updatesubjectstatus

// Physician Management:

// GET /getphysiciansandstatus
// (maybe POST) GET /updatephysicianstatus

// Add Participant:

// (duplicate) GET /getsubjects
// POST /addsubject

// Add Physician:

// GET /getphysicians
// POST /addphysician

// Download:

// GET /downloadsubjectdata

// Participant Home:

// (duplicate) GET  /getbasaldosehistory

// SMBG Titration Rules:

// N/A

// User Settings:

// N/A

// export default class App extends Vue {}
export default defineComponent({
  name: 'App',
  components: {
    Authenticator,
    DebugButton,
    NotificationDrawer
  },
  setup() {
    const debugModeStore = useDebugModeStore()
    const auth = useAuthenticator()
    const route = useRoute()
    const apiRootURL = useApiURL()

    //const authGroupState = reactive({ authGroup: ''})
    ///const user =  Auth.currentAuthenticatedUser();
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

    // onBeforeMount(
    //   async()=>{
    //   authGroupState.authGroup = user.signInUserSession.accessToken.payload["cognito:groups"].toString();
    //   console.log("Current authenticated user: "+authGroupState.authGroup);
    // })


    //let groups = ref([] as string[])
    //let authGroup = ''
    // if(typeof(auth.user.signInUserSession.idToken.payload["cognito:groups"])!=='undefined') {
    //   groups.value = auth.user.signInUserSession.idToken.payload["cognito:groups"]
    //   authGroup = groups.value.toString()
    // }
    // else if(typeof(auth.user["accessToken"])!=='undefined'){
    //   authGroup= auth.user.accessToken.payload['cognito:groups'].toString()
    // }
    // else if(typeof(typeof(auth["idToken"]!=='undefined'))){
    //   authGroup = auth.idToken.payload['cognito:groups'].toString()
    // }
    //console.log("auth: "+JSON.stringify(auth, null, 2));    
    //console.log("auth.user: "+JSON.stringify(auth.user, null, 2));
    //console.log("auth.user.username: "+JSON.stringify(auth.user.username, null, 2));
    //console.log("auth.user.signInUserSession.idToken.payload: "+JSON.stringify(auth.user.signInUserSession.idToken.payload, null, 2));
    //console.log("authGroup: "+authGroupState.authGroup);

    // const error = ref(null)
    // const loading = ref(true)
    // onMounted(async () => {
    //   await api.get<any[]>(`${apiRootURL}/test`).then(
    //     (subjectlist: any[]) => {
    //       const true_subjectlist: Subject[] = subjectlist.map(subject_convert)
    //       console.log("Auth: " + auth + " TEST: " + true_subjectlist)
    //       ///subjects.value = true_subjectlist
    //     }).catch(err => {
    //       error.value = err.message
    //       console.log(error.value)
    //     }).finally(() => {
    //       loading.value = false
    //     })
    // })

    // TODO update state with this call, add mechanism to force reload
    // const subjectList = ref<string[]>([])
    // const error = ref(null)
    // onMounted(async () => {
    //   await api.get<string[]>('http://localhost:3000/subjectListLimited').then(
    //     (apiSubjectList:string[]) => {
    //       subjectList.value = apiSubjectList
    //     }).catch(err => {
    //       error.value = err.message
    //       console.log(error.value)
    //     })
    // })
    // console.log("From App.vue page, auth: " + auth + ", authGroup: " + groupComputed.value);
    return { auth, debugModeStore, groupComputed, route }
  }
});
</script>