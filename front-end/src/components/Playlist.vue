<template>
    <div>    
      <audio ref="audio" @ended="playNext" @pause="onPaused()"></audio>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, inject, onMounted } from 'vue';
  
  
  // Refs and state
  const log = console.log
  const helper = inject('helper');
  const emitter = inject('emitter');
  const storage = inject('storage');
  const wattingList = inject('wattingList');
  const callbacks = inject('callbacks');
  const user_interacted = inject('user_interacted');
  const CONFIG = inject('CONFIG');
  const controlSounds = inject('controlSounds');
  const currentItem = ref(null);
  const audio = ref(null);
  const is__playing = ref(false);
  let play_end_timeout = null;

  watch(currentItem, (newData, b)=>{
    storage('currentItem').value = newData
    clearTimeout(play_end_timeout)
    controlSounds({student: newData}) 
  })

  function onPaused(){
      let openAll = CONFIG.value?.settings?.with_speaker_controls?.onPause_openAll_speakers
      if(openAll){
          controlSounds({openAll: true})
      }
  }
  
 
  function findNextItem() {
    return wattingList.value.find((item) => {
      let ms = helper.miliseconds()
      let {start_ms, end_ms} = item
      return (!item.is_called && ((ms >= start_ms && ms <= end_ms) || item['emergency_mode'] === true))
    });
  }
  
 
  async function playNext() {

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
      clearTimeout(play_end_timeout)
      play_end_timeout = setTimeout(() => {
        alert('No more students in the waiting list.');
        controlSounds({openAll: true})
      }, 3000);
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

  defineExpose({
    audio,
    currentItem,
  })
  </script>
   