<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
import Toaster from './components/Toaster.vue'
const emitter = inject('emitter');
import moment from 'moment/moment'
import Playlist from './components/Playlist.vue'
import accessCheckAnimation from './components/accessCheckAnimation.vue'
import Lockscreen from './components/Lockscreen.vue'

const log = console.log


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
let LockscreenRef = ref(null)

let palylistComponent = ref(null)
provide('palylistComponent', palylistComponent)

let DEVICE_TOKEN = ref(null)
let all_students = ref([])


let checking_accessibility = ref(false)
let appAccessData = ref(storage('appAccessData').value) 



let showAccessibilityAlert = computed(() => {
    let { 
        last_paid_month, 
        permanently_active,
    } = appAccessData.value || {}

    if(!appAccessData.value || !last_paid_month){ 
        return false
    } 
    if(permanently_active) return false // if, permanently_active === true, warning never show

    const endOfPayMonth = moment(last_paid_month).endOf('month')
    
    let diff_day = moment().diff(endOfPayMonth, 'day')

    if(diff_day > 0){
        // Payment is due
        return true
    } else {
        return false
    } 
})

let appUseForbiddened = computed(() => { 
    let { 
        last_paid_month, 
        is_active, 
        stop_after_day,
        permanently_active,
    } = appAccessData.value || {}

    if(!appAccessData.value || !last_paid_month){ 
        return false
    } 
    if(permanently_active) return false 
    if(!is_active) return true 

    const endOfPayMonth = moment(last_paid_month).endOf('month')

    let diff_day = moment().diff(endOfPayMonth, 'day')
    if(diff_day > 0){
        // Payment is due
        stop_after_day = Math.abs(Number(stop_after_day))

        if(diff_day >= stop_after_day) return true
        else return false
    } else {
        return false
    }
})

let getWarningMessage = computed(()=>{
    let { 
        warning_message,
        last_paid_month,
        stop_after_day,
    } = appAccessData.value || {}

    const afterPaymonth = moment(last_paid_month).add(1, 'month').format('MMMM')
 
    let stopAfter = moment(last_paid_month).endOf('month').add(stop_after_day + 1, 'day')
    let left_days = stopAfter.diff(moment(), 'day') 

     


    if(warning_message.startsWith('format_1::')){
        warning_message = warning_message.replace(/format_1::\s?/g, '')
        warning_message = warning_message.replace('{{month}}', afterPaymonth)
        warning_message = warning_message.replace('{{date}}', stopAfter.format('DD MMMM')) 
        warning_message = warning_message.replace('{{left_days}}', left_days) 
    }

    return helper.enToBnDate(warning_message)
})


let getForbiddenedMessage = computed(()=>{
    let { 
        last_paid_month,
        stopped_message,
    } = appAccessData.value || {}

    if(stopped_message.startsWith('format_1::')){
        stopped_message = stopped_message.replace(/format_1::\s?/g, '') 
        stopped_message = stopped_message.replace('{{month}}', moment(last_paid_month)?.endOf('month').format('MMMM'))
    }

    return helper.enToBnDate(stopped_message)
})

