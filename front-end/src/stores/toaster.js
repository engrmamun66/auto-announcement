import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

export const useToaster = defineStore('toaster', () => {

  const state = reactive({
    messages: [
      // {type: 'success', message: 'Hello world'},
      // {type: 'warning', message: 'Hello world'},
      // {type: 'error', message: 'Hello world'},
    ],
  })

  function addToasterMessage(message, type='success', time=4000){
    if(message && message?.length){
      state.messages.unshift({type, message})
      setTimeout(() => {
        let index = state.messages?.findIndex(msg => msg.message == message.message)
        try {
          state.messages?.splice(index, 1)
        } catch (error) {}
      }, time);
    }
  }

  function success(message, time=4000){
    addToasterMessage(message, 'success', time)
  }

  function warning(message, time=4000){
    addToasterMessage(message, 'warning', time)
  }

  function error(message, time=4000){
    addToasterMessage(message, 'error', time)
  }

  function remove(message){
    let index = state.messages?.findIndex(msg => msg.message == message.message)
    state.messages?.splice(index, 1)
  }
  
  return {
    ...state,
    success,
    warning,
    error,
    remove,
  }
})