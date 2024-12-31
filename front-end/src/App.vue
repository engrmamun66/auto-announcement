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
let classes = ref([]);
let wattingList = ref([])
let punch_schedules = ref([])
let call_schedules = ref([]) 

provide('schedule_start_time', schedule_start_time)
provide('is_started_schedule', is_started_schedule)
provide('schedule_timeout', schedule_timeout)
provide('classes', classes)
provide('wattingList', wattingList)
provide('getSchedules', getSchedules)
provide('speakText', speakText)
provide('getSchedules', getSchedules)
provide('punch_schedules', punch_schedules)
provide('call_schedules', call_schedules) 


let callbacks = {
    isMatchedAnySchedule(class_short){
        let className = classes.value.find(c => c.class_short == class_short)?.class_name 
        if(!className) return false;

        let ms = helper.miliseconds()
        let founds = punch_schedules.value.filter(schedule => {
            let { start_ms, end_ms } = schedule 
            return (schedule.class_shorts.includes(class_short) && ms >= start_ms && ms <= end_ms) 
        })   
        return Boolean(founds.length)
    },
    running_punch_schedules(){        
      
        let ms = helper.miliseconds()
        let founds = punch_schedules.value.filter(schedule => {
            let { start_ms, end_ms } = schedule
            return (ms >= start_ms && ms <= end_ms)
        })       
        return founds
    },
    running_call_schedules(){        
      
        let ms = helper.miliseconds()
        let founds = call_schedules.value.filter(schedule => {
            let { start_ms, end_ms } = schedule
            return (ms >= start_ms && ms <= end_ms)
        })       
        return founds
    },
    incoming_punch_schedules(){        
      
        let ms = helper.miliseconds()
        let data = helper.clone(punch_schedules.value)
        data.forEach(schedule => {
            let { start_ms, end_ms } = schedule
            schedule['incoming_time'] = (ms < start_ms) ? start_ms - ms : -1
        })
        data.sort((a, b) => {
            return a['incoming_time'] - b['incoming_time']
        })    
        
        return data.filter(s => s.incoming_time != -1)
    },
    incoming_call_schedules(){        
      
        let ms = helper.miliseconds()
        let data = helper.clone(call_schedules.value)
        data.forEach(schedule => {
            let { start_ms } = schedule
            schedule['incoming_time'] = (ms < start_ms) ? start_ms - ms : -1
        })
        data.sort((a, b) => {
            return a['incoming_time'] - b['incoming_time']
        })    
        
        return data.filter(s => s.incoming_time != -1)
    },
    timesup_punch_schedules(){       
      
        let ms = helper.miliseconds()
        let data = (punch_schedules.value.filter(schedule => {
            let { end_ms } = schedule
            return ms > end_ms
        }))
        data.sort((a, b) => {
            return a.start_ms - b.start_ms
        })
        return data;
    },
    timesup_call_schedules(){       
      
        let ms = helper.miliseconds()
        let data =  (call_schedules.value.filter(schedule => {
            let { end_ms } = schedule
            return ms > end_ms
        }))
        data.sort((a, b) => {
            return a.start_ms - b.start_ms
        })
        return data;
    },
    clearWattingList(max_time_in_minute=30){
        let timesupCallSchedules = this.timesup_call_schedules() // sorted by 'start_ms'
        if(!wattingList.value?.length || !timesupCallSchedules.length) return
        
        let newWaittinglist = wattingList.value.filter(item => {
            if(item.is_called){
                console.log({item});
                let ms = helper.miliseconds()
                let max_ms = max_time_in_minute * 1000
                let puch_exact_time = item?.['puch_exact_time']
                let gap = ms - puch_exact_time

                if(!puch_exact_time) return false
                if(gap == 0) return true

                if(gap >= max_ms){
                    return false
                } else {
                    return true
                }

            }

            return true;
        })

        wattingList.value = newWaittinglist
        storage('wattingList').value = newWaittinglist



        // wattingList
    }
}
provide('callbacks', callbacks) 




watch(schedule_start_time, (a, b)=>{
    storage('schedule_start_time').value = a;
})

  
function focusBarcodeInput__and__startAnnoucement(){
    if(is_started_schedule.value){
        let inputEl = document.getElementById('BARCODE_INPUT')
        if(inputEl) inputEl.focus()
    }
}

function checkAndStartAnnouncement(){    
    if(is_started_schedule.value && callbacks.running_call_schedules().length){ 
        let [ firstSchedule ] = callbacks.running_call_schedules()

        let delay_time = helper.time_in_miliseconds(firstSchedule.start_time)

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




let tout = null
watch(is_started_schedule, (a, b) => {
    storage('is_started_schedule').value = a
    clearTimeout(tout)
    tout = setTimeout(() => {
        callbacks.clearWattingList(1)
        checkAndStartAnnouncement()
    }, 1000);
})
 

 // Initial play when the component mounts
 let isMounted = ref(false)
 let user_interacted = ref(false)


function stop_clear_and_reload(){
    wattingList.value = []
    storage('wattingList').value = []  
}
provide('stop_clear_and_reload', stop_clear_and_reload)


async function getSchedules(){
 
 try { 

   http.get('/schedules/list').then(response => {
     if(response.status == 200){
       let data = response.data.data
       data.forEach(item => {
         item.start_ms = helper.miliseconds(item.start_time)
         item.end_ms = helper.miliseconds(item.end_time) 
       })
       punch_schedules.value = data.filter(item => item.type == 1);              
       call_schedules.value = data.filter(item => item.type == 2);        
     }
   }).finally(()=>{
      
   })
   
 } catch (error) {
   console.warn('addSchedule__error::', error);
 }

}

onMounted(async ()=>{ 

    await getSchedules()

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
    is_started_schedule.value = storage('is_started_schedule').value || is_started_schedule.value 

    
    // checkAndStartAnnouncement() ----- automtically run from watch(is_started_schedule
  
 
    

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

