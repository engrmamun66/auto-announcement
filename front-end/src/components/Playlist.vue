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
  const stop_clear_and_reload = inject('stop_clear_and_reload');
  const currentItem = ref(null);
  const audio = ref(null);

  watch(currentItem, (a, b)=>{
    storage('currentItem').value = a
  })
  
 
  function findNextItem() {
    return wattingList.value.find((item) => !item.is_called);
  }
  
 
  function playNext() {

    callbacks.clearWattingList(1)


    if (currentItem.value) {
      currentItem.value.is_called = true; 
      wattingList.value.forEach(item => {
        if(item.id === currentItem.value.id){
            item.is_called = true;
            item['call_exact_time'] = helper.miliseconds()
        }
      })
      storage('wattingList').value = wattingList.value
    }
  
    const nextItem = findNextItem();
    console.log({nextItem});
  
    if (nextItem) {
      currentItem.value = nextItem;
      const soundSrc = nextItem[nextItem['soundColName'] || 'sound1'];
      if(soundSrc){
          audio.value.src = soundSrc;
          audio.value.play();
      }
    } else {
      currentItem.value = null;  
    }
  }
  
  watch(wattingList, () => {
    playNext();
  });
  

  onMounted(() => {
      console.log('playlist mounted');
      playNext()

      emitter.on('pushed_a_student', ()=>{
        console.log('asd pushed');
        playNext()
      })
  })
  </script>
   