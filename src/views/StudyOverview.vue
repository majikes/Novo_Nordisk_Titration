<template>
  <div class="study-overview">
    <div class="control-row">
      <h1 class="text-2xl font-bold">Study Overview</h1>
    </div>
    <div v-if="error" class="text-l font-semibold grid content-center place-items-center h-48">
      <h2 class="h-full">{{ error }}</h2>
    </div>
    <div v-else>
      <SubjectCardList :cards="cardList" :loading="loading" />
    </div>
  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
// import CircleDataQualityChart from '@/components/CircleDataQualityChart.vue'
import SubjectCardList from '@/components/SubjectCardList.vue'
import Subject from '@/types/Subject'
import SubjectCardType from '@/types/SubjectCardType'
import SubjectCardFromAPIType from '@/types/SubjectCardFromAPIType'
import { api, subject_convert } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { useErrorStore } from '@/stores/ErrorStore'

export default defineComponent({
  name: 'StudyOverview',
  components: { SubjectCardList },
  setup() {
    const apiRootURL = useApiURL()
    const auth = useAuthenticator()
    const errors = useErrorStore()
    const componentName = 'StudyOverview'
    const tokenComputed = computed(() => {
      // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
      let token = ''
      if (typeof (auth.user.signInUserSession) !== 'undefined' && typeof (auth.user.signInUserSession.idToken.jwtToken) !== 'undefined') {
        token = auth.user.signInUserSession.idToken.jwtToken
      }
      console.log(`token: ${token}`)
      return token
    })
    // TODO the fact that i'm using any here instead of Subject is annoying
    // try to change in the future
    const subjects = ref([] as Subject[])
    const cardList = ref([] as SubjectCardType[])

    const error = ref(null)
    const loading = ref(true)

    onMounted(async () => {
      // UPDATED API DEF:
      // [{ 'subjectUsername': '81101', 
        //   'connectionStatus': 1, 
        //   'nDays': -1, 
        //   'activeStatus': 0, 
        //   'adherenceCircle': { 'p_cgm': 97.37, 'nBolus_d': 15.57, 'tCL': 91.85, 'score': 0.91 }, 
        //   'timeInRange': { 'lt54': 0.0, 'bt5470': 0.0, 'bt70180': 71.9, 'bt180250': 25.6, 'gt250': 2.5 } 
        // },]
      const req_url = `${apiRootURL}/generatedataforstudyoverview?username=${auth.user.username}`
      await api.getAuth<SubjectCardFromAPIType[]>(req_url, tokenComputed.value).then(
        (subjectCards: SubjectCardFromAPIType[]) => {
          // const true_subjectlist: Subject[] = subjectlist.map(subject_convert)
          // console.log(true_subjectlist)
          // for now we're going to fake it and generate an array of SubjectCards from
          // our Subject array
          console.log('successful studyoverview request:')
          console.log(subjectCards)
          const cards = [] as SubjectCardType[]
          for (const subject of subjectCards) {
            const card = {} as SubjectCardType
            card.username = subject.subjectUsername
            card.status = subject.activeStatus === 1 ? 'active' : 'inactive'
            card.tconnectStatus = subject.connectionStatus === 1
            card.tirData = subject.timeInRange
            card.dataQualityBreakdown = subject.adherenceCircle
            card.daysToTitrate = subject.nDays

            cards.push(card)
          }
          cardList.value = cards
          // subjects.value = true_subjectlist
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          loading.value = false
        })

    })

    const loaded = true
    return { cardList, error, loading, subjects, loaded }
  }
})
</script>