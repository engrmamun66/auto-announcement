import Axios from 'axios';

/* -------------------------------------------------------------------------- */
/*                            Common Authentication                           */
/* -------------------------------------------------------------------------- */

if(globalThis.GLOBAL_DATA?.env && typeof globalThis.GLOBAL_DATA?.env === 'string'){
    globalThis.GLOBAL_DATA.env = JSON.parse(globalThis.GLOBAL_DATA?.env)
}
 

let _apiBaseUrl = globalThis.GLOBAL_DATA?.env.API_BASE_URL || '/api'
if (typeof window !== 'undefined') {
    _apiBaseUrl = _apiBaseUrl
        .replace('localhost', window.location.hostname)
        .replace('127.0.0.1', window.location.hostname)
}

const http = Axios.create({
    baseURL: _apiBaseUrl,
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