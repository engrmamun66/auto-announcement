import HomeView from '../pages/home.vue'
import StudentsView from '../pages/students.vue'
import ImportView from '../pages/Import.vue'
import SchedulesView from '../pages/shedules.vue'
import AttendenceView from '../pages/attendence.vue'
import ContactUsView from '../pages/contactus.vue'
import ErrorView from '../pages/error.vue'
import EnvView from '../pages/env.vue'
import DevicesView from '../pages/Devices.vue'

const routes = [ 
    {
        path: "/",
        name: 'home',
        component: HomeView,
    },
    {
        path: "/students",
        name: 'students',
        component: StudentsView,
    },
    {
        path: "/attendence",
        name: 'attendence',
        component: AttendenceView,
    },
    {
        path: "/shedules",
        name: 'shedules',
        component: SchedulesView,
    },
    {
        path: "/contactus",
        name: 'ContactUs',
        component: ContactUsView,
    },
    {
        path: "/import",
        name: 'import',
        component: ImportView,
    },
    {
        path: "/env",
        name: 'env',
        component: EnvView,
    },
    {
        path: "/devices",
        name: 'devices',
        component: DevicesView,
    },
    {
        path: "/*",
        name: 'error',
        component: ErrorView
    },
    // Catch-all route for 404 errors
    { 
        path: '/:pathMatch(.*)*',
        name: 'NotFound', 
        component: ErrorView,
    },
];

export default routes;
