<template>
  <div class="grid content-start w-64" id="subject-dropdown-div">
    <div class="flex">
      <label for="subject-select">Subject </label>
      <span v-if="titratableOnly" class="pl-1"> (titratable only)</span>
    </div>
    <select class="form-select select-input border-transparent border-r-8" name="subject" id="subject-select"
      ref="subjectselect" :disabled="subjectListLoading || disabledProp" :value="modelValue" @change="changeValue">
      <option disabled value="" selected>{{ subjectSelectText }}
      </option>
      <option v-if="subjectListLoading" :value="modelValue">Loading...</option>
      <option v-else-if="titratableOnly" v-for="subject in subjectListStore.subjectListTitratable" :key="subject.id"
        :value="subject.id">
        {{ subject.id }} |
        {{ (subjectListStore.interventionMap as any)[subject.interventionArm] }}
      </option>
      <option v-else v-for="subject in subjectListStore.subjectListSorted" :key="subject.id" :value="subject.id">
        {{ subject.id }} |
        {{ (subjectListStore.interventionMap as any)[subject.interventionArm] }}
      </option>
    </select>
    <div v-if="debugModeStore.debugMode">
      {{ subjectListStore.currentSubject }}
      {{ subjectListStore.currentSubjectNewRec }}
    </div>
    <!-- {{ route.name }} -->
  </div>
</template>
<script lang="ts">

import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import SubjectDetails from '@/types/SubjectDetails'
import { lowerCase } from 'lodash'
import { useErrorStore } from '@/stores/ErrorStore'
import { type SubjectListItemFromAPIType } from '@/types/SubjectListItemFromAPIType'
import { type SubjectListItemType } from '@/types/SubjectListItemType'
import { useSubjectListStore } from '@/stores/SubjectListStore'
import { useDebugModeStore } from '@/stores/debugModeStore'
import TitrateInfoType from '@/types/TitrateInfoType'

export default defineComponent({
  name: 'SubjectDropdown',
  components: {},
  props: {
    modelValue: {
      type: String as PropType<string>
    },
    titratableOnly: {
      required: false,
      type: Boolean as PropType<boolean>
    },
    disabledProp: {
      required: false,
      type: Boolean as PropType<boolean>
    }
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
    const debugModeStore = useDebugModeStore()

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

    const subjectListStore = useSubjectListStore()

    // loading flags for content
    const subjectListLoading = ref(false)
    const subjectSelectText = computed(() => {
      if (subjectListLoading.value) {
        return 'Loading...'
      } else {
        return '-- Please choose a subject --'
      }
    })
    const route = useRoute()

    // typing emit events
    // https://stackoverflow.com/questions/67434135/vue-3-typescript-warning-on-vue-emit-and-event-object-is-possibly-null
    const router = useRouter()
    const changeValue = (e: Event) => {
      const selected = (e.target as HTMLInputElement).value
      router.push({ params: { subjectId: selected } })
      subjectListStore.setCurrentSubject(selected)
      // subjectIdStore.setSubject(selected)
      // console.log(`emit changevalue ${selected}`)
      emit('update:modelValue', selected)
    }

    // load subject list
    // const subjectList = ref<SubjectListItemType[]>([])
    // const subjectsorted = computed(() => {
    //   return [...subjectList.value].sort()
    // })

    const error = ref(null)
    function loadSubjectList() {
      console.log('loading new subjectlist for dropdown')
      subjectListLoading.value = true
      let endpoint = 'getparticipantidssupervisedbytheuser'
      subjectListStore.loaded = false
      subjectListStore.loadedTS = null
      // if (groupComputed.value.includes('admin')) {
      //   endpoint = 'getassignedusers'
      // }
      const req_url = `${rootApiURL}/${endpoint}?username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.getAuth<SubjectListItemFromAPIType[]>(req_url, tokenComputed.value).then(
        (apiSubjectList: SubjectListItemFromAPIType[]) => {
          console.log(apiSubjectList)
          subjectListStore.subjectList = apiSubjectList.map(function (value, index) {
            return {
              id: value.id,
              active: value.active,
              interventionArm: value.interventionArm,
              rec_dose_TS: null,
              rec_dose_value: null,
              rec_dose_problems: [] as string[],
              dose_TS: null,
              dose_value: null,
              dose_problems: [] as string[],
              loading: false,
            }
          })
          subjectListStore.loaded = true
          subjectListStore.loadedTS = Date.now()
          // loop through subject list and fetch all the dose info
          for (const subject of subjectListStore.subjectList) {
            getSubjectTitrateInfo(subject)
          }
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          subjectListLoading.value = false
        })
    }

    // only run the network request if there's no existing list cached
    if (subjectListStore.loaded === false) {
      // console.log('')
      loadSubjectList()
    } else {
      console.log('subjectList already loaded.')
    }

    const titrateError = ref(null)
    function getSubjectTitrateInfo(subject: SubjectListItemType) {
      console.log(`loading titrate info for subject ${subject.id}`)
      subject.loading = true
      let endpoint = 'titrate'
      const req_url = `${rootApiURL}/${endpoint}?subject_id=${subject.id}&username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.getAuth<TitrateInfoType>(req_url, tokenComputed.value).then(
        (subjectInfo: TitrateInfoType) => {
          console.log(`successful titrate info request for subject ${subject.id}`, subjectInfo)
          subject.dose_value = subjectInfo.dose_value
          subject.dose_TS = subjectInfo.dose_TS
          subject.rec_dose_value = subjectInfo.rec_dose_value
          subject.rec_dose_TS = subjectInfo.rec_dose_TS
          subject.dose_problems = subjectInfo.dose_problems
          subject.rec_dose_problems = subjectInfo.rec_dose_problems
        }).catch(err => {
          titrateError.value = err.message
          console.log(titrateError.value)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          subject.loading = false
          // here's where we're going to loop through the subjects and get their 'titrate' info
        })
    }

    // apparently this is how you pull out specific DOM elements
    const subjectselect = ref<HTMLInputElement | null>(null)
    // THIS ALL HAS TO HAPPEN AFTER ONMOUNTED?
    // TODO i don't believe the onMounted crap

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
          subjectListStore.setCurrentSubject(newSubjId)
          emit('update:modelValue', newSubjId)
          // console.log('hi')
        }
      })

    watch(() => subjectListStore.loaded,
      (loadedBool) => {
        if (loadedBool) {
          console.log('loaded subject list, setting current subject')
          // console.log(`selected = ${route.params.subjectId}`)
          if (typeof (route.params.subjectId) === 'string') {
            console.log(`attempting to set current subject to ${route.params.subjectId}`)
            subjectListStore.setCurrentSubject(route.params.subjectId)
          }
        }
      })


    return {
      changeValue, debugModeStore, route, subjectselect, subjectListLoading, subjectListStore,
      subjectSelectText,
    }
  }
})
</script>