async function CheckAccess(loader=false){
 
 try { 
    if(checking_accessibility.value) return
    if(loader) checking_accessibility.value = true; 
    const devMode = window.location.href.indexOf('dev=true') > -1
    let params = {}
    if(devMode) params.dev = true
    http.get('/_ac', { params }).then(response => {
        if(response.status == 200){
            let accessdata = response.data
            if(!devMode){ 
                accessdata = JSON.parse(decodeURIComponent(escape(atob(accessdata))).replace(/^sbrenc%34#/, ''))
            }
            appAccessData.value = accessdata
            storage('appAccessData').value = accessdata 
        }
    }).finally(()=>{
        document.body.setAttribute('forbidden', String(appUseForbiddened.value))
        document.body.setAttribute('warning', String(showAccessibilityAlert.value))
    
        if(appUseForbiddened.value === true){
            stop_clear_and_reload()
        }

        checking_accessibility.value = false

        if(LockscreenRef.value){
            if(showAccessibilityAlert.value){
                
            }
        }
         

    })
   
 } catch (error) {
   console.warn('addSchedule__error::', error);
 }

}
 
 
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
provide('pushTheBarcode', pushTheBarcode) 
provide('all_students', all_students) 
provide('getAllStudents', getAllStudents) 
provide('appAccessData', appAccessData)
provide('appUseForbiddened', appUseForbiddened)




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
    running_punch_schedules(class_short=null){        
      
        let ms = helper.miliseconds()
        let founds = punch_schedules.value.filter(schedule => {
            let { start_ms, end_ms } = schedule
            return (ms >= start_ms && ms <= end_ms)
        })      
        if(class_short) return founds.filter(cls => cls.class_shorts.includes(class_short))   
        return founds
    },
    running_call_schedules(class_short=null){        
      
        let ms = helper.miliseconds()
        let founds = call_schedules.value.filter(schedule => {
            let { start_ms, end_ms } = schedule
            return (ms >= start_ms && ms <= end_ms)
           
        })     
        if(class_short) return founds.filter(cls => cls.class_shorts.includes(class_short))  
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
    incoming_call_schedules(class_short=null){        
      
        let ms = helper.miliseconds()
        let data = helper.clone(call_schedules.value)
        data.forEach(schedule => {
            let { start_ms } = schedule
            schedule['incoming_time'] = (ms < start_ms) ? start_ms - ms : -1
        })
        data = data.toSorted((a, b) => {
            return a['incoming_time'] - b['incoming_time']
        })    
        
        data = data.filter(s => s.incoming_time != -1)

        if(class_short) return data.filter(cls => cls.class_shorts.includes(class_short)) 

        return data
    },
    timesup_punch_schedules(){       
      
        let ms = helper.miliseconds()
        let data = (punch_schedules.value.filter(schedule => {
            let { end_ms } = schedule
            return ms > end_ms
        }))
        data = data.toSorted((a, b) => {
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



function pauseAudioIfRurning(){
    if(palylistComponent.value){
        const { currentItem, audio } = palylistComponent.value
        audio.currentTime = 0;
        audio.pause()
        isPlaying.value = false
    }
     
}



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
 
async function getAllStudents(){
 
 try { 

   http.get('/students/all').then(response => {
     if(response.status == 200){
       all_students.value = response.data
     }
   }).finally(()=>{
      
   })
   
 } catch (error) {
   console.warn('addSchedule__error::', error);
 }

}

onMounted(async ()=>{   
    
        
    document.body.setAttribute('forbidden', String(appUseForbiddened.value))
    document.body.setAttribute('warning', String(showAccessibilityAlert.value))
    
    await getAllStudents()
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
    wattingList.value = storage('wattingList').value || []
    is_started_schedule.value = storage('is_started_schedule').value || is_started_schedule.value 
    emergency_mode.value = Boolean(storage('emergency_mode').value)
 

    setTimeout(() => {
        schedule_timeout.value = setInterval(()=>{
            focusBarcodeInput__and__startAnnoucement()
            refreshDOM.value = false
            emitter.emit('pushed_a_student__or__rechecktoPlay', true)
            setTimeout(()=>refreshDOM.value = true, 0)
        }, 1000);
    }, 100);

    isMounted.value = true;
 


    emitter.on('on_socket_message', (socket_data) => {
        if(socket_data.type == 'attendence'){
            let { punch_time, barcode } = socket_data 
            let time_and_barcode = `${punch_time}-${barcode}`

            let existing = storage('time_and_barcode').value
            
            if(!existing || existing != time_and_barcode || useRoute().query.force=='true'){
                storage('time_and_barcode').value = time_and_barcode
                pushTheBarcode(barcode)
            }
        }
     })

     await CheckAccess(true) 
})


function pushTheBarcode(barcode='play-417-2024', { message='' }={}){
     try {

          if(!is_started_schedule.value){
               emitter.emit('toaster-error', { message: 'শিডিউল এখনো শুরু হয়নি'})
               return
          }
          
          if(barcode == 'i' || barcode == 'I'){
               emergency_mode.value = !emergency_mode.value
               return
          }

          if(!emergency_mode.value){
               if(!(/^[a-z_0-9]+-\d{1,}-sound(1|2|3)/gi.test(barcode))){
                    emitter.emit('toaster-error', { message: 'বারকোড সঠিক নয়', duration: 5000})
                    return
               }
          }


          let [ class_short ] = barcode.split('-') // nursary-23-sound1-2024

                    
          if(!emergency_mode.value){
               let isAllowed = callbacks.isMatchedAnySchedule(class_short)
             
               if(!isAllowed){
                    emitter.emit('toaster-error', { message: 'পাঞ্চ এর সময় শুরু হয়নি'})
                    return
               }
               let targetClass = classes.value.filter(cls => cls.class_short == class_short)?.[0];
               if(!targetClass?.isActive){
                    emitter.emit('toaster-error', { message: 'এই ক্লাসটি আপাতত বন্ধ আছে'})
                    return
               }
          }




          http.get('/single-student', { params: { barcode } }).then(response => {
               if(response.status == 200){
                    let student = response.data.data;
                    student['barcode'] = barcode;
                    student['punch_exact_time'] = helper.miliseconds();
                    student['punch_exact_time_text'] = moment().format('hh:mm A')

                    let findLast = wattingList.value.findLast(s => s.id == student.id)
                    let findLastIndex = wattingList.value.findLastIndex(s => s.id == student.id)
                  

                   
                    if(!student[student['soundColName']]){ 
                         emitter.emit('toaster-error', { message: `অডিও যুক্ত করা হয়নি`, duration: 10000})
                        //  speakText('voice is not added')
                    
                         router.push({name: 'students', query: {
                              dakhela: student.dakhela,
                              barcode,
                         }})
                         return
                    }

                   


                    
                    student['emergency_mode'] = emergency_mode.value
                    
                    if(!emergency_mode.value){
                         const { running_call_schedules, incoming_call_schedules  } = callbacks
                         let rs = running_call_schedules(student['class_short'])
                         let is = incoming_call_schedules(student['class_short'])

                         console.log(student);
                         
                         if(rs.length){
                              student['start_ms'] = rs[0].start_ms
                              student['end_ms'] = rs[0].end_ms
                         } else {
                              student['start_ms'] = is[0].start_ms
                              student['end_ms'] = is[0].end_ms
                         } 

                         // ----
                         if(!findLast){
                              wattingList.value.push(student)
                              emitter.emit('pushed_a_student__or__rechecktoPlay', student)
                              if(message){
                                    emitter.emit('toaster-success', { message, duration: 3000})
                              } 
                         }
                         else if(findLast && findLast?.is_called){
                              wattingList.value.splice(findLastIndex, 0, student)
                              emitter.emit('pushed_a_student__or__rechecktoPlay', student)
                              if(message){
                                    emitter.emit('toaster-success', { message, duration: 3000})
                              } 
                         } else if (findLast) {
                              let studentCard = document.querySelector(`[barcode="${barcode}"]`)
                              if(studentCard){
                                   studentCard.classList.add('bx-fade-down')
                                   setTimeout(() => {
                                        studentCard.classList.remove('bx-fade-down')
                                        
                                   }, 2000);
                              }
                              emitter.emit('toaster-error', { message: 'ইতিমধ্যে কার্ডটি পাঞ্চ করা হয়েছে'})
                         }
                    } else {
                         student['start_ms'] = helper.miliseconds() - 1000
                         student['end_ms'] = helper.miliseconds() + (10 * 1000)
                         wattingList.value.unshift(student)  
                    } 

                    storage('wattingList').value = wattingList.value;
               }
          })
     } catch (error) {
          console.warn('pushTheBarcode_error::', error);
     }
}

</script>

<template>
    <!-- <SideBar>
        <routerView />
    </SideBar> -->
    <Toaster></Toaster>
    <template v-if="appUseForbiddened">
        <Lockscreen ref="LockscreenRef" @tryToUnlock="CheckAccess(true)"></Lockscreen>
        <template v-if="showAccessibilityAlert">
            <div class="diablitily-alert">
                <div v-html="getForbiddenedMessage" @auxclick="log({getWarningMessage})"></div>
                <accessCheckAnimation v-if="checking_accessibility"></accessCheckAnimation>
            </div>
        </template>
    </template>
    <template v-else>
        <TopNav></TopNav>
        <div v-if="isMounted" class="page-contents" >
            <routerView />
            <Playlist ref="palylistComponent"></Playlist> 
        </div>
    
        <template v-if="showAccessibilityAlert">
            <div class="diablitily-alert" @auxclick="log({getForbiddenedMessage})" v-html="getWarningMessage">  
            </div>
        </template>
    </template>
    
</template>

<style scoped>
.access-loading-area{
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 333;
    background-color: var(--primaryColor);
    background-color: #ffd602;
}
.diablitily-alert{
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    min-height: 40px;
    z-index: 333;
    background-color: #ffd602;
    padding: 8px 20px;
    text-align: center; 
    font-size: 20px;
}
</style>
 
