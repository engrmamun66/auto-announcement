<template>
    <div>    
      <audio ref="audio" @ended="playNext" @pause="withInavtivity()"></audio>
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

  watch(currentItem, (newData, b)=>{
    storage('currentItem').value = newData 
    emitter.emit('palylist__currentItem', newData)
    if(CONFIG.value?.settings?.with_speaker_controls?.switch_mode === 'auto' && newData){
        controlSounds({student: newData}) 
    }
  })

  function withInavtivity(){
    let isManual = CONFIG.value?.settings?.with_speaker_controls?.switch_mode === 'manual'
    if(isManual) return
    let action = CONFIG.value?.settings?.with_speaker_controls?.on_inactivity_switches_mode
    if(action && action !== 'no_action'){
      if(action === 'open_all'){
        controlSounds({openAll: true})
      }
      else if(action === 'close_all'){
        controlSounds({ports: []} )
      }
      else if(Array.isArray(action) /** port array */){
        controlSounds({ports: action} )
      }
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
        let status = CONFIG.value?.settings?.with_speaker_controls?.status
        let delay_time = CONFIG.value?.settings?.with_speaker_controls?.delay_before_starting
        if(status && delay_time){
          setTimeout(() => {
            audio.value.src = soundSrc;
            audio.value.play();
            is__playing.value = true
          }, delay_time);

        } else {
          audio.value.src = soundSrc;
          audio.value.play();
          is__playing.value = true
        }
          
      }
    } else {
      currentItem.value = null; 
      withInavtivity()
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
   