import Axios from 'axios';
import emitter from '../emitter';

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

function normalizeBanglaDigits(value) {
    return String(value).replace(/[০-৯]/g, (digit) => {
        return String('০১২৩৪৫৬৭৮৯'.indexOf(digit))
    })
}

function normalizeQueryParams(value) {
    if (Array.isArray(value)) {
        return value.map(normalizeQueryParams)
    }
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        return Object.fromEntries(
            Object.entries(value).map(([key, innerValue]) => [key, normalizeQueryParams(innerValue)])
        )
    }
    if (typeof value === 'string') {
        return normalizeBanglaDigits(value)
    }
    return value
}

http.interceptors.request.use((config) => {
    if(config.formData === true){
        config.headers = { ...config.headers, ...{ "Content-Type": "multipart/form-data" }}
    }
    if (config.params) {
        config.params = normalizeQueryParams(config.params)
    }
    return config
});

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && error.config?.url !== '/login') {
            emitter.emit('auth-required')
        }
        return Promise.reject(error)
    }
);

export default http
