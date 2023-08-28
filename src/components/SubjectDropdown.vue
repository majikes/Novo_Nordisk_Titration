<template>
  <div class="grid content-start w-64" id="subject-dropdown-div">
    <label for="subject-select">Subject</label>
    <select class="form-select select-input border-transparent border-r-8" name="subject" id="subject-select"
      ref="subjectselect" :disabled="subjectListLoading" :value="modelValue" @change="changeValue">
      <option disabled value="" selected>{{ subjectListLoading ? 'Loading...' : '-- Please choose a subject --' }}
      </option>
      <option v-for="subject in subjectsorted" :key="subject" :value="subject">
        {{ subject }}
      </option>
    </select>
    <!-- {{ route.name }} -->
  </div>
</template>
<script lang="ts">

import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubjectIdStore } from '@/stores/SubjectIdStore'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import SubjectDetails from '@/types/SubjectDetails'
import { lowerCase } from 'lodash'
import { useErrorStore } from '@/stores/ErrorStore'

export default defineComponent({
  name: 'SubjectDropdown',
  components: {},
  props: {
    modelValue: {
      type: String as PropType<string>
    },
    // loaded: {
    //   required: true,
    //   type: Boolean as PropType<boolean>
    // },
    // subjectList: {
    //   required: true,
    //   type: Array as PropType<string[]>
    // }
  },
  emits: ['update:modelValue'],

  setup(props, { emit }) {
    // global root API URL, heck yeah
    const rootApiURL = useApiURL()
    const errors = useErrorStore()
    const componentName = 'SubjectDropdown'

    const auth = useAuthenticator()
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

    // loading flags for content
    const subjectListLoading = ref(true)
    const subjectIdStore = useSubjectIdStore()
    const route = useRoute()
    // const selected = ref('')
    // selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string
    // emit('update:selectedSubject', selected.value)

    // typing emit events
    // https://stackoverflow.com/questions/67434135/vue-3-typescript-warning-on-vue-emit-and-event-object-is-possibly-null
    const router = useRouter()
    const changeValue = (e: Event) => {
      const selected = (e.target as HTMLInputElement).value
      router.push({ params: { subjectId: selected } })
      subjectIdStore.setSubject(selected)
      // console.log(`emit changevalue ${selected}`)
      emit('update:modelValue', selected)
    }

    // load subject list
    const subjectList = ref<string[]>([])
    const subjectsorted = computed(() => {
      return [...subjectList.value].sort()
    })

    const error = ref(null)
    onMounted(async () => {
      ///getassignedusers?username=pcolmegna for non-participant dropdowns and management screens
      //for dropdowns and Usermanagement screens, you can call /getsubjects by passing the 'username'

      // let endpoint = 'getsubjects'
      let endpoint = 'getparticipantidssupervisedbytheuser'
      // if (groupComputed.value.includes('admin')) {
      //   endpoint = 'getassignedusers'
      // }
      const req_url = `${rootApiURL}/${endpoint}?username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      await api.getAuth<any[]>(req_url, tokenComputed.value).then(
        (apiSubjectList: any[]) => {
          console.log(apiSubjectList)
          subjectList.value = apiSubjectList.map(function (value, index) {
            return value.id
          })
          // const gluc = rawDataRows.map(function (value, index) {
          //   const egv = value[7]
          //   if (egv.toLowerCase() === 'low') { return 40 }
          //   else if (egv.toLowerCase() === 'high') { return 400 }
          //   else { return Number(value[7]) }
          // })
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          subjectListLoading.value = false
        })
    })

    // apparently this is how you pull out specific DOM elements
    const subjectselect = ref<HTMLInputElement | null>(null)
    // THIS ALL HAS TO HAPPEN AFTER ONMOUNTED?
    onMounted(() => {
      // console.log('mounted', subjectselect.value)
      // watch for changes from route
      watch(() => route.params.subjectId,
        (newSubjParam) => {
          console.log(`newroute is ${newSubjParam}`)
          const newSubjId = newSubjParam === undefined ? '' : newSubjParam as string
          console.log(subjectselect.value)
          if (subjectselect.value !== null) {
            // subjectselect.value.
            subjectselect.value.value = newSubjId
            emit('update:modelValue', newSubjId)
            // console.log('hi')
          }
        })
    })


    // watch(() => route.params.subjectId,
    // async newSubjId => { 
    //   selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string
    //  })

    // // ... while also pushing new changes to route
    // // route change callback on select change
    // const router = useRouter()
    // function changeSelected(event: Event) {
    //   // TODO idk if we even need this guard anymore thanks to v-model
    //   if (event.target instanceof HTMLSelectElement) {
    //     console.log(`dropdown: ${selected.value}`)
    //     router.push({ params: { subjectId: selected.value } })
    //   }
    // }

    return { changeValue, route, subjectList, subjectselect, subjectsorted, subjectListLoading }
  }
})
</script>
