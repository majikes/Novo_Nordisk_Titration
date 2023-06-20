<template>
    <div class="grid content-end w-64" id="user-dropdown-div">
      <label for="user-select">{{userType}}</label>
      <select class="form-select select-input border-transparent border-r-8" name="user" id="user-select" :disabled="userListLoading"
        :value="modelValue" @change="changeValue">
        <option disabled value="" selected>{{ userListLoading ? 'Loading...' : '-- Please choose a '+ userType +' --' }}
        </option>
        <option v-for="user in usersorted" :key="user" :value="user">
          {{ user }}
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
  import SubjectDetails from '@/types/SubjectDetails'
  import { useUserIdStore } from '@/stores/UserIdStore'
  
  export default defineComponent({
    name: 'TiRChart',
    components: {},
    props: {
      modelValue: {
        type: String as PropType<string>
      },
      userType: {
        required: true,
        type: String as PropType<string>
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
  
      // loading flags for content
      const userListLoading = ref(true)
      const userIdStore = useUserIdStore()
      const route = useRoute()
      // const selected = ref('')
      // selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string
      // emit('update:selectedSubject', selected.value)
  
      // typing emit events
      // https://stackoverflow.com/questions/67434135/vue-3-typescript-warning-on-vue-emit-and-event-object-is-possibly-null
      const router = useRouter()
      const changeValue = (e: Event) => {
        const selected = (e.target as HTMLInputElement).value
        router.push({ params: { userId: selected } })
        userIdStore.setUser(selected)
        // console.log(`emit changevalue ${selected}`)
        emit('update:modelValue', selected)
      }
  
      // load subject list
      const userList = ref<string[]>([])
      const usersorted = computed(() => {
        return [...userList.value].sort()
      })
  
      const error = ref(null)
      onMounted(async () => {
        const req_url = `${rootApiURL}/getsubjects?subject_id=all`
        console.log(`request to ${req_url}`)
        await api.get<string[]>(req_url).then(
          (apiUserList: string[]) => {
            console.log(apiUserList)
            userList.value = apiUserList
          }).catch(err => {
            error.value = err.message
            console.log(error.value)
          }).finally(() => {
            userListLoading.value = false
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
  
      return { changeValue, route, userList, usersorted, userListLoading }
    }
  })
  </script>
  