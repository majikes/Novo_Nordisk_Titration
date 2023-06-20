<template>
    <div class="group control-row rounded-lg mx-4 pt-1 pb-2 px-4 even:bg-gray-100">
      <div class="user-mgmt-cell grid content-center">
        <router-link :to="{ name: 'AGP', params: { subjectId: userlistitem.username } }">
          {{ userlistitem.username }}
        </router-link>
      </div>

      <div class="user-mgmt-cell grid content-center justify-center"
        :class="{ userMgmtActive: useractivestoreitem === 'active' }">
        {{ useractivestoreitem }}
      </div>

      <div class="user-mgmt-cell grid content-center justify-end">
        <select class="activity-select-input" name="status-control" :id="`status-control-select-${userlistitem.username}`"
            @change="emitUpdateActiveStatus"> 
             <!-- v-model="useractivestoreitem" -->
          <option>active</option>
          <option>inactive</option>
        </select>
      </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, PropType, ref } from 'vue'
import UserListItem from '@/types/UserListItem'
import { lowerCase } from 'lodash'

export default defineComponent({
  components: {},
  props: {
    userlistitem: {
      required: true,
      type: Object as PropType<UserListItem>
    },
    useractivestoreitem: {
      required: true,
      type: String
    }
  },
  emits: ['update-active-status'],
  setup(props, {emit}) {
    const isActive = ref(props.userlistitem.status === 'Active')

    // TODO ADD DROPDOWN DISABLE
    // TODO CHECK UPDATE ACTIVE STATUS API  
    const emitUpdateActiveStatus = (e: Event) => {
      const selectedStatus = lowerCase((e.target as HTMLInputElement).value) === 'active'// ? '1' : '0'
      const selectedId = (e.target as HTMLInputElement).id.split('-')[3]
      console.log(`${selectedId}: ${selectedStatus}`)
      emit('update-active-status', e)
    }

    return {emitUpdateActiveStatus}
  }
})
</script>