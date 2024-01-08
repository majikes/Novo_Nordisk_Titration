import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router"
import StudyOverview from '../views/StudyOverview.vue'
import AGP from '../views/AGP.vue'
import TitrateView from '../views/TitrateView.vue'
import BasalDoseHistory from '../views/BasalDoseHistory.vue'
import ProfileView from '../views/ProfileView.vue'
import DataEntry from '../views/DataEntry.vue'
import SmbgTitrationRules from '../views/SmbgTitrationRules.vue'
// import ParticipantManagement from '../views/ParticipantManagement.vue'
// import PhysicianManagement from '../views/PhysicianManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import AddParticipant from '../views/AddParticipant.vue'
import AddNonParticipant from '../views/AddNonParticipant.vue'
import DataDownload from '../views/DataDownload.vue'
import UserSettings from '../views/UserSettings.vue'
import AppDownload from '../views/AppDownload.vue'


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
        path: '/app-download',
        name: 'AppDownload',
        component: AppDownload
    },
    {
        path: '/titration/:subjectId?',
        name: 'TitrateView',
        component: TitrateView
    },
    {
        path: '/history/:subjectId?',
        name: 'BasalDoseHistory',
        component: BasalDoseHistory
    },
    {
        path: '/profile-view/:subjectId',
        name: 'ProfileView',
        component: ProfileView
    },
    {
        path: '/data-entry',
        name: 'DataEntry',
        component: DataEntry
    },
    {
        path: '/smbg-titration-rules',
        name: 'SmbgTitrationRules',
        component: SmbgTitrationRules
    },    
    {
        path: '/participant-management',
        name: 'ParticipantManagement',
        component: UserManagement
    },
    {
        path: '/non-participant-management',
        name: 'NonParticipantManagement',
        component: UserManagement
    },
    {
        path: '/add-participant',
        name: 'AddParticipant',
        component: AddParticipant
    },
    {
        path: '/add-non-participant',
        name: 'AddNonParticipant',
        component: AddNonParticipant
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

router.beforeEach((to, from, next) => {
    let title = `NN Titration | ${to.name as string}`
    if (to.params.subjectId) {
        title += ` - ${to.params.subjectId}`
    }
    document.title = title
    next()
})

export default router