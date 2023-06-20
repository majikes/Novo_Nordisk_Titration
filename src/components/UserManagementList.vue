<template>
    <div class="flex flex-wrap justify-between gap-4 mt-4">
      <div v-if="userlistitems">
        <UserManagementListItem
            v-for="userlistitem in userlistitems" :key="userlistitem.id" 
            @update-active-status="updateActiveStatus"
            :userlistitem="userlistitem" :useractivestoreitem="userActiveStore[userlistitem.username]" 
            />
      </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { api} from '@/functions/GlobalFunctions'
import UserManagementListItem from './UserManagementListItem.vue'
import { useApiURL } from '@/globalConfigPlugin'
import { lowerCase } from 'lodash'
import UserListItem from '@/types/UserListItem'

export default defineComponent({
    name: 'UserManagementList',
    components: {UserManagementListItem},
    props: {
        userlistitems:{
            required: true,
            type: Array as PropType<UserListItem[]>
        },
        useractivestore:{
            required: true,
            type: Object as PropType<any>
        }

    },
    setup(props) {
    console.log(props)
    

    const apiRootURL = useApiURL()

    const userActiveStore = ref(props.useractivestore)

    // TODO ADD DROPDOWN DISABLE
    // TODO CHECK UPDATE ACTIVE STATUS API  
    const updateActiveStatus = (e: Event) => {
      console.log("UserManagementList - updateActiveStatus")
      const selectedStatus = lowerCase((e.target as HTMLInputElement).value) === 'active'// ? '1' : '0'
      const selectedId = (e.target as HTMLInputElement).id.split('-')[3]
      console.log(`${selectedId}: ${selectedStatus}`)

      const oldStatus = !selectedStatus

      api.get<any[]>(`${apiRootURL}/updatesubjectstatus?status_type=active&subject_id=${selectedId}&new_active_status=${selectedStatus}&old_active_status=${oldStatus}`).then(
        (response: any) => {
          console.log('active status change')
          console.log(response)
          if (typeof (response.active_status_db) !== 'undefined') {
            const active_status_db = response.active_status_db === 1 ? 'active' : 'inactive'
            userActiveStore.value[selectedId] = active_status_db
          }
        }).catch(err => {
          console.log(err.message)
        })
    }

    return {userActiveStore, updateActiveStatus }
    }
})

</script>