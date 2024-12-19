import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import http from '@utils/http';
import { isJson, formatTag } from '@utils/functions';

export const useGlobalStore = defineStore('global', () => {

  const state = reactive({
    contsettingsents: null,
    contents: null,
    countries: null,
    currency_config: null,
    categories: null,
    tags: null,
    storeAndLocations: null,
    deliverySettings: null,
    relatedProducts: null,
    priceValue: null,
    customFields: null,
    locationList: null,
  })

  const contents = computed(() => state.contents);
  const countries = computed(() => state.countries);
  const currency_config = computed(() => state.currency_config);
  const categories = computed(() => state.categories);
  const tags = computed(() => state.tags);
  const storeAndLocations = computed(() => state.storeAndLocations);
  const deliverySettings = computed(() => state.deliverySettings);
  const relatedProducts = computed(() => state.relatedProducts);
  const priceValue = computed(() => state.priceValue);
  const customFields = computed(() => state.customFields);
  const locationList = computed(() => state.locationList);
  

  async function getStoreAndLocations() {
    const processResponse = (response) => {
      let result = response?.data?.result;
      localStorage.setItem('online_store', JSON.stringify(result));
      sessionStorage.setItem('online_store', JSON.stringify(result));
      state.storeAndLocations = result;
      if(result?.locations?.length){
        if(!RENTMY_GLOBAL.locationId){
          RENTMY_GLOBAL.locationId = result?.location?.id;
        }
        let location = result?.location;
        // let locationIndex = result?.locations?.filter(location => location.id == RENTMY_GLOBAL.locationId)?.[0];
        // if(locationIndex > -1){
        //   location = result?.locations[locationIndex];
        // }
        
        if(location){
          const existingLoc = localStorage.getItem('current_location');
          if(!existingLoc){            
            localStorage.setItem('current_location', JSON.stringify(location));
            localStorage.setItem('current_location_id', location.id);
            RENTMY_GLOBAL.locationId = location.id
          } else {
            const savedLocation = JSON.parse(existingLoc);
            const savedLocationIsFoundInLocations = result?.locations.findIndex(loc => loc.id == savedLocation.id) > -1;
            if(savedLocationIsFoundInLocations){
              // when saved data is ok and 'containing' with "savedLocation.id"
              RENTMY_GLOBAL.locationId = location.id = Number(savedLocation.id);
            } else {
              // if "savedLocation.id" not containing in "result?.locations"             
              localStorage.setItem('current_location', JSON.stringify(location));
              localStorage.setItem('current_location_id', location.id);
              RENTMY_GLOBAL.locationId = location.id
            }

          }
        }
      }
      return result;
    }

    const { store_name } = RENTMY_GLOBAL;
    try {      
        const response = await http.get(`/get-settings?store_name=${store_name}&location=${RENTMY_GLOBAL.locationId}`);
        return processResponse(response);          
    } catch(error) {
      console.log('getStoreAndLocations::', error);
    }
  }

  async function getContents(){
    const processResponse = (response) => {
      let result = response?.data?.result;
      const content = {};
      const data = result?.data.filter(f => {
        return f["config"].status === 1;
      });

      for (const c of data) {
        const tag = formatTag(c.config.tag);
        content[tag] = isJson(c.contents)
          ? JSON.parse(c.contents)
          : c.contents;
      }
      localStorage.setItem('rentmy_contents', JSON.stringify(content));
      state.contents = content;
      return content;
    }    
    const response = await http.get('/contents');
    return processResponse(response);    
  }  
  
  async function getCountries(){
    const processResponse = (response) => {
      let result = response?.data?.result?.data;
      localStorage.setItem('rentmy_countries', JSON.stringify(result));
      state.countries = result;
      return result;
    }
    if(!localStorage.getItem('rentmy_countries')){
      const response = await http.get('/countries');
      return processResponse(response);
    } else {
      http.get('/countries').then(response => processResponse(response))
      state.countries = JSON.parse(localStorage.getItem('rentmy_countries'));
      return state.countries;
    }
  }

 

  async function getCurrencyConfig() {
    const processResponse = (response) => {
      let result = response?.data?.result?.data; 
      localStorage.setItem('rentmy_currency_config', JSON.stringify(result));
      state.currency_config = result;
      return result;
    }

    if(!localStorage.getItem('rentmy_currency_config')){
      const response = await http.get('/currency-config');
      return processResponse(response);
    } else {
      http.get('/currency-config').then(response => processResponse(response));
      state.currency_config = JSON.parse(localStorage.getItem('rentmy_currency_config'));
      return state.currency_config;
    }    
  }

  async function getCategories() {  
    const response = await http.get('/categories');
    let result = response?.data?.result?.data; 
    state.categories = result;
    return result;  
  }

  async function getTags() {  
    const response = await http.get('/tags');
    let result = response?.data?.result?.data; 
    state.tags = result;
    return result;
  }
  
  async function getDeliverySettings() {
    const response = await http.get(`/stores/delivery-settings`);
    let result = response?.data?.result?.delivery_settings;
    sessionStorage.setItem('deliverySettings',JSON.stringify(result));
    state.deliverySettings = result;
    return result;
  }
  
  async function getRelatedProducts(product_id) {
    const response = await http.get(`/products/${product_id}/user/related-products`);
    let result = response?.data?.result?.data; 
    state.relatedProducts = result;
    return result;
  }  
  
  async function getPriceValue(payload) {
    const response = await http.post(`/get-price-value`, payload);
    let result = response?.data?.result?.data; 
    state.priceValue = result;
    return result;
  }
  
  async function getCustomFields(product_id=null) {
    const response = await http.get(`/products/custom-fields/values/${product_id}`);
    let result = response?.data?.result?.data; 
    state.customFields = result;
    return result;
  }

  async function getCheckoutCustomFields(product_id=null) {
    const response = await http.get(`/products/custom-fields/values/${product_id}`);
    let result = response?.data?.result?.data; 
    state.checkoutCustomFields = result;
    return result;
  }
  
  async function getLocationList() {
    const response = await http.get(`/locations/list`);
    let result = response?.data?.result?.data; 
    state.locationList = result;
    return result;
  }
 
  
  return {
    /**variables */
    contents,
    countries,
    storeAndLocations,
    currency_config,
    categories,
    tags,
    deliverySettings,
    relatedProducts,
    priceValue,
    customFields,
    locationList,

    /**Functions */
    getContents,
    getCountries,
    getCheckoutCustomFields,
    getCurrencyConfig,
    getCategories,
    getTags,
    getStoreAndLocations,
    getDeliverySettings,
    getRelatedProducts,
    getPriceValue,
    getCustomFields,
    getLocationList,
  }
})