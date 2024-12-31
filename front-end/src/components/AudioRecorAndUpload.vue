<template>
    <div>
        <!-- <button @click="startRecording" :disabled="isRecording">Start Recording</button>
        <button @click="stopRecording" :disabled="!isRecording">Stop Recording</button>
        <button @click="uploadNow" :disabled="!audioBlob">Send to API</button> -->
    
        <audio v-if="audioUrl" ref="audioPlayer" v-show="false" :src="audioUrl" controls></audio>

        <div class="container">
            <div class="player">
                <div class="header-player">
                    <div class="audio-record">
                        <input type="checkbox" :checked="isRecording">
                        <label @click="startRecording" for="audio_record-icon" class="player-icon audio_record-icon">
                            <i class='bx bxs-microphone' ></i>
                        </label>
                    </div>
                    <div class="audio-properties">
                        <!-- <div class="audio-name">01 - 21052018-0900</div> -->
                        <div class="player-bar">
                            <div class="current-time" id="current_time">
                                {{ timeparts.hour }}:{{ timeparts.minute }}:{{ timeparts.second }}
                            </div>
                            <template v-if="isRecording">
                                <span class="size-08 ms-1 d-flex justify-content-around border radius-10 px-2 text-black-75 ttr" style="width: 70px;">
                                    <RecoringAnimation style="zoom:0.4" ></RecoringAnimation> 
                                    <i class='bx bx-dots-horizontal bx-flashing transformY-5px text-white' ></i>
                                </span>   
                                <Btn  @click="stopRecording" class="sm red ms-2">STOP</Btn>
                            </template>
                            <template v-else-if="audioBlob">
                                <Btn @click.stop="uploadNow" class="sm ms-2">
                                  <BtnLoader v-if="loading"></BtnLoader>
                                  <i v-else class='bx bxs-cloud-upload size-1p2 transformY-4px' ></i>
                                   UPLOAD </Btn> 
                                
                                <i v-if="!isPlaying" @click.stop="play()" class='bx bx-play-circle bx-flashing ms-3 size-1p3 cp' ></i>
                                <i v-else @click.stop="stop()" class='bx bx-stop-circle bx-flashing- ms-3 size-1p3 cp' ></i>
                                <i @click.stop="resetPlayer()" class='bx bxs-trash-alt ms-3 text-danger size-1p1 cp' ></i>
                            </template>
                            <template v-else>
                                <span @click="startRecording" class="size-08 ms-1 d-flex border2 radius-10 px-2 ms-4 text-black-75 cp ttr">
                                    Click To Start Recording
                                </span> 
                            </template>                            
                        </div>
                        
                    </div>                
                </div>                
            </div>
        </div>
 
    </div>
  </template>
  
  <script setup>
  import { computed, inject, ref, watch } from 'vue'
  import RecordRTC from 'recordrtc'
  let audioPlayer = ref(null)
  import Btn from './Btn.vue'
  import BtnLoader from './BtnLoader.vue'
  import RecoringAnimation from './RecoringAnimation.vue'

  let props = defineProps(['student', 'column'])
  
  // Refs to store recording state and data
  const isRecording = ref(false)
  const audioBlob = ref(null)
  const audioUrl = ref(null)

  let http = inject('http')
  let emits = defineEmits(['uploaded'])
  let emitter = inject('emitter')

  let interVal = null
  let seconds = ref(0)

  let timeparts = computed(() => {
    return ({
        hour: String(Math.floor((seconds.value / 60) / 60)).padStart(2, 0),
        minute: String(Math.floor(seconds.value / 60)).padStart(2, 0),
        second: String(seconds.value % 60).padStart(2, 0),
    })
  })

  watch(isRecording, (a, b)=>{
    if(a){
        interVal = setInterval(() => {
            seconds.value += 1;
        }, 1000);
    } else {
        clearInterval(interVal)
    }
  })

  
  let recorder = null
  
  // Start recording
  const startRecording = () => {
    isRecording.value = true
  
    // Start the recording
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        recorder = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/wav'
        })
        recorder.startRecording()
      })
      .catch(err => {
        console.error('Error accessing microphone:', err)
        isRecording.value = false
      })
  }
  
  // Stop recording
  const stopRecording = () => {
    if (recorder) {
      recorder.stopRecording(() => {
        audioBlob.value = recorder.getBlob()
        audioUrl.value = URL.createObjectURL(audioBlob.value)
        isRecording.value = false
      })
    }
  }

  let isPlaying = ref(false);

  function resetPlayer () {
    audioBlob.value = null
    audioUrl.value = null
    isRecording.value = false
    seconds.value = 0
    isPlaying.value = false
  }


  function play () {
    audioPlayer.value.play();
    isPlaying.value = true;

    audioPlayer.value.onended = () => {
      isPlaying.value = false
    }
  }

  function stop () { 
    if (audioPlayer.value && isPlaying.value) {
      audioPlayer.value.pause() 
      audioPlayer.value.currentTime = 0 
      isPlaying.value = false
    }
  }
  
  
let loading = ref(false)
async function uploadNow(){
  let { id } = props.student
   
  loading.value = true
  http.post('/students/upload-audio', {id, file: audioBlob.value, column: props.column}, {formData: true}).then(response => {
    
    setTimeout(() => { 
      resetPlayer()
      emits('uploaded', response.data)
    }, 600); 
    
    
  }).finally(()=>{
    setTimeout(() => {
      resetPlayer()
    }, 600); 
  }) 
}

  </script>
  

<style scoped>


.player-icon {
  color: #373737;
  margin-right: 5px;
}
.player-icon:hover {
  color: #000;
}

.ttr{
  background: var(--grad1);
  padding: 5px 3px;
  color: #1d1d1dc5;
  border-radius: 15px;
}

.container {
    background: var(--grad2);
    width: 340px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    background-color: rgba(255, 255, 255, 0.327);
    border-radius: 10px;
}

.audio-name {
  font-size: 10px;
  font-weight: regular;
}

.header-player {
  width: 100%;
  padding: 10px;
  display: grid;
  grid-template-columns: 60px auto;
}
.header-player .audio-record {
  display: flex;
  align-items: center;
}
.header-player .audio-record i {
  color: var(--primaryColor);
  font-size: 40px;
  cursor: pointer;
  padding: 1px;
}
.header-player .audio-record input[type=checkbox] {
  position: absolute;
  visibility: hidden;
}
.header-player .audio-record input[type=checkbox]:checked ~ label i {
  color: #fff;
  background: var(--primaryColor);
  border-radius: 100%;
  animation: shadow-expansion 0.9s ease-in-out infinite alternate;
}
.header-player .audio-properties .audio_record-control {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}
.header-player .audio-properties .audio_record-control  i {
    font-size: 20px;
}
.header-player .switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 14px;
  float: right;
}
.header-player .switch label {
  font-size: 12px;
  font-weight: regular;
  float: left;
}
.header-player .switch input {
  display: none;
}
.header-player .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(34, 31, 31, 0.26);
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 20px;
}
.header-player .slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: -2px;
  bottom: -2.5px;
  background-color: #f1f1f1;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 100%;
  box-shadow: 0px 2px 2px rgba(51, 51, 51, 0.24);
}
.header-player input:checked + .slider {
  background-color: #b988ff;
}
.header-player input:checked + .slider::before {
  background-color: #6200ee;
}
.header-player input:focus + .slider {
  box-shadow: 0 0 1px #6200ee;
}
.header-player input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}
.header-player .player-bar {
  font-size: 14px;
  font-weight: bold;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  margin: 10px 0;
  align-items: center;
}

@keyframes shadow-expansion {
  from {
    box-shadow: 0 0 0 5px var(--primaryColor);
  }
  to {
    box-shadow: 0 0 0 0 var(--primaryColor);
  }
}
.by {
  font-family: sans-serif;
  position: fixed;
  bottom: 20px;
  text-align: center;
  width: 100%;
  font-size: 0.9em;
}
.by a {
  text-decoration: none;
  color: #6200ee;
  transition: all 0.5s;
}
.by a:hover {
  color: #4d00bb;
}

</style>