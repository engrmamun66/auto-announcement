<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
import Toaster from './components/Toaster.vue'
const emitter = inject('emitter');
import moment from 'moment/moment'
import Playlist from './components/Playlist.vue'


let helper = inject('helper')
let http = inject('http')
let storage = inject('storage')
let route = useRoute();
let router = useRouter();  

let schedule_start_time = ref(null) // will set always 25 hours format > example: 13:20
let is_started_schedule = ref(0) 
let schedule_timeout = ref(0) 
let play_in_playlist = ref(false) 
provide('schedule_start_time', schedule_start_time)
provide('is_started_schedule', is_started_schedule)
provide('schedule_timeout', schedule_timeout)


let classes = ref([]);


provide('classes', classes)


watch(schedule_start_time, (a, b)=>{
    storage('schedule_start_time').value = a;
})

 

// item['soundColName']  will be play
let wattingList = ref([])


provide('wattingList', wattingList)


function focusBarcodeInput__and__startAnnoucement(){
    if(is_started_schedule.value){
        let inputEl = document.getElementById('BARCODE_INPUT')
        if(inputEl) inputEl.focus()

        // check annoucement list
    }
}

function checkAndStartAnnouncement(){
    if(schedule_start_time.value){

        let delay_time = helper.time_in_miliseconds(schedule_start_time.value /* time_24 format */)

        console.log('setTimeout For', {miliSecond: delay_time, second: delay_time / 1000});

        schedule_timeout.value = setTimeout(() => {
            play_in_playlist.value = true;

        }, delay_time);

        // strting annouchment, instantly or delay
    } 
}


function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(voice => /male/i.test(voice.name)) || voices[0];
  if (maleVoice) utterance.voice = maleVoice;
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

provide('speakText', speakText)


let tout = null
watch(is_started_schedule, (a, b) => {
    clearTimeout(tout)
    tout = setTimeout(() => {
        checkAndStartAnnouncement()
    }, 1000);
})
 

 // Initial play when the component mounts
 let isMounted = ref(false)
 let user_interacted = ref(false)


function stop_clear_and_reload(){
    wattingList.value = []
    storage('wattingList').value = []
    is_started_schedule.value = false
    classes.value.forEach(c => c.isActive = true)
    storage('classes').value = classes.value
    schedule_start_time.value = ''
    storage('schedule_start_time').value = ''
    window.location.reload()
}
provide('stop_clear_and_reload', stop_clear_and_reload)

onMounted(async ()=>{ 

    try {
        let response = await http.get('/config')
        if(response.status == 200){
            classes.value = response.data.classes
        }
    } catch (error) {
        
    }
    document.addEventListener('click', () => {
        if(user_interacted.value) return;
        user_interacted.value = true;  
    })
    clearTimeout(schedule_timeout.value)
    classes.value = storage('classes').value || classes.value
    wattingList.value = storage('wattingList').value || wattingList.value
    schedule_start_time.value = storage('schedule_start_time').value || schedule_start_time.value

    checkAndStartAnnouncement()

    if(schedule_start_time.value){
        is_started_schedule.value = 1
    }
    

    setInterval(focusBarcodeInput__and__startAnnoucement, 1000);

    isMounted.value = true;
})

</script>

<template>
    <!-- <SideBar>
        <routerView />
    </SideBar> -->
    <Toaster></Toaster>
    <TopNav></TopNav>
    <div v-if="isMounted" class="page-contents" >
        <routerView />
        <Playlist v-if="play_in_playlist && user_interacted"></Playlist>
    </div>
    
</template>

<style scoped>
.page-contents{
    height: auto;
    margin: 0px;
    padding: 20px;
    min-height: max-content;
    background: url(/src/assets/img/sound.png);
    background-position: 60% -30%;
    background-size: cover;
    background-repeat: repeat-y;
}
</style>

