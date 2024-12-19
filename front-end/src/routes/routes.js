import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from '../pages/v-1.0.0/home.vue'
 

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
