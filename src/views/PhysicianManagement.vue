<template>
    <div class="physician-management">
        <div class="control-row" id="header">
            <h1 class="text-2xl font-bold">Physician Management</h1>
        </div>
        <div class="my-8" id="add-user">
            <router-link class="btn" :to="{ name: 'AddPhysician' }">Add new physician</router-link>
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
        <!-- <div>{{ userActiveStore }}</div> -->
        <div v-if="loading">Loading...</div>
        <div v-else>
            <UserManagementList :userlistitems="subjectsorted" :useractivestore="userActiveStore" id="physician-list"/>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted } from 'vue';
import UserManagementList from '@/components/UserManagementList.vue';
import UserListItem from '@/types/UserListItem';
import { api, user_convert } from '@/functions/GlobalFunctions'
// import { active } from 'd3-transition'
import { useApiURL } from '@/globalConfigPlugin'
import { lowerCase } from 'lodash';

export default defineComponent({
    name:'PhysicianManagement',
    components:{ UserManagementList },
    setup(){
        const apiRootURL = useApiURL()

        const userActiveStore = ref({} as any)

        const userlistitems = ref<any[]>([])
        const subjectsorted = computed(() => {
        return [...userlistitems.value].sort((a, b) => {
            if (typeof (a.username) !== 'undefined' && typeof (b.username) !== 'undefined') {
            if (a.username > b.username) { return 1 }
            else { return -1 }
            }
            else { return 1 }
        })
        })

        const error = ref(null)
        const loading = ref(true)
        onMounted(async () => {
        await api.get<any[]>(`${apiRootURL}/test`).then(
            (userlist: any[]) => {
                // clear the mapping
                userActiveStore.value = {}
                const true_userlist: UserListItem[] = userlist.map(user_convert)
                console.log(true_userlist)
                userlistitems.value = true_userlist
                for (const useritem of userlistitems.value) {
                    userActiveStore.value[useritem.username] = lowerCase(useritem.status)
                }
            }).catch(err => {
            error.value = err.message
            console.log("catch block:"+ error.value)
            }).finally(() => {
            loading.value = false
            })

        })
        return { subjectsorted, userActiveStore, loading, error}
    }
})
</script>