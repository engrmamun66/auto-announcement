import { createRouter, createWebHashHistory } from "vue-router";
import helper from "../utilities/helper";

import routes from "./routes"; 

export const router = createRouter({
    routes,
    history: createWebHashHistory(),
});
 
router.beforeEach((to, from, next) => {
    next();
});
 
