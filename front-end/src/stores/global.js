import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import http from '@utils/http';


export const useGlobalStore = defineStore('global', () => {

  const state = reactive({
    contents: null,
  })
  
  const contents = computed(() => state.contents);
  

  async function getContents(){
  }  
  
  
 
  
  return {
    contents,    
    getContents,    
  }
})