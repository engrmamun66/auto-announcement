import HomeView from '../pages/home.vue'
import StudentsView from '../pages/students.vue'
import ImportView from '../pages/Import.vue'
import ErrorView from '../pages/error.vue'

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
        path: "/import",
        name: 'import',
        component: ImportView,         
    },
    {
        path: "/*",
        name: 'error',
        component: ErrorView,
    },
    // Catch-all route for 404 errors
    { 
        path: '/:pathMatch(.*)*',
        name: 'NotFound', 
        component: ErrorView
    },
];

export default routes;
