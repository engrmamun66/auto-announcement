import Axios from 'axios';
import * as auth from './interceptors/authencation.interceptor';
import customerInterceptor from './interceptors/customer.auth.interceptor';

/* -------------------------------------------------------------------------- */
/*                            Common Authentication                           */
/* -------------------------------------------------------------------------- */
const http = Axios.create({
    baseURL: RENTMY_GLOBAL?.env?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    headers: {
        'content-type': 'application/json'
    }
});
http.interceptors.request.use(auth.setToken);
export default http;


/* -------------------------------------------------------------------------- */
/*                       authencation for login customer                      */
/* -------------------------------------------------------------------------- */
const httpAuth = Axios.create({
    baseURL: RENTMY_GLOBAL?.env?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    headers: {
        'content-type': 'application/json'
    }
});
httpAuth.interceptors.request.use(customerInterceptor);
export { httpAuth };