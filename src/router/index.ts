import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router"
import StudyOverview from '../views/StudyOverview.vue'
import AGP from '../views/AGP.vue'
import TitrationView from '../views/TitrationView2.vue'
import ProfileView from '../views/ProfileView.vue'
import ParticipantManagement from '../views/ParticipantManagement.vue'
import AddParticipant from '../views/AddParticipant.vue'
import DataDownload from '../views/DataDownload.vue'
import UserSettings from '../views/UserSettings.vue'


enum Role {
    participant = 0,
    crc = 1,
    physician = 2
}

let current_role = Role.physician
current_role = Role.crc


const routes : Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'StudyOverview',
        component: StudyOverview
    },
    {
        path: '/agp/:subjectId?',
        name: 'AGP',
        component: AGP
    },
    {
        path: '/titration/:subjectId?',
        name: 'TitrationView2',
        component: TitrationView
    },
    // {
    //     path: '/profile-history/:subjectId?',
    //     name: 'ProfileHistory',
    //     component: ProfileHistory
    // },
    {
        path: '/profile-view/:subjectId',
        name: 'ProfileView',
        component: ProfileView
    },
    {
        path: '/user-management',
        name: 'ParticipantManagement',
        component: ParticipantManagement
    },
    {
        path: '/add-user',
        name: 'AddParticipant',
        component: AddParticipant
    },
    {
        path: '/download',
        name: 'DataDownload',
        component: DataDownload
    },
    // {
    //     path: '/support',
    //     name: 'AppSupport',
    //     component: AppSupport
    // },
    {
        path: '/settings',
        name: 'UserSettings',
        component: UserSettings
    },
]
 

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    linkActiveClass: 'drop-shadow-md'
})

export default router