const setToken = async (request) => {
  const access_token = window.RENTMY_GLOBAL?.access_token
  const locationId = RENTMY_GLOBAL.locationId
  if(locationId) {
    request.headers.Location = locationId
  }
  if(access_token) {
    request.headers.Authorization = 'Bearer ' + access_token
  }
  if(request.url == window.RENTMY_GLOBAL.ajax_url || request.formData === true){
    request.headers = { ...request.headers, ...{ "Content-Type": "multipart/form-data" }}
  }
  return request;
};

export {
  setToken
}