import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import http from '@utils/http';


export const useAttendanceStore = defineStore('Attendance', () => {

  async function test(){
    console.log({http});
  }  
  
  
 
  
  return {    
    test,    
  }
})