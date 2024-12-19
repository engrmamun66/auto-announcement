import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from '../pages/v-1.0.0/home.vue'
import ContactView from '../pages/v-1.0.0/options.vue'
import PersonView from '../pages/v-1.0.0/contact-child/person.vue'
import CompanyView from '../pages/v-1.0.0/contact-child/company.vue'

import ErrorView from '../pages/error.vue'

const routes = [ 
    {
        path: "/:version/home",
        name: 'home',
        component: HomeView,         
    },
    {
        path: "/:version/contact",
        name: 'contact',
        component: ContactView
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
