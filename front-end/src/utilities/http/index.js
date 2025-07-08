import Axios from 'axios';

/* -------------------------------------------------------------------------- */
/*                            Common Authentication                           */
/* -------------------------------------------------------------------------- */

if(globalThis.GLOBAL_DATA?.env && typeof globalThis.GLOBAL_DATA?.env === 'string'){
    globalThis.GLOBAL_DATA.env = JSON.parse(globalThis.GLOBAL_DATA?.env)
}
 

const http = Axios.create({
    // baseURL: import.meta.env.API_BASE_URL,
    baseURL: globalThis.GLOBAL_DATA?.env.API_BASE_URL,
    headers: {
        'content-type': 'application/json'
    }
});
http.interceptors.request.use((config) => {
    if(config.formData === true){
        config.headers = { ...config.headers, ...{ "Content-Type": "multipart/form-data" }}
    }
    return config
});
export default http