<template>
    <div>    
      <audio ref="audio" @ended="playNext"></audio>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, inject, onMounted } from 'vue';
  
  
  // Refs and state
  const helper = inject('helper');
  const emitter = inject('emitter');
  const storage = inject('storage');
  const wattingList = inject('wattingList');
  const callbacks = inject('callbacks');
  const user_interacted = inject('user_interacted');
  const currentItem = ref(null);
  const audio = ref(null);
  const is__playing = ref(false);

  watch(currentItem, (a, b)=>{
    storage('currentItem').value = a
  })
  
 
  function findNextItem() {
    return wattingList.value.find((item) => {
      let ms = helper.miliseconds()
      let {start_ms, end_ms} = item
      return (!item.is_called && ((ms >= start_ms && ms <= end_ms) || item['emergency_mode'] === true))
    });
  }
  
 
  function playNext() {

    if(!user_interacted.value){
      // console.log('user is not interacted');
      return
    }

    is__playing.value = false

    callbacks.clearWattingList()


    if (currentItem.value) {
      currentItem.value.is_called = true; 
      wattingList.value.forEach(item => {
        if(item.id === currentItem.value.id){
            item.is_called = true; 
        }
      })
      storage('wattingList').value = wattingList.value
    }
  
    const nextItem = findNextItem();
    // if(nextItem) console.log({nextItem});
  
    if (nextItem) {
      currentItem.value = nextItem;
      const soundSrc = nextItem[nextItem['soundColName'] || 'sound1'];
      if(soundSrc){
          audio.value.src = soundSrc;
          audio.value.play();
          is__playing.value = true
      }
    } else {
      currentItem.value = null;  
    }
  }
  
 

  onMounted(() => {
    console.log('playlist mounted');
    playNext()

    emitter.on('pushed_a_student__or__rechecktoPlay', ()=>{
        if(is__playing.value == false){
          playNext()          
        }
        console.log('watching playlist...');
      })
  })
  </script>
   