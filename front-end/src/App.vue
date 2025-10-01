<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
import Toaster from './components/Toaster.vue'
import SwitchBoard from './components/SwitchBoard.vue'
const emitter = inject('emitter');
import moment from 'moment/moment'
import Playlist from './components/Playlist.vue'
import accessCheckAnimation from './components/accessCheckAnimation.vue'
import Lockscreen from './components/Lockscreen.vue'

const socketInit = inject('socketInit');



const log = console.log

let helper = inject('helper')
let http = inject('http')
let storage = inject('storage')
let route = useRoute();
let router = useRouter();  
let CONFIG = ref({});  

let internet = ref(true) 
/**
 * When internet is not connected, 
 * Our application will not to be able to fetch data from ZKTeco device
 * But, our client need to be call students manually.
 * So, we are adding a recurring(পুনরাবৃত্তিমূলক) reload policy to call students
 * It means, client can be able to maximu 20 person/students,
 * and after relaod he can call agin 20 
 * and after relaod he can call agin 20 ....
 */
let showRecurringModal = ref(true) 

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
let last_mouse_activity_time = ref(moment().format('Y-MM-DD HH:mm:ss'))
let emergency_mode = ref(false)
let LockscreenRef = ref(null)
let disabilityAlretRef = ref(null)
let manually_paused_the_playlist = ref(false)
let showSwithBoardModal = ref(false)
let switches_PreviewInHomePage = ref(localStorage.getItem('switches_PreviewInHomePage') === 'true' ? true : false)
let borad_image_url = globalThis.GLOBAL_DATA?.env.BASE_URL + '/electric-board.png'
let isUsingSpeakerAutoControl = computed(()=>CONFIG.value?.settings?.with_speaker_controls?.status)
let isSpeakersAutoMode = computed(()=>CONFIG.value?.settings?.with_speaker_controls?.switch_mode === 'auto')
let last_requested_ports_for_auto_mode = ref(null)

watch(switches_PreviewInHomePage, (bool) => {
    localStorage.setItem('switches_PreviewInHomePage', bool)
})

watch(wattingList, (newWaittinglist) => {
    storage('wattingList').value = newWaittinglist 
}, {deep: true})

let palylistComponent = ref(null)
provide('palylistComponent', palylistComponent)

let all_students = ref([])


let checking_accessibility = ref(false)
let appAccessData = ref({...storage('appAccessData').value || {internet: true}}) 



let showAccessibilityAlert = computed(() => {
    let { 
        last_paid_month, 
        permanently_active,
    } = appAccessData.value || {}

    if(!appAccessData.value || !last_paid_month){ 
        return false
    } 
    if(permanently_active) return false // if, permanently_active === true, warning never show

    const endofPayMonth = moment(last_paid_month).endOf('month').add(1, 'day')
    const endofPayMonth_time = endofPayMonth.valueOf()
    const current_time = moment().hour(11).minute(59).second(59).valueOf()

    return current_time > endofPayMonth_time
})

let appUseForbiddened = computed(() => { 
    let { 
        last_paid_month, 
        is_active, 
        stop_after_day,
        permanently_active,
    } = appAccessData.value || {}

    if(!appAccessData.value){ 
        return false
    } 
    if(!last_paid_month){ 
        return false
    } 
    if(!is_active) return true 
    if(permanently_active) return false 

    // পরের মাসের ৫ তারিখের পরেই অ্যাপটি বন্ধ হবে
    const lastPaidMonth = moment(last_paid_month).endOf('month').add(stop_after_day, 'days')
    const lastPaidMonth_time = lastPaidMonth.valueOf()
    const current_time = moment().hour(11).minute(59).second(59).valueOf()

    const is_overdue = current_time > lastPaidMonth_time

    return is_overdue // বিলম্বিত?
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

    warning_message = warning_message.replace('{{month}}', afterPaymonth)
    warning_message = warning_message.replace('{{date}}', stopAfter.format('DD MMMM')) 
    warning_message = warning_message.replace('{{left_days}}', left_days)  

    return helper.enToBnDate(warning_message, {bold: false})
})


let getForbiddenedMessage = computed(()=>{
    let { 
        last_paid_month,
        stopped_message,
    } = appAccessData.value || {}

    stopped_message = stopped_message.replace('{{month}}', moment(last_paid_month)?.endOf('month').format('MMMM'))

    return helper.enToBnDate(stopped_message, {bold: false})
})


async function getConfig({switch_mode=''}={}){
    try {
        let response = await http.get('/config', { params: { switch_mode } })
        if(response.status == 200){
            CONFIG.value = response.data
            classes.value = response.data.classes
        }
    } catch (error) {
        
    }
}

async function CheckAccess({loader=false}={}){
 
 try { 
    if(checking_accessibility.value) return
    if(loader) checking_accessibility.value = true; 
    const devMode = window.location.href.indexOf('dev=true') > -1
    let params = {}
    if(devMode) params.dev = true
    http.get('/_ac', { params }).then(response => {
        if(response.status == 200){
            let accessdata = response.data


            let defaultData = {
                prefix: 'developer',
                students_history: '445 | 4 | play:25 | nursery:17 | kg:29 | one:41 | two:40 | three:38 | four:25 | five:38 | mizan:37 | nahbemir:28 | kuduri:18 | shorhebekaya:20 | meskat1:13 | hifz:61 | pre_hifz:19',
                institute_name: 'Developer Institute',
                last_paid_month: '2025-09-29T18:00:00.000Z',
                stop_after_day: 0,
                warning_message: 'সম্মানিত কাস্টমার, অ্যাপ্লিকেশনটি বন্ধ রাখা হয়েছে, সচল রাখার অনুমতি নেই।',
                stopped_message: 'সম্মানিত কাস্টমার, অ্যাপ্লিকেশনটি বন্ধ রাখা হয়েছে, সচল রাখার অনুমতি নেই।',
                deactivation_message: 'Deactivation message',
                is_active: false,
                permanently_active: false,
                latest_api_url: 'https://script.google.com/macros/s/AKfycbxB9NH2EcezdfFE-649d7cY3UGx8iYXmXXhUgelv4A8Kd6Bj2SI7bSJO3zcTJWIMJlY5A/exec',
                /**
                 * static key only here
                 * It will be false if uer PC is not connected with internet
                 */
                internet: true, 
            }


            if(!devMode){ 
                try {
                    accessdata = JSON.parse(decodeURIComponent(escape(atob(accessdata))).replace(/^sbrenc%34#/, ''))
                } catch (error) {
                    console.warn('_ac:: May be wrong data', {error, accessdata})
                }
            }


            if(accessdata && accessdata.institute_name){
                accessdata.last_paid_month = moment(accessdata.last_paid_month).startOf('day').toISOString()
            }
            appAccessData.value = {...defaultData, ...accessdata}
            if(appAccessData.value?.internet === false){
                internet.value = false
            }
            
            storage('appAccessData').value = accessdata 
        }
    }).finally(()=>{

        if(appAccessData.value?.internet === true){
            document.body.setAttribute('forbidden', String(appUseForbiddened.value))
            document.body.setAttribute('warning', String(showAccessibilityAlert.value))
        }
    
        if(appUseForbiddened.value === true){
            stop_clear_and_reload()
        }

        checking_accessibility.value = false

        if(LockscreenRef.value){
            if(showAccessibilityAlert.value){
                
            }
        }
        setTimeout(() => {
            if(disabilityAlretRef.value){
                let { height } = disabilityAlretRef.value.getBoundingClientRect()
                document.body.style.paddingBottom = height + 'px'
            }
        }, 10);
         

    })
   
 } catch (error) {
   console.warn('addSchedule__error::', error);
 }

}

async function controlSounds({student=null, ports=[], openAll=false}={}){
 
 try { 

    if(!isUsingSpeakerAutoControl.value) return

    let requested_ports = ports

    if(student){
        let targetClass = classes.value.filter(cls => cls.class_short == student.class_short)?.[0];
        let { speaker_ports } = targetClass || {}
        if(targetClass?.speaker_ports?.length){
            requested_ports = targetClass?.speaker_ports
        }
    } else if(openAll){
        requested_ports = Array.from({ length: CONFIG.value?.settings?.with_speaker_controls?.switch_count || 16 }, (_, i) => i + 1)
    } 

     


    // let response = await http.get('/' + '-'.padEnd(15, '-') + '_'.padEnd(15, '_'), { 
    // let response = await http.get('/sw', { 
    //     params: {_p: requested_ports.join(',')},
    //     headers: { "Content-Type": "text/css" },
    //     responseType: "text",
    // }) 
    // if(response.status == 200){}

    emitter.emit('when_firing__controlSounds', {ports: requested_ports, openAll})

    if(isSpeakersAutoMode.value){
        last_requested_ports_for_auto_mode.value = requested_ports
    }

    let existingLink = document.getElementById('latest_css')


    /**
     * =====CSS===REQUEST-eeeee
     */

    let removeHref = (el) => setTimeout(()=>el.removeAttribute('href'), 10)

    let head = document.head || document.getElementsByTagName('head')[0];
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.id = 'latest_css';
    let _href = `${globalThis.GLOBAL_DATA?.env.BASE_URL}/latest.css?_p=${requested_ports.join(',')}&t=${new Date().getTime()}`;  
    if(existingLink){
        existingLink.href = _href
        removeHref(existingLink)
    }
    else {
        link.href = _href
        head.appendChild(link);
        removeHref(link)
    }
   
 } catch (error) {
   console.warn('controlSounds__error::', error);
 }

}
provide('route', route)
provide('router', router)
provide('CONFIG', CONFIG)
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
provide('manually_paused_the_playlist', manually_paused_the_playlist)
provide('getConfig', getConfig)
provide('controlSounds', controlSounds)
provide('showSwithBoardModal', showSwithBoardModal)
provide('borad_image_url', borad_image_url)
provide('switches_PreviewInHomePage', switches_PreviewInHomePage)
provide('isUsingSpeakerAutoControl', isUsingSpeakerAutoControl)
provide('isSpeakersAutoMode', isSpeakersAutoMode) 
provide('last_requested_ports_for_auto_mode', last_requested_ports_for_auto_mode) 




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
    setTimeout(() => {
        wattingList.value = []
        storage('wattingList').value = []  
    }, 1000);
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

let Socket = ref(null)
let socketServerIsRunning = ref(false)

emitter.on('is_connected_socket_server', (bool) => {
    socketServerIsRunning.value = bool
})

onMounted(async ()=>{   

    setTimeout(() => {
        Socket.value = socketInit({emitter, toaster: true})
    }, 1000);

     

    setInterval(()=>{
        if(Socket.value){ 
            if(socketServerIsRunning.value === false){
                Socket.value = socketInit({emitter, toaster: true})
            }
        }
    }, 5000)

    document.addEventListener('click', (e) => { 
        // emitter.emit('document_clicked', e)
    })


    window.addEventListener("online", () => {
        appAccessData.value.internet = true
        CheckAccess()
    });
    
    window.addEventListener("offline", () => {
        appAccessData.value.internet = false
    });

    if(appAccessData.value?.internet === true){
        document.body.setAttribute('forbidden', String(appUseForbiddened.value))
        document.body.setAttribute('warning', String(showAccessibilityAlert.value))
    }
        
    
    await getAllStudents()
    await getSchedules()

    await getConfig()

    document.addEventListener('click', () => {
        user_interacted.value = true;  
        last_mouse_activity_time.value = moment().format('Y-MM-DD HH:mm:ss')
        document.body.classList.add('user-interacted')
        emitter.emit('document_click')
    })
    document.addEventListener('mousemove', () => { 
        last_mouse_activity_time.value = moment().format('Y-MM-DD HH:mm:ss') 
        emitter.emit('document_mousemove')
    })
    document.addEventListener('resize', () => { 
        emitter.emit('document_resize')
    })
    clearTimeout(schedule_timeout.value)
    classes.value = storage('classes').value || classes.value
    wattingList.value = storage('wattingList').value || []
    is_started_schedule.value = Number(storage('is_started_schedule').value || 0) || is_started_schedule.value 
    emergency_mode.value = Boolean(storage('emergency_mode').value)
 

    setTimeout(() => {
        schedule_timeout.value = setInterval(()=>{
            focusBarcodeInput__and__startAnnoucement()
            refreshDOM.value = false
            emitter.emit('pushed_a_student__or__rechecktoPlay', true)
            setTimeout(()=>refreshDOM.value = true, 0)


            // Check accesivility each 1 hour
            let minutes_secods = moment().format('mm:ss')
            let end_of_hour = minutes_secods === '59:59'
            if(end_of_hour){
                CheckAccess()
            }




            emitter.emit('intervalling', true)
            focusCurrenPlayingSoundCard_if_userIsInavtiveForFewSeconds()

        }, 1000);
    }, 100);

    isMounted.value = true;
 


    emitter.on('on_socket_message', (socket_data) => {
        if(socket_data.type == 'attendence'){
            let { punch_time, barcode } = socket_data 
            let time_and_barcode = `${punch_time}-${barcode}`

            let existing = storage('time_and_barcode').value
            
            if(!existing || existing != time_and_barcode || useRoute()?.query?.force=='true'){
                storage('time_and_barcode').value = time_and_barcode
                pushTheBarcode(barcode)
            }
        }
     })

     await CheckAccess({loader: true}) 
})


function focusCurrenPlayingSoundCard_if_userIsInavtiveForFewSeconds(){
    let auto_focus_mode = CONFIG.value?.settings?.auto_focus_student_card?.status
    let delay_in_seconds = CONFIG.value?.settings?.auto_focus_student_card?.delay_in_seconds || 3
    if(auto_focus_mode){
        
        let last_activity_time = last_mouse_activity_time.value
        let seconds = moment(moment()).diff(last_activity_time, 'seconds')
    
        if(seconds >= delay_in_seconds){
            let targetedCard = document.querySelector(`[playing=true]`)
            if(targetedCard){
                targetedCard.scrollIntoView({
                    behavior: "smooth", 
                    block: "start",
                });
            }
        } 
    }
}


function pushTheBarcode(barcode='play-417-2024', { message='', source='device' }={}){
     try {
          if(!is_started_schedule.value){
               emitter.emit('toaster-error', { message: 'switched is off'})
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


          if(source === 'device'){
            // Without internet device punch not allowed
            if(appAccessData.value?.internet === false){
                emitter.emit('toaster-error', { message: 'Without internet connection, device punch is not allowed'})
                return
            }
          }

                    
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
                    
                    if(student.status !== 1){
                        return emitter.emit('toaster-error', { message: 'এই স্টুডেন্টটি আপাতত নিষ্ক্রিয় আছে'})
                    }
                    
                    student['barcode'] = barcode;
                    student['punch_exact_time'] = helper.miliseconds();
                    student['punch_exact_time_text'] = moment().format('Y-MM-DD HH:mm:ss')

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

                    function addPunchLog(student){
                        http.post('/punch-log/add-log', { student }).then(response => { })
                    }

                    // dev code to make eroor in audio URL
                    // student.sound1 = student.sound1 + 'e'
                    
                    if(!emergency_mode.value){
                         const { running_call_schedules, incoming_call_schedules  } = callbacks
                         let rs = running_call_schedules(student['class_short'])
                         let is = incoming_call_schedules(student['class_short'])

                         if(rs.length){
                              student['start_ms'] = rs[0].start_ms
                              student['end_ms'] = rs[0].end_ms
                         } else {
                             if(!is.length){
                                  emitter.emit('toaster-error', { message: 'ক্লাসের জন্য কোন কল শিডিউল সক্রিয় নেই!'})
                                  return
                             }

                            student['start_ms'] = is[0].start_ms
                            student['end_ms'] = is[0].end_ms
                         } 


                         

                         // ----
                         if(!findLast){
                              wattingList.value.push(student)
                              addPunchLog(student)
                              emitter.emit('pushed_a_student__or__rechecktoPlay', student)
                              if(message){
                                    emitter.emit('toaster-success', { message, duration: 3000})
                              } 
                         }
                         else if(findLast && findLast?.is_called){
                              // wattingList.value.splice(findLastIndex, 0, student)
                              
                              findLast['is_called'] = false
                              findLast['sound1'] = student.sound1
                              delete findLast.sound1_haserror
                              if(!findLast?.['total_punch']) {
                                findLast.total_punch = 2
                              } else {
                                findLast['total_punch'] += 1
                              }

                              addPunchLog(student)
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
                         addPunchLog(student)
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
    <template v-if="appUseForbiddened && appAccessData?.internet === true">
        <Lockscreen ref="LockscreenRef" @tryToUnlock="CheckAccess({loader: true})"></Lockscreen>
        <template v-if="true">
            <div ref="disabilityAlretRef" class="disablitily-alert">
                <div v-html="getForbiddenedMessage" @auxclick="log({getWarningMessage})"></div>
                <accessCheckAnimation v-if="checking_accessibility"></accessCheckAnimation>
            </div>
        </template>
    </template>
    <template v-else>
        <TopNav></TopNav>
        <div v-if="isMounted" class="page-contents" >
            <routerView />
            <SwitchBoard v-if="showSwithBoardModal" @close="showSwithBoardModal = false"></SwitchBoard>
            <Playlist ref="palylistComponent"></Playlist> 

        </div>
    
        <template v-if="showAccessibilityAlert">
            <div ref="disabilityAlretRef" class="disablitily-alert" @auxclick="log({getForbiddenedMessage})" v-html="getWarningMessage">  
            </div>
        </template>
        <template v-else-if="appAccessData?.internet === false">
            <div ref="disabilityAlretRef" class="disablitily-alert">
                আপনার ইন্টারনেট সংযোগটি বিচ্ছিন্ন রয়েছে। এই মুহূর্তে ডিভাইস থেকে পাঞ্চ অকার্যকর।
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
.disablitily-alert{
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
 
