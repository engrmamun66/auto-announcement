const setToken = async (request) => {
  const rentmy_customer =  window.RENTMY_GLOBAL.rentmy_customer_info;
  const locationId = RENTMY_GLOBAL.locationId
  if(locationId) {
    request.headers.Location = locationId
  }  
  if(rentmy_customer?.token) { 
    request.headers.Authorization = 'Bearer ' + rentmy_customer.token
  }
  if(request.url == window.RENTMY_GLOBAL.ajax_url || request.formData === true){
    request.headers = { ...request.headers, ...{ "Content-Type": "multipart/form-data" }}
  }
  return request;
};

export default setToken;