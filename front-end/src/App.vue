<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed, watch, onMounted, onBeforeUnmount, triggerRef, nextTick } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
import Toaster from './components/Toaster.vue'
import SwitchBoard from './components/SwitchBoard.vue'
const emitter = inject('emitter');
import moment from 'moment/moment'
import 'moment/locale/bn'
import Playlist from './components/Playlist.vue'
import accessCheckAnimation from './components/accessCheckAnimation.vue'
import Lockscreen from './components/Lockscreen.vue'
import DevicesPreloader from './components/DevicesPreloader.vue'
import AddBulkAttendaceForDev from './components/AddBulkAttendaceForDev.vue'
import FetchBulkAttendanceFromDevice from './components/FetchBulkAttendanceFromDevice.vue'

const socketInit = inject('socketInit');



const log = console.log
const isIPAccess = window.location.hostname !== 'localhost'

let helper = inject('helper')
let http = inject('http')
let storage = inject('storage')
let route = useRoute();
let router = useRouter();  
let makeCarcode = inject('makeCarcode')
let CONFIG = ref(storage('CONFIG').value || {});  
const langCode = computed(() => CONFIG.value?.lang_code || (CONFIG.value?.settings?.lang_bn === false ? 'en' : 'bn'))
const isBanglaUi = computed(() => langCode.value === 'bn')
const t = (text = '', params = {}) => helper.t(text, params)
let playback_speed = ref(Number(storage('playback_speed').value) || 1)
provide('playback_speed', playback_speed)

watch(playback_speed, (newVal) => {
    storage('playback_speed').value = newVal
})

watch(
  () => route.fullPath,
    (newPath, oldPath) => { 
        if(isMountedAppDotVue.value){
            if(newPath !== '/attendence'){
                // storage('attendance_tab').value = 1
            } 
        }
    }
)

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
let attendenceList = ref([])
let liveAttendenceList = ref(storage('liveAttendenceList').value || [])
let punch_schedules = ref([])
let call_schedules = ref([]) 
let toggleSettings = ref(true) 
let refreshDOM = ref(true) 
let isMounted = ref(false)
let user_interacted = ref(false)
let last_mouse_activity_time = ref(Date.now())
let emergency_mode = ref(false)
let LockscreenRef = ref(null)
let lockscreenDismissing = ref(false)
let disabilityAlretRef = ref(null)
let manually_paused_the_playlist = ref(false)
let showSwithBoardModal = ref(false)
let show_bulk_attedance_component = ref(false)
let last_mouse_keyboard_activity = ref(new Date().getTime())
// true if mouse/keyboard was used within the last 5 seconds
const isUserActive = ref(false)
const main_app_user_is_active = ref(false)
const allow_to_reaload = ref(false)
const showSmsModal = ref(false)
const show_cloner_component = ref(false)

watch(isUserActive, (bool) => {
    sendRemoteAction({from: 'localhost', action: 'is_active_main_user', data: isUserActive.value})
})

const handleBeforeUnload = (event) => {
    if(allow_to_reaload.value || (!isIPAccess && !isUserActive.value)){

    } else {
        event.preventDefault()
        event.returnValue = ''
    }
}
let switches_PreviewInHomePage = ref(localStorage.getItem('switches_PreviewInHomePage') === 'true' ? true : false)
let borad_image_url = globalThis.GLOBAL_DATA?.env.BASE_URL + '/electric-board.png'
let isUsingSpeakerAutoControl = computed(()=>CONFIG.value?.settings?.with_speaker_controls?.status)
let isSpeakersAutoMode = computed(()=>CONFIG.value?.settings?.with_speaker_controls?.switch_mode === 'auto')
let last_requested_ports_for_auto_mode = ref(null)

watch(switches_PreviewInHomePage, (bool) => {
    localStorage.setItem('switches_PreviewInHomePage', bool)
})

let _skipWattingListWatch = false
watch(wattingList, (newWaittinglist) => {
    storage('wattingList').value = newWaittinglist
    sendRemoteAction({from: 'localhost', action: 'update_waiting_list', data: newWaittinglist, host_name: window.location.host})
}, {deep: true})

watch(attendenceList, (newAttendenceList) => {
    // console.log('newAttendenceList[0]', newAttendenceList[0]);
}, {deep: true})


watch(liveAttendenceList, (newliveAttendenceList) => {
    storage('liveAttendenceList').value = newliveAttendenceList
}, {deep: true})

let palylistComponent = ref(null)
provide('palylistComponent', palylistComponent)

let all_students = ref([])
let all_students_non_copied = ref([])


let checking_accessibility = ref(false)
provide('checking_accessibility', checking_accessibility)

let appAccessData = ref({...storage('appAccessData').value || {internet: navigator.onLine}}) 



let showAccessibilityAlert = computed(() => {
    // Get warning days config (1, 3, 7, etc.)
    const showWarningDays = appAccessData.value?.show_warning_before
    if (!showWarningDays || showWarningDays === 0) return false

    let {
        last_paid_month,
        permanently_active,
        stop_after_day,
    } = appAccessData.value || {}

    if(!appAccessData.value || !last_paid_month){
        return false
    }
    if(permanently_active) return false // if, permanently_active === true, warning never show

    // Parse date in local timezone, normalize to start of day
    const paidMonthDate = moment(last_paid_month).startOf('day')

    // Calculate when access stops (end of paid month + stop_after_day)
    const accessStopDate = paidMonthDate.clone().endOf('month').add(stop_after_day || 0, 'days').startOf('day')

    // Calculate when warning should start showing (stop date - warning days)
    const warningStartDate = accessStopDate.clone().subtract(showWarningDays, 'days')

    // Get current date (start of day for comparison)
    const currentDate = moment().startOf('day')

    // Show warning if current date is between warning start date and access stop date (inclusive)
    return currentDate.isBetween(warningStartDate, accessStopDate, 'day', '[]')
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
 
    let stopAfter = moment(last_paid_month).endOf('month').add(stop_after_day, 'day')
    let left_days = stopAfter.diff(moment(), 'day')  

    warning_message = warning_message.replace('{{month}}', afterPaymonth)
    warning_message = warning_message.replace('{{date}}', stopAfter.format('DD MMMM')) 
    warning_message = warning_message.replace('{{left_days}}', left_days)  

    return helper.enToBnDate(warning_message, {bold: false})
})


let isLastActiveDay = computed(() => {
    const { last_paid_month, stop_after_day, permanently_active } = appAccessData.value || {}
    if (!last_paid_month || permanently_active) return false
    const lastDay = moment(last_paid_month).endOf('month').add(stop_after_day, 'days')
    return moment().isSame(lastDay, 'day')
})

let getForbiddenedMessage = computed(()=>{
    let {
        last_paid_month,
        stopped_message,
    } = appAccessData.value || {}

    stopped_message = stopped_message.replace('{{month}}', moment(last_paid_month)?.endOf('month').format('MMMM'))

    return helper.enToBnDate(stopped_message, {bold: false})
})


async function getConfig({switch_mode='', check=false}={}){
    try {
        let response = await http.get('/config', { params: { switch_mode } })
        if(response.status == 200){
            CONFIG.value = response.data
            classes.value = Array.from(response.data.classes).filter(c => c?.isActive)
            storage('CONFIG').value = response.data
            if(response.data?.settings?.click_me_to_allow_sound?.status === false){
                document.body.classList.add('user-interacted')
            }
            if(response.data?.settings?.attendance?.only_attendance_feature){
                if(route.name === 'home') router.push({ path: '/attendence', query: route.query })
            }
        }
    } catch (error) {
        console.log('getConfig_error', error);
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
                is_active: false,
                permanently_active: false,
                show_warning_before: 7,
                app_version: '1.0',
                latest_api_url: 'https://script.google.com/macros/s/AKfycbxB9NH2EcezdfFE-649d7cY3UGx8iYXmXXhUgelv4A8Kd6Bj2SI7bSJO3zcTJWIMJlY5A/exec',
                /**
                 * static key only here
                 * It will be false if uer PC is not connected with internet
                 */
                internet: navigator.onLine, 
            }


            if(!devMode){ 
                try {
                    accessdata = JSON.parse(decodeURIComponent(escape(atob(accessdata))).replace(/^sbrenc%34#/, ''))
                } catch (error) {
                    console.warn('_ac:: May be wrong data', {error, accessdata})
                }
            }

            if(accessdata?.reason == 'in_flight' && accessdata?.skipped == true){
                // emitter.emit('toaster-success', { message: 'Skiiped', duration: 3000})
                return
            }


            if(accessdata && accessdata.institute_name){
                accessdata.last_paid_month = moment(accessdata.last_paid_month).startOf('day').toISOString()
            }
            appAccessData.value = {...defaultData, ...accessdata}
            internet.value = navigator.onLine
            
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

        if(LockscreenRef.value && !appUseForbiddened.value){
            // access just granted — play shutter animation, then unmount
            lockscreenDismissing.value = true
            LockscreenRef.value.unlock()
            setTimeout(() => { lockscreenDismissing.value = false }, 800)
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
let isMountedAppDotVue = ref(false)

function applyLanguageSettings() {
    helper.setLanguage({
        code: langCode.value,
        packs: CONFIG.value?.lang_packs || {},
        strings: CONFIG.value?.lang_pack || {},
    })
    moment.locale('en')
}

watch(
    () => [langCode.value, CONFIG.value?.lang_pack, CONFIG.value?.lang_packs],
    () => {
        applyLanguageSettings()
    },
    { deep: true, immediate: true }
)

provide('route', route)
provide('router', router)
provide('CONFIG', CONFIG)
provide('langCode', langCode)
provide('isBanglaUi', isBanglaUi)
provide('t', t)
provide('isIPAccess', isIPAccess)
provide('is_started_schedule', is_started_schedule)
provide('schedule_timeout', schedule_timeout)
provide('classes', classes)
provide('wattingList', wattingList)
provide('attendenceList', attendenceList)
provide('liveAttendenceList', liveAttendenceList)
provide('speakText', speakText)
provide('getSchedules', getSchedules)
provide('punch_schedules', punch_schedules)
provide('call_schedules', call_schedules) 
provide('toggleSettings', toggleSettings) 
provide('refreshDOM', refreshDOM) 
provide('user_interacted', user_interacted) 
provide('emergency_mode', emergency_mode) 
provide('punchToCallStudent', punchToCallStudent) 
provide('punchToSubmitAttendance', punchToSubmitAttendance) 
provide('all_students', all_students) 
provide('all_students_non_copied', all_students_non_copied) 
provide('getAllStudents', getAllStudents) 
provide('appAccessData', appAccessData)
provide('appUseForbiddened', appUseForbiddened)
provide('manually_paused_the_playlist', manually_paused_the_playlist)
provide('getConfig', getConfig)
provide('controlSounds', controlSounds)
provide('showSwithBoardModal', showSwithBoardModal)
provide('show_bulk_attedance_component', show_bulk_attedance_component)
provide('isUserActive', isUserActive)
provide('main_app_user_is_active', main_app_user_is_active)
provide('allow_to_reaload', allow_to_reaload)
provide('borad_image_url', borad_image_url)
provide('switches_PreviewInHomePage', switches_PreviewInHomePage)
provide('isUsingSpeakerAutoControl', isUsingSpeakerAutoControl)
provide('isSpeakersAutoMode', isSpeakersAutoMode) 
provide('last_requested_ports_for_auto_mode', last_requested_ports_for_auto_mode) 
provide('showSmsModal', showSmsModal) 
provide('show_cloner_component', show_cloner_component) 




const callbacks = {
    isMatchedAnySchedule(class_short){
        let className = classes.value.find(c => c.class_short == class_short)?.class_name 
        if(!className) return false;

        let ms = helper.miliseconds()
        let founds = punch_schedules.value.filter(s => s.status == 1).filter(schedule => {
            let { start_ms, end_ms } = schedule 
            return (schedule.class_shorts.includes(class_short) && ms >= start_ms && ms <= end_ms) 
        })   
        return Boolean(founds.length)
    },
    running_punch_schedules(class_short=null){        
      
        let ms = helper.miliseconds()
        let founds = punch_schedules.value.filter(s => s.status == 1).filter(schedule => {
            let { start_ms, end_ms } = schedule
            return (ms >= start_ms && ms <= end_ms)
        })      
        if(class_short) return founds.filter(cls => cls.class_shorts.includes(class_short))   
        return founds
    },
    running_call_schedules(class_short=null){        
      
        let ms = helper.miliseconds()
        let founds = call_schedules.value.filter(s => s.status == 1).filter(schedule => {
            let { start_ms, end_ms } = schedule
            return (ms >= start_ms && ms <= end_ms)
           
        })     
        if(class_short) return founds.filter(cls => cls.class_shorts.includes(class_short))  
        return founds
    },
    incoming_punch_schedules(){        
      
        let ms = helper.miliseconds()
        let data = helper.clone(punch_schedules.value.filter(s => s.status == 1))
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
        let data = helper.clone(call_schedules.value.filter(s => s.status == 1))
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
        let data = (punch_schedules.value.filter(s => s.status == 1).filter(schedule => {
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
        let data = (call_schedules.value.filter(s => s.status == 1).filter(schedule => {
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
    },
    getCardOwnerName(id){
        if(!CONFIG.value?.card_owners?.length) return ''
        return CONFIG.value?.card_owners.find(owner => owner.id == id)?.name
    }, 
    fixOverflowOfLiveAttendence(){
        let live_attences = helper.clone(liveAttendenceList.value)
        let maximum_live_attedence = CONFIG.value?.settings?.attendance?.maximum_live_attedence || 50
        liveAttendenceList.value = live_attences.slice(-(maximum_live_attedence))
    },
    async getLeavesAndVacations(params={}){
        try { 
            let response = await http.get('/leave-and-vacation-list', { params }) 
            if(response.status == 200){
                let all_data = response.data?.data
                return all_data
            }else{
                return []
            }
       
        } catch (error) { return [] }
    },
}
provide('callbacks', callbacks) 
 
  
function _______SEAPRATOR______(){}


function focusBarcodeInput__and__startAnnoucement(){
    callbacks.clearWattingList()
    if(is_started_schedule.value && !isIPAccess && !showSmsModal.value && !show_cloner_component.value){
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

 

function getActiveConfigClasses() {
    const configuredClasses = classes.value?.length ? classes.value : (CONFIG.value?.classes || [])
    return (configuredClasses || []).filter(cls => cls?.isActive !== false)
}

function normalizeScheduleList(scheduleList = []) {
    const activeClassShorts = new Set(
        getActiveConfigClasses().map(cls => cls?.class_short).filter(Boolean)
    )

    return (scheduleList || []).map((item) => {
        const filteredClasses = (Array.isArray(item?.classes) ? item.classes : []).filter(cls => {
            return activeClassShorts.has(cls?.class_short)
        })

        return {
            ...item,
            classes: filteredClasses,
            class_names: filteredClasses.map(cls => cls.class_name),
            class_shorts: filteredClasses.map(cls => cls.class_short),
            start_ms: helper.miliseconds(item.start_time),
            end_ms: helper.miliseconds(item.end_time),
        }
    })
}


async function getSchedules(){
 
 try { 

   http.get('/schedules/list').then(response => {
     if(response.status == 200){
       let data = normalizeScheduleList(response.data.data || [])
       punch_schedules.value = data.filter(item => item.type == 1);              
       call_schedules.value = data.filter(item => item.type == 2);        
     }
   }).finally(()=>{
      
   })
   
 } catch (error) {
   console.warn('addSchedule__error::', error);
 }

}

watch(classes, () => {
    punch_schedules.value = normalizeScheduleList(punch_schedules.value)
    call_schedules.value = normalizeScheduleList(call_schedules.value)
})
 
 
async function getAllStudents(){
 
 try { 

   http.get('/students/all').then(response => {
     if(response.status == 200){
       let data = response.data
       if(data?.length){
        data = data.map(student => {
            student.full_name = `[${student.dakhela}] ${student.name?.split('||')[0]}`
            student.full_name2 = `[ID:${student.id},(${student.dakhela})] ${student.name?.split('||')[0]}`
            return student
        })
       } else {
        data = []
       }

       let attendanceAllowed = CONFIG.value?.settings?.attendance?.status === true
       let allowOnlyAttendance = CONFIG.value?.settings?.attendance?.only_attendance_feature === true
       let no_copied_students = data.filter(std => std.name.toLowerCase().indexOf('copied') === -1)
 

       all_students.value = data

       if(attendanceAllowed){
            if(allowOnlyAttendance){
                all_students_non_copied.value = data // allow attendance for all students
            } else {
                all_students_non_copied.value = no_copied_students // else, only permit the non-copied/real students
            }
        } else {
            all_students_non_copied.value = no_copied_students
       }
     }
   }).finally(()=>{
      
   })
   
 } catch (error) {
   console.warn('addSchedule__error::', error);
 }

}

let Socket = ref(null)
provide('Socket', Socket)
let socketServerIsRunning = ref(false)
let allow_auto_fetch = ref(false)
let is_connected_with_main_app = ref(false)
provide('sendRemoteAction', sendRemoteAction)
provide('is_connected_with_main_app', is_connected_with_main_app)

function onToaster({ type, message, duration }) {
    sendRemoteAction({ from: 'localhost', action: 'onToaster', data: { type, message, duration } })
}

function sendRemoteAction(
    {
        from='any', // ip | localhost
        action='say_hi',
        selector = null,
        data = null, 
        host_name = null, 
    } = {}
){
    try {
        if(!Socket.value) return 
        let SOCKET = Socket.value

        let __data = { type: 'remote_action', action, selector, data, host_name }

        if(from == 'any' || (from == 'ip' && isIPAccess) || (from == 'localhost' && !isIPAccess)){

            if(from === 'ip'){
                if(!is_connected_with_main_app.value) {
                    sendRemoteAction() // try to connect with main app
                    return
                }
            }
            SOCKET.send(JSON.stringify(__data))
        }
    } catch (sendRemoteAction_error) {
        console.error({sendRemoteAction_error}) 
    }
}

emitter.on('is_connected_socket_server', (bool) => {
    socketServerIsRunning.value = bool
})

onMounted(async ()=>{ 
    applyLanguageSettings()

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('message', onIframeMessage)
    
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
    await getConfig({check: true})
    applyLanguageSettings()

    if(CONFIG.value?.settings?.click_me_to_allow_sound?.status === false){
        document.body.classList.add('user-interacted')
    }
    let custom_message = CONFIG.value?.settings?.click_me_to_allow_sound?.custom_message
    if(custom_message && typeof custom_message === 'string'){
        document.body.setAttribute('data-msg', custom_message)
    }

    isMountedAppDotVue.value = true

    if(CONFIG.value?.settings?.attendance?.status && CONFIG.value?.settings?.attendance?.only_attendance_feature){
        document.body.classList.add('user-interacted')
    }

    document.addEventListener('click', (event) => {
        user_interacted.value = true;
        last_mouse_activity_time.value = Date.now()
        if(event.isTrusted) last_mouse_keyboard_activity.value = new Date().getTime()
        document.body.classList.add('user-interacted')
        emitter.emit('document_click')
    })
    document.addEventListener('mousemove', (event) => {
        last_mouse_activity_time.value = Date.now()
        if(event.isTrusted) last_mouse_keyboard_activity.value = new Date().getTime()
        emitter.emit('document_mousemove')
    })
    document.addEventListener('keydown', (event) => {
        if(event.isTrusted) last_mouse_keyboard_activity.value = new Date().getTime()
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
            isUserActive.value = (new Date().getTime() - last_mouse_keyboard_activity.value) < 5000
            focusCurrenPlayingSoundCard_if_userIsInavtiveForFewSeconds()

        }, 1000);
    }, 100);


    setTimeout(() => {
        const today = moment().format('Y-MM-DD')
        const is_allowed_attendance = CONFIG.value?.settings?.attendance?.status === true
        allow_auto_fetch.value = is_allowed_attendance && storage('last__allow_auto_fetch_date').value !== today
    }, 1000);

    isMounted.value = true;
 
    emitter.on('on_socket_message', (socket_data) => {
        
        if(socket_data.type == 'attendence'){
            let { punch_time, barcode, for_attendence, device_index } = socket_data 
            let time_and_barcode = `${punch_time}-${barcode}`

            let existing = storage('time_and_barcode').value
            
            if(!existing || existing != time_and_barcode || useRoute()?.query?.force=='true'){
                storage('time_and_barcode').value = time_and_barcode
                if(for_attendence){
                    punchToSubmitAttendance(barcode, { for_attendence, device_index })
                } else {
                    punchToCallStudent(barcode, { for_attendence, device_index })
                }
                
            }
        }

        

        if(socket_data.type == 'remote_action') {
            let { action, selector, data } = socket_data

            // localhost receives say_hi → reply with ack
            if(!isIPAccess && action === 'say_hi'){
                sendRemoteAction({action: 'say_hi_reply'})
            }
            // IP client receives ack → mark connected
            if(isIPAccess && action === 'say_hi_reply'){
                is_connected_with_main_app.value = true
            }
            // on/off
            if(!isIPAccess && action === 'toogle_is_started_schedule'){
                is_started_schedule.value = data // boolean
            }
            // Toggle emergency mode
            if(!isIPAccess && action === 'toogle_emergency_mode'){
                emergency_mode.value = data // boolean
            }
            // set playback speed
            if(!isIPAccess && action === 'set_playback_speed'){
                playback_speed.value = data
            }
            // localhost receives onClick from IP client → click the element (only if user is not active)
            // !isUserActive.value
            if(!isIPAccess && action === 'onClick' && selector && !isUserActive.value){
                const el = document.querySelector(selector)
                if(el) el.click()
            }
            if(isIPAccess && action === 'update_waiting_list'){
                let { host_name } = socket_data
                let _data = (data || []).map(item => {
                    if(item.sound1){
                        item.sound1 = String(item.sound1).replace(host_name, window.location.host)
                    }
                    return item
                })
                console.log({_data});
                wattingList.value = _data
            }
            if(isIPAccess && action === 'is_active_main_user'){
                main_app_user_is_active.value = data // boolean
            }
            if(!isIPAccess && action === 'call_punch__from_ip'){
                punchToCallStudent(data.barcode, {...data})
            }
            if(!isIPAccess && action === 'remote_toaster'){
                punchToCallStudent(data.barcode, {...data})
            }
            if(!isIPAccess && action === 'reload'){
                window.location.reload()
            }
        }
     })

     await CheckAccess({loader: true}) 
 
    setTimeout(() => {
        sendRemoteAction({from: 'ip'})
    }, 2000);
})


function focusCurrenPlayingSoundCard_if_userIsInavtiveForFewSeconds(){
    let auto_focus_mode = CONFIG.value?.settings?.auto_focus_student_card?.status
    let delay_in_seconds = CONFIG.value?.settings?.auto_focus_student_card?.delay_in_seconds || 3
    if(auto_focus_mode){
        
        let last_activity_time = last_mouse_activity_time.value
        let seconds = moment().diff(last_activity_time, 'seconds')
    
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


function punchToCallStudent(barcode='play-417-2024', { message='', source='device', device_index=0 }={}){
    try {
        
        if(isIPAccess){
            sendRemoteAction({from: 'ip', action: 'call_punch__from_ip', data: {barcode, message, source, device_index}})
            return
        }


        if(!is_started_schedule.value){
            emitter.emit('toaster-error', { message: helper.t('Switch is off')})
            return
        }
        
        if(barcode == 'i' || barcode == 'I'){
            emergency_mode.value = !emergency_mode.value
            return
        }

        if(!emergency_mode.value){
            if(!(/^[a-z_0-9]+-\d{1,}-sound(1|2|3)/gi.test(barcode))){
                    emitter.emit('toaster-error', { message: helper.t('Barcode is invalid ({barcode})', { barcode }), duration: 5000})
                    return
            }
        }


        let [ class_short ] = barcode.split('-') // nursary-23-sound1-2024
        let class_object = classes.value.find(c => c.class_short === class_short)
        let class_name = class_object?.class_name


        if(source === 'device'){
            // Without internet device punch not allowed
            if(appAccessData.value?.internet === false){
                emitter.emit('toaster-error', { message: helper.t('Device punch is not allowed without internet connection')})
                return
            }
        }

                    
        if(!emergency_mode.value){
            let isAllowed = callbacks.isMatchedAnySchedule(class_short)
            
            if(!isAllowed){
                    emitter.emit('toaster-error', { message: helper.t('Punch time has not started for {name}', { name: class_name || helper.t('this class') })})
                    return
            }
            let targetClass = classes.value.filter(cls => cls.class_short == class_short)?.[0];
            if(!targetClass?.isActive){
                    emitter.emit('toaster-error', { message: helper.t('This class is currently closed')})
                    return
            }
        }




        http.get('/single-student', { params: { barcode } }).then(response => {
            if(response.status == 200){
                    let student = response.data.data;
                    
                    if(student.status !== 1){
                        return emitter.emit('toaster-error', { message: helper.t('This student is currently inactive')})
                    }
                    
                    student['barcode'] = barcode;
                    student['punch_exact_time'] = helper.miliseconds();
                    student['punch_exact_time_text'] = moment().format('Y-MM-DD HH:mm:ss')

                    let findLast = wattingList.value.findLast(s => s.id == student.id)
                    let findLastIndex = wattingList.value.findLastIndex(s => s.id == student.id)
                

                
                    if(!student[student['soundColName']]){ 
                        emitter.emit('toaster-error', { message: helper.t('Audio is not attached'), duration: 10000})
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
                        
                                let __startTime = moment(moment().format('Y-MM-DD') + ' ' + rs[0].start_time).format('hh:mm A')
                                let __endTime = moment(moment().format('Y-MM-DD') + ' ' + rs[0].end_time).format('hh:mm A')
                                student['call_slot'] = `${__startTime} - ${__endTime}`
                            

                        } else if(is?.length)  {
                            
                            student['start_ms'] = is[0].start_ms
                            student['end_ms'] = is[0].end_ms

                            let __startTime = moment(moment().format('Y-MM-DD') + ' ' + is[0].start_time).format('hh:mm A')
                            let __endTime = moment(moment().format('Y-MM-DD') + ' ' + is[0].end_time).format('hh:mm A')
                            student['call_slot'] = `${__startTime} - ${__endTime}`
                        } else {
                            if(!is.length){
                                emitter.emit('toaster-error', { message: helper.t('No active call schedule found for this class!')})
                                return
                            }
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

                            findLast['punch_exact_time_text'] = moment().format('Y-MM-DD HH:mm:ss')

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
                            emitter.emit('toaster-error', { message: helper.t('This card has already been punched')})
                        }
                    } else {
                        student['start_ms'] = helper.miliseconds() - 1000
                        student['end_ms'] = helper.miliseconds() + (10 * 1000)
                        wattingList.value.unshift(student)  
                        addPunchLog(student)
                        emitter.emit('toaster-success', { message: helper.t('Punch has been accepted in emergency mode'), duration: 5000})
                    } 

                    storage('wattingList').value = wattingList.value;
            }
        })
    } catch (error) {
        console.warn('punchToCallStudent_error::', error);
    }

}

async function punchToSubmitAttendance(barcode='play-417-2024', { 
    message='', 
    source='device', 
    device_index=0,
    remarks='',
    delay=0,
    punch_time=moment(),
    silent_mode=false,
    skipSms=false,
}={} ){
    if(!delay){
        await __punchToSubmitAttendance(barcode, { message, source, device_index, remarks, punch_time, silent_mode, skipSms });
    } else {
        setTimeout(async () => {
            await __punchToSubmitAttendance(barcode, { message, source, device_index, remarks, punch_time, silent_mode, skipSms });
        }, delay);
    }
}

async function __punchToSubmitAttendance(barcode='play-417-2024', { 
    message='', 
    source='device', 
    device_index=0,
    remarks='',
    punch_time=moment(), // actually punch dateTime
    silent_mode=false,
    skipSms=false,
}={} ){
     try {

        let DATE_FORMAT = 'YYYY-MM-DD'
        let TIME_FORMAT = 'HH:mm:ss'

        let punch__time = moment.isMoment(punch_time) ? punch_time : moment(new Date(punch_time))
        let date = moment(punch__time).format(DATE_FORMAT)

        if(barcode == 'i' || barcode == 'I'){
            emergency_mode.value = !emergency_mode.value
            return
        }

        if(!emergency_mode.value){
            if(!(/^[a-z_0-9]+-\d{1,}-sound(1|2|3)/gi.test(barcode))){
                emitter.emit('toaster-error', { message: helper.t('Barcode is invalid ({barcode})', { barcode }), duration: 5000})
                return
            }
        }


        let [ class_short ] = barcode.split('-') // nursary-23-sound1-2024
        let class_object = classes.value.find(c => c.class_short === class_short)
        let class_name = class_object?.class_name


        if(source === 'device'){
            // Without internet device punch not allowed
            if(appAccessData.value?.internet === false){
                emitter.emit('toaster-error', { message: helper.t('Device punch is not allowed without internet connection')})
                return
            }
        }


        let response = await http.get('/single-student', { params: { barcode, date, with_attendance: true } })
        if(response.status == 200){
            let student = response.data.data;
            let entires = response.data.entries;
                
            
            if(student.status !== 1){
                return emitter.emit('toaster-error', { message: helper.t('This student is currently inactive')})
            } 


            
            let shifts = helper.getShifts(classes.value, class_short, false)
            if (!shifts?.length) {
                return emitter.emit('toaster-success', {message: helper.t('No shift has been configured for {name}', { name: class_name })})
                
            } else {

                let payload = {
                    // id: null,
                    student_id: student.dakhela,
                    date,
                    in_time: null,
                    out_time: null,
                    late_in_minute: 0, 
                    status: 'Present', // 'Present' | 'Late' | 'Leave' | 'Absent' | 'over-stay' | 'Gone-fast',
                    remarks,
                    shift_duration: '', // 08:00 - 12:00
                    device_index,
                    shift_count: shifts?.length,
                    shift_number: 1,
                }

                let today_entries = entires 
                const max_permitte_entry = shifts?.length * 2
                const late_consideration_minute = CONFIG.value?.settings?.attendance?.late_consideration_minute || 0
                const punch_separator_gap_in_seconds = CONFIG.value?.settings?.attendance?.punch_separator_gap_in_seconds || 5
                let ___concatedShifts = helper.getShifts(classes.value, class_short, true)
                const punch_not_allowed_message = helper.t('Attendance is not allowed outside the shift! ({shifts})', { shifts: ___concatedShifts })


                if(!today_entries?.length){

                    // When no entry today, just create an entry
                    payload.in_time = moment(punch__time).format(TIME_FORMAT)
                    
                    let runningShift = getRunningShift(shifts, punch__time) 
                    if(!runningShift){
                        emitter.emit('toaster-error', {message: punch_not_allowed_message})
                        return
                    }
                    
                    payload.shift_number = runningShift.shift_number
                    payload.shift_duration = `${runningShift.start} - ${runningShift.end}`
                    payload.late_in_minute = moment(punch__time).diff(runningShift.start_datetime, "minutes");
                    
                    if(late_consideration_minute > 0 && payload.late_in_minute > 0 && payload.late_in_minute <= late_consideration_minute){
                        payload.late_in_minute = 0
                    }
                    if(payload.late_in_minute > 0) payload.status = 'Late'
                    payload.remarks = 'First In Today' 
                    await addAttendance(payload, { skipSms })

                } else {
                    let runningShift = getRunningShift(shifts, punch__time)
                    if(!runningShift){
                        emitter.emit('toaster-error', {message: punch_not_allowed_message})
                        return
                    }

                    let current_shift_duration = `${runningShift.start} - ${runningShift.end}`

                    // Find last entry in same shift (for completing In/Out pairs)
                    let same_shift_entries = today_entries.filter(e => e.shift_duration === current_shift_duration)
                    let last_enty = same_shift_entries.length > 0 ? same_shift_entries.at(-1) : today_entries.at(-1)

                    let is_different_shift = last_enty.shift_duration !== current_shift_duration

                    let last_punch_time = moment(punch__time).format(DATE_FORMAT) + ' ' + (last_enty.in_time || last_enty.out_time)
                    let gap_seconds = moment(punch__time).diff(moment(last_punch_time), 'seconds')



                    if(gap_seconds < punch_separator_gap_in_seconds && !is_different_shift){
                        // Same shift AND small gap: update last punch (double-punch correction)
                        payload = { ...payload, ...last_enty }

                        payload.shift_number = runningShift.shift_number
                        payload.shift_duration = current_shift_duration

                        payload.late_in_minute = moment(punch__time).diff(runningShift.start_datetime, "minutes");
                        

                        if(last_enty.in_time){
                            payload.in_time = moment(punch__time).format(TIME_FORMAT)

                            if(late_consideration_minute > 0 && payload.late_in_minute > 0 && payload.late_in_minute <= late_consideration_minute){
                                payload.late_in_minute = 0
                            }


                            if(payload.late_in_minute > 0){
                                payload.status = 'Late'
                            }
                        }
                        else if(last_enty.out_time){
                            payload.out_time = moment(punch__time).format(TIME_FORMAT)
                            payload.status = '' // no status
                            payload.late_in_minute = 0
                        }
                        
                        payload.remarks = 'Updated Existing Entry'

                        await updateAttendance(payload)

                    } else {
                        if(today_entries?.length < max_permitte_entry){
                            // Create a new entry 
                            // ==================

                            let runningShift = getRunningShift(shifts, punch__time)
                            if(!runningShift){
                                emitter.emit('toaster-error', {message: punch_not_allowed_message})
                                return
                            }

                            payload.shift_number = runningShift.shift_number
                            payload.shift_duration = `${runningShift.start} - ${runningShift.end}`

                            let entry_count_by_shift = today_entries.filter(entry => entry.shift_duration === payload.shift_duration)
                            if(entry_count_by_shift?.length === 2){
                                emitter.emit('toaster-error', {message: helper.t('There are already {count} entries for this shift. No new entry is possible.', { count: entry_count_by_shift.length })})
                                return
                            }

                            payload.late_in_minute = moment(punch__time).diff(runningShift.start_datetime, "minutes");


                            if(last_enty.in_time){
                                // Check if punch falls into different shift
                                if(last_enty.shift_duration !== payload.shift_duration){
                                    // Different shift: treat as new In time
                                    payload.in_time = moment(punch__time).format(TIME_FORMAT)
                                    payload.out_time = null

                                    if(late_consideration_minute > 0 && payload.late_in_minute > 0 && payload.late_in_minute <= late_consideration_minute){
                                        payload.late_in_minute = 0
                                    }

                                    if(payload.late_in_minute > 0){
                                        payload.status = 'Late'
                                    }

                                    payload.remarks = helper.t('Added In Time')
                                } else {
                                    // Same shift: treat as out_time
                                    payload.in_time = null
                                    payload.out_time = moment(punch__time).format(TIME_FORMAT)
                                    payload.remarks = helper.t('Added Out Time')
                                    payload.late_in_minute = 0
                                }
                            }
                            else if(last_enty.out_time){
                                // if last is out_time, now will be in_time
                                payload.out_time = null
                                payload.in_time = moment(punch__time).format(TIME_FORMAT)

                                if(late_consideration_minute > 0 && payload.late_in_minute > 0 && payload.late_in_minute <= late_consideration_minute){
                                    payload.late_in_minute = 0
                                }


                                if(payload.late_in_minute > 0){
                                    payload.status = 'Late'
                                }

                                payload.remarks = helper.t('Added In Time')
                            }


                            await addAttendance(payload, { skipSms })

                            
                        } else {
                            console.log('==No action==')
                        }
                    } 
                }

                if(payload.remarks){
                    emitter.emit('toaster-success', { message: payload.remarks })
                } else {
                    emitter.emit('toaster-error', { message: helper.t('Attendance failed!') })

                }
                
        

                function getRunningShift(shifts = [], punch__time=moment()) {
                    let all_shifts = shifts.map((shift, shift_index) => {
                        // use shift.start / shift.end instead of in_time/out_time
                        let in_time = moment(moment(punch__time).format("YYYY-MM-DD") + ' ' + shift.start, "YYYY-MM-DD HH:mm");
                        let out_time = moment(moment(punch__time).format("YYYY-MM-DD") + ' ' + shift.end, "YYYY-MM-DD HH:mm");

                        // pick shift-specific boundary if defined
                    
                        let { start_before, end_after } = CONFIG.value.settings?.attendance?.boundary_time || { start_before: [30, 'minutes'], end_after: [30, 'minutes'] }
                        let [time, unit] = start_before;
                        let [time2, unit2] = end_after;

                        let left_boundary = moment(in_time).subtract(time, unit);
                        let right_boundary = moment(out_time).add(time2, unit2);

                        let is_between = moment(punch__time).isBetween(left_boundary, right_boundary); 
                        let is_over_right_boundary = moment(punch__time).isAfter(right_boundary);


                        return {
                            ...shift,
                            start_datetime: in_time.format('YYYY-MM-DD HH:mm'),
                            end_datetime: out_time.format('YYYY-MM-DD HH:mm'),
                            is_between,
                            shift_number: shift_index + 1,
                            is_over_right_boundary,
                        };
                    });

                    let currentShift = all_shifts.toReversed().find(s => s.is_between)

                    const strict_boundary_time = CONFIG.value.settings?.attendance?.strict_boundary_time ?? false
                    // if not strict mode, shift auto detect 
                    if(strict_boundary_time === false && !currentShift){
                        currentShift = all_shifts.toReversed().find(s => s.is_over_right_boundary)
                        // if no shift is over, set first shift of day as current shift
                        if(!currentShift) currentShift = all_shifts[0]
                    }
                    return currentShift
                }




                async function addAttendance(payload, {skipSms=false}={}){

                    let response = await http.post('/attendence-add', payload, { params: { skipSms }})
                    if(response.status === 200){
                        let attendenceData = response.data.data
                        if(!silent_mode){
                            liveAttendenceList.value.push({...attendenceData, live_data: true})
                            callbacks.fixOverflowOfLiveAttendence()
                            setTimeout(() => {
                                delete liveAttendenceList.value.at(-1).live_data
                            }, 700);
                        } else {
                            const maxLive = CONFIG.value?.settings?.attendance?.maximum_live_attedence || 50
                            let current = storage('liveAttendenceList').value
                            if(!Array.isArray(current)) current = []
                            current.push({...attendenceData, live_data: true})
                            if(current.length > maxLive){
                                current = current.slice(-maxLive)
                            }
                            storage('liveAttendenceList').value = current
                        }
                    } 
                }

                async function updateAttendance(payload){
                    let response = await http.post('/attendence-update', payload)
                    if(response.status === 200){
                        if(!silent_mode){
                            let targetIndex = liveAttendenceList.value.findIndex(item => item.id == payload.id)
                            if(targetIndex > -1){
                                liveAttendenceList.value[targetIndex] = {...liveAttendenceList.value[targetIndex], ...payload, updated_now: true}
                            } else {
                                liveAttendenceList.value.push(payload)
                            } 
                        } else {
                            let current = storage('liveAttendenceList').value
                            if(!Array.isArray(current)) current = []
                            let targetIndex = current.findIndex(item => item.id == payload.id)
                            if(targetIndex > -1){
                                current[targetIndex] = {...current[targetIndex], ...payload, updated_now: true}
                            } else {
                                current.push(payload)
                            }
                            storage('liveAttendenceList').value = current
                        }
                    } 
                }

            

                if(source !== 'device'){
                    // emitter.emit('toaster-success', { message: 'কার্ডটি সফলভাবে পাঞ্চ হয়েছে।'})
                }
            }
            
        }
          
     } catch (error) {
          console.warn('punchToSubmitAttendance_error::', error);
     }
}

function onIframeMessage(e) {
    if (e.data && e.data.event === 'recorded_url_copied') {
        emitter.emit('recorder_url_received', { url: e.data.url })
        emitter.emit('toaster-success', { message: helper.t('Recorded URL copied') })
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('message', onIframeMessage)
})

watch(
    () => route.query.fa,
    (fa) => {
        storage('active').value = fa === 'true' ? true : null
    },
    { immediate: true }
)

const force_active = computed(() => route.query.fa === 'true' || storage('active').value === true)

</script>

<template>
    <!-- <SideBar>
        <routerView />
    </SideBar> -->
    <Toaster @onToaster="onToaster"></Toaster>
    <template v-if="(appUseForbiddened || lockscreenDismissing) && appAccessData?.internet === true">
        <Lockscreen ref="LockscreenRef" :message="getForbiddenedMessage" :checking="checking_accessibility" @tryToUnlock="CheckAccess({loader: true})"></Lockscreen>
        <div ref="disabilityAlretRef" class="disablitily-alert">
            <div v-html="getForbiddenedMessage" @auxclick="log({getWarningMessage})"></div>
            <accessCheckAnimation v-if="checking_accessibility"></accessCheckAnimation>
        </div>
    </template>
    <template v-else>
        <TopNav></TopNav>
        <div v-if="isMounted" class="page-contents" :style="{ paddingBottom: (showAccessibilityAlert && appAccessData?.internet === true) || !appAccessData?.internet ? '80px' : '0' }" >
            <routerView />
            <SwitchBoard v-if="showSwithBoardModal" @close="showSwithBoardModal = false"></SwitchBoard>
            <Playlist ref="palylistComponent"></Playlist>
            <AddBulkAttendaceForDev v-if="show_bulk_attedance_component" @unmount="show_bulk_attedance_component = false"></AddBulkAttendaceForDev>
            <FetchBulkAttendanceFromDevice v-if="allow_auto_fetch" :isAutomatic="true" />

        </div>
    
        <template v-if="showAccessibilityAlert && appAccessData?.internet === true">
            <div ref="disabilityAlretRef" :class="['disablitily-alert', { 'jump-after-a-while': isLastActiveDay }]" @auxclick="log({getWarningMessage})" v-html="getWarningMessage">
            </div>
        </template>
        <template v-else-if="appAccessData?.internet === false">
            <div ref="disabilityAlretRef" class="disablitily-alert offline">
                আপনার ইন্টারনেট সংযোগটি বিচ্ছিন্ন রয়েছে। এই মুহূর্তে ডিভাইস থেকে পাঞ্চ অকার্যকর।
            </div>
        </template>
    </template>
    <!-- <DevicesPreloader></DevicesPreloader> -->

    
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
.disablitily-alert {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 2;
    padding: 8px 20px 0px 20px;
    padding-bottom: max(10px,env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #1a1000;
    background: linear-gradient(135deg,#ffe033 0%,#ffc800 50%,#ffb300 100%);
    border-top: 2px solid #e6a800;
    box-shadow: 0 -4px 20px #0000002e;
    animation: da-slidein-4060e807 .35s cubic-bezier(.22,1,.36,1);
    letter-spacing: .01em;
    line-height: 1.5;
    text-align: center;
}
.disablitily-alert .da-icon {
    font-size: 20px;
    flex-shrink: 0;
    opacity: 0.75;
}
.disablitily-alert.offline {
    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
    border-top-color: #444;
    color: #e0e0e0;
}
@keyframes da-slidein {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
}

.disablitily-alert.jump-after-a-while {
    background: linear-gradient(135deg, #ffe033 0%, #f96c34 50%, #ffb300 100%);
    animation: da-slidein 0.35s cubic-bezier(0.22,1,0.36,1), da-jump 4s ease-in-out 3s infinite;
}
@keyframes da-jump {
    /* first 25% = 1s of motion, remaining 75% = 3s of rest */
    0%        { transform: translateY(0); }
    6%        { transform: translateY(-12px); }
    12%       { transform: translateY(-7px); }
    18%       { transform: translateY(-12px); }
    24%       { transform: translateY(-3px); }
    25%, 100% { transform: translateY(0); }
}
</style>
 
