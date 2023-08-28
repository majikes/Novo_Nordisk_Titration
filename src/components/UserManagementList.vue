<template>
    <div class="flex flex-wrap justify-between gap-4 mt-4">
      <div v-if="userlistitems">
        <UserManagementListItem
            v-for="userlistitem in userlistitems" :key="userlistitem.id" 
            :userlistitem="userlistitem" 
            />
      </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import UserManagementListItem from './UserManagementListItem.vue'
import UserListItem from '@/types/UserListItem'
import { lowerCase } from 'lodash'

export default defineComponent({
    name: 'UserManagementList',
    components: {UserManagementListItem},
    props: {
        userlistitems:{
            required: true,
            type: Array as PropType<UserListItem[]>
        },

    },
    setup(props) {

    return { }
    }
})

</script>