<template>
  <div class="study-overview">
    <div class="control-row">
      <h1 class="text-2xl font-bold">Study Overview</h1>
    </div>
    <div v-if="error" class="text-l font-semibold grid content-center place-items-center h-48">
      <h2 class="h-full">{{ error }}</h2>
    </div>
    <div v-else-if="loading" class="text-l font-semibold grid content-center place-items-center h-48">
      <h2 class="h-full">Loading...</h2>
    </div>
    <div v-else>
      <SubjectCardList :subjects="subjects" />
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
// import CircleDataQualityChart from '@/components/CircleDataQualityChart.vue'
import SubjectCardList from '@/components/SubjectCardList.vue'
import Subject from '@/types/Subject'
import { api, subject_convert } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'

export default defineComponent({
  name: 'StudyOverview',
  components: { SubjectCardList },
  setup() {
    const apiRootURL = useApiURL()
    // TODO the fact that i'm using any here instead of Subject is annoying
    // try to change in the future
    const subjects = ref<any[]>([])
    // const subjectsorted = computed(() => {
    //   return [...subjects.value].sort((a, b) => {
    //     if (typeof (a.username) !== 'undefined' && typeof (b.username) !== 'undefined') {
    //       if (a.username > b.username) { return 1 }
    //       else { return -1 }
    //     }
    //     else { return 1 }
    //   })
    // })

    const error = ref(null)
    const loading = ref(true)
    onMounted(async () => {
      await api.get<any[]>(`${apiRootURL}/test`).then(
        (subjectlist: any[]) => {
          const true_subjectlist: Subject[] = subjectlist.map(subject_convert)
          console.log(true_subjectlist)
          subjects.value = true_subjectlist
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
        }).finally(() => {
          loading.value = false
        })
    })
    const testQuality = .93
    const testStatus = false
    const loaded = true
    return { error, loading, subjects, testQuality, testStatus, loaded }
  }
})
</script>