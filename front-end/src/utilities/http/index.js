import Axios from 'axios';

/* -------------------------------------------------------------------------- */
/*                            Common Authentication                           */
/* -------------------------------------------------------------------------- */
const http = Axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'content-type': 'application/json'
    }
});
http.interceptors.request.use((config) => {
    if(config.formData === true){
        config.headers = { ...config.headers, ...{ "Content-Type": "multipart/form-data" }}
    }
});
export default http