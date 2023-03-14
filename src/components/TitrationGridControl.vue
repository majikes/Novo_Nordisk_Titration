<template>
  <div id="subject-dropdown-div">
    <select name="subject" id="subject-select" 
      :disabled="subjectListLoading" 
      :value="modelValue" 
      @change="changeValue">
      <option disabled value="" selected>{{ subjectListLoading ? 'Loading...' : '-- Please choose a subject --' }}</option>
      <option v-for="subject in subjectList" :key="subject" :value="subject">
        {{ subject }}
      </option>
    </select>
    {{ route.name }}
  </div>
</template>
<script lang="ts">

import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubjectIdStore } from '@/stores/SubjectIdStore'
import { api } from '@/functions/GlobalFunctions'
import SubjectDetails from '@/types/SubjectDetails'

export default defineComponent({
  name: 'TiRChart',
  components: { },
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
    const error = ref(null)
    onMounted(async () => {
      await api.get<string[]>('http://localhost:3000/subjectListLimited').then(
        (apiSubjectList:string[]) => {
          subjectList.value = apiSubjectList
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
        }).finally(() => {
          subjectListLoading.value = false
        })
    })

    // watch for changes from route
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

    return { changeValue, route, subjectList, subjectListLoading }
  }
})
</script>

<style scoped>

</style>