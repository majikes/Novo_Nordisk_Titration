import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router"
import StudyOverview from '../views/StudyOverview.vue'
import AGP from '../views/AGP.vue'
import TitrateView from '../views/TitrateView.vue'
import ProfileView from '../views/ProfileView.vue'
import DataEntry from '../views/DataEntry.vue'
import SmbgTitrationRules from '../views/SmbgTitrationRules.vue'
import ParticipantManagement from '../views/ParticipantManagement.vue'
import PhysicianManagement from '../views/PhysicianManagement.vue'
import AddParticipant from '../views/AddParticipant.vue'
import AddPhysician from '../views/AddPhysician.vue'
import DataDownload from '../views/DataDownload.vue'
import UserSettings from '../views/UserSettings.vue'


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
        name: 'TitrateView',
        component: TitrateView
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
        path: '/user-management',
        name: 'ParticipantManagement',
        component: ParticipantManagement
    },
    {
        path: '/physician-management',
        name: 'PhysicianManagement',
        component: PhysicianManagement
    },
    {
        path: '/add-user',
        name: 'AddParticipant',
        component: AddParticipant
    },
    {
        path: '/add-physician',
        name: 'AddPhysician',
        component: AddPhysician
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