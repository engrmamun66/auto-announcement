import Axios from 'axios';
import * as auth from './interceptors/authencation.interceptor';

/* -------------------------------------------------------------------------- */
/*                            Common Authentication                           */
/* -------------------------------------------------------------------------- */
const http = Axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'content-type': 'application/json'
    }
});
http.interceptors.request.use(auth.setToken);
export default http;