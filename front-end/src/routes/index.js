import { createRouter, createWebHashHistory } from "vue-router";

import routes from "./routes"; 

export const router = createRouter({
    routes,
    history: createWebHashHistory(),
});
 
router.beforeEach((to, from, next) => {
    next();
});
 
