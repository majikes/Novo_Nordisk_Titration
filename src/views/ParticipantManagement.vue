
<template>
  <div class="participant-management">
    <div class="control-row" id="header">
      <h1 class="text-2xl font-bold">User Management</h1>
    </div>
    <div class="my-8" id="add-user">
      <SubjectDropdown/>
      <UserDropdown userType="Physician" />
      <router-link class="btn" :to="{ name: 'AddParticipant' }">Add new user</router-link>
    </div>

    <div class="flex justify-between my-4 px-4 py-2 rounded-lg bg-gray-200">
      <div class="user-mgmt-cell" id="id-header">
        <strong>ID</strong>
      </div>
      <div class="user-mgmt-cell flex justify-center" id="status-header">
        <strong>Status</strong>
      </div>
      <div class="user-mgmt-cell flex justify-end" id="status-control-header">
        <strong>Status Control</strong>
      </div>
    </div>
    <!-- <div>{{ subjectActiveStore }}</div> -->
    <div v-if="loading">Loading...</div>
    <!-- TODO FIX GROUP ACTIVE COLORING??? -->
    <div v-else class="group control-row rounded-lg mx-4 pt-1 pb-2 px-4 even:bg-gray-100"
      v-for="subject in subjectsorted"
      :key="subject.username">
      <div class="user-mgmt-cell grid content-center">
        <router-link :to="{ name: 'AGP', params: { subjectId: subject.username } }">
          {{ subject.username }}
        </router-link>
      </div>
      <div class="user-mgmt-cell grid content-center justify-center"
        :class="{ userMgmtActive: subjectActiveStore[subject.username] === 'active' }">
        {{ subjectActiveStore[subject.username] }}
      </div>
      <div class="user-mgmt-cell grid content-center justify-end">
        <select class="activity-select-input" name="status-control" :id="`status-control-select-${subject.username}`"
          v-model="subjectActiveStore[subject.username]" @change="updateActiveStatus">
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
import { api, subject_convert } from '@/functions/GlobalFunctions'
// import { active } from 'd3-transition'
import { useApiURL } from '@/globalConfigPlugin'
import { lowerCase } from 'lodash'
import SubjectDropdown from '@/components/SubjectDropdown.vue'
import UserDropdown from '@/components/UserDropdown.vue'

export default defineComponent({
  name: 'ParticipantManagement',
  components: { SubjectDropdown, UserDropdown },
  setup() {
    const apiRootURL = useApiURL()

    const subjectActiveStore = ref({} as any)
    const subjects = ref<any[]>([])
    const subjectsorted = computed(() => {
      return [...subjects.value].sort((a, b) => {
        if (typeof (a.username) !== 'undefined' && typeof (b.username) !== 'undefined') {
          if (a.username > b.username) { return 1 }
          else { return -1 }
        }
        else { return 1 }
      })
    })

    // TODO ADD DROPDOWN DISABLE
    // TODO CHECK UPDATE ACTIVE STATUS API  
    const updateActiveStatus = (e: Event) => {
      const selectedStatus = lowerCase((e.target as HTMLInputElement).value) === 'active'// ? '1' : '0'
      const selectedId = (e.target as HTMLInputElement).id.split('-')[3]
      console.log(`${selectedId}: ${selectedStatus}`)

      // const oldStatus = selectedStatus === '1' ? '0' : '1'
      const oldStatus = !selectedStatus

      api.get<any[]>(`${apiRootURL}/updatesubjectstatus?status_type=active&subject_id=${selectedId}&new_active_status=${selectedStatus}&old_active_status=${oldStatus}`).then(
        (response: any) => {
          console.log('active status change')
          console.log(response)
          if (typeof (response.active_status_db) !== 'undefined') {
            const active_status_db = response.active_status_db === 1 ? 'active' : 'inactive'
            subjectActiveStore.value[selectedId] = active_status_db
          }
        }).catch(err => {
          console.log(err.message)
        })
    }

    const error = ref(null)
    const loading = ref(true)
    onMounted(async () => {
      await api.get<any[]>(`${apiRootURL}/test`).then(
        (subjectlist: any[]) => {
          // clear the mapping
          subjectActiveStore.value = {}
          const true_subjectlist: Subject[] = subjectlist.map(subject_convert)
          console.log(true_subjectlist)
          subjects.value = true_subjectlist
          for (const subject of subjects.value) {
            subjectActiveStore.value[subject.username] = lowerCase(subject.status)
          }
        }).catch(err => {
          error.value = err.message
          console.log(error.value)
        }).finally(() => {
          loading.value = false
        })
    })
    return { error, loading, subjects, subjectsorted, subjectActiveStore, updateActiveStatus }
  }
})
</script>