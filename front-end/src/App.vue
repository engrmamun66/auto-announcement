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
 
let is_started_schedule = ref(0) 
let schedule_timeout = ref(0) 
let classes = ref([]);
let wattingList = ref([])
let punch_schedules = ref([])
let call_schedules = ref([]) 
let toggleSettings = ref(true) 
let refreshDOM = ref(true) 
let isMounted = ref(false)
let user_interacted = ref(false)
let emergency_mode = ref(false)
 
provide('route', route)
provide('router', router)
provide('is_started_schedule', is_started_schedule)
provide('schedule_timeout', schedule_timeout)
provide('classes', classes)
provide('wattingList', wattingList)
provide('getSchedules', getSchedules)
provide('speakText', speakText)
provide('getSchedules', getSchedules)
provide('punch_schedules', punch_schedules)
provide('call_schedules', call_schedules) 
provide('toggleSettings', toggleSettings) 
provide('refreshDOM', refreshDOM) 
provide('user_interacted', user_interacted) 
provide('emergency_mode', emergency_mode) 


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
    clearWattingList(){ 

        if(!wattingList.value?.length ) return        
        
        let newWaittinglist = wattingList.value.filter(item => {
            if(item.is_called){
                let ms = helper.miliseconds()
                let { end_ms } = item  
                if(ms > (end_ms)){
                    return false // times up
                } else {
                    return true
                }                
            }
            return true;
        })

        wattingList.value = newWaittinglist
        storage('wattingList').value = newWaittinglist 
    }
}
provide('callbacks', callbacks) 
 
  
function focusBarcodeInput__and__startAnnoucement(){
    callbacks.clearWattingList()
    if(is_started_schedule.value){
        let inputEl = document.getElementById('BARCODE_INPUT')
        if(inputEl) inputEl.focus()
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

 
  
watch(is_started_schedule, (a, b) => {
    storage('is_started_schedule').value = a 
}) 
  
watch(emergency_mode, (a, b) => {
    storage('emergency_mode').value = a 
}) 


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
        user_interacted.value = true;  
        document.body.classList.add('user-interacted')
    })
    clearTimeout(schedule_timeout.value)
    classes.value = storage('classes').value || classes.value
    wattingList.value = storage('wattingList').value || wattingList.value 
    is_started_schedule.value = storage('is_started_schedule').value || is_started_schedule.value 
    emergency_mode.value = Boolean(storage('emergency_mode').value)
 

    setTimeout(() => {
        setInterval(()=>{
            focusBarcodeInput__and__startAnnoucement()
            refreshDOM.value = false
            emitter.emit('pushed_a_student__or__rechecktoPlay', true)
            setTimeout(()=>refreshDOM.value = true, 0)
        }, 1000);
    }, 100);

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
        <Playlist></Playlist> 
    </div>
    
</template>
 
