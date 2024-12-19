import HomeView from '../pages/home.vue'
import ErrorView from '../pages/error.vue'

const routes = [ 
    {
        path: "/",
        name: 'home',
        component: HomeView,         
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
