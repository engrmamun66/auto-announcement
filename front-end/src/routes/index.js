import { createRouter, createWebHashHistory } from "vue-router";
import helper from "../utilities/helper";
let version = helper.localStorage('version').value

import v_1_0_0 from "./v-1.0.0";
import v_2_0_0 from "./v-2.0.0";

let routes;

switch (version) {
    case 'v-1.0.0':
        routes = v_1_0_0
        break;
    case 'v-2.0.0':
        routes = v_2_0_0
        break;

    default:
        routes = v_1_0_0
        break;
}


export const router = createRouter({
    routes,
    history: createWebHashHistory(),
});
 
router.beforeEach((to, from, next) => {
    next();
});
 
