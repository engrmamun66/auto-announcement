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


let classes = ref([
     {
          class_name:'Play',
          class_short: 'play',
          isActive: true,
     },
     {
          class_name:'Nursery',
          class_short: 'nursery',
          isActive: true,
     },
     {
          class_name:'KG',
          class_short: 'kg',
          isActive: true,
     },
     {
          class_name:'One/Saffe Awal',
          class_short: 'one',
          isActive: true,
     },
     {
          class_name:'Two/Saffe Sani',
          class_short: 'two',
          isActive: true,
     },
     {
          class_name:'Three/Saffe Sales',
          class_short: 'three',
          isActive: true,
     },
     {
          class_name:'Four/Saffe Rabe',
          class_short: 'four',
          isActive: true,
     },
     {
          class_name:'Ibtedaiyah',
          class_short: 'ibtedaiyah',
          isActive: true,
     },
     {
          class_name:'Mutawassitah Awal / Mizan',
          class_short: 'mizan',
          isActive: true,
     },
     {
          class_name:'Mutawassitah Sani / Nahbemir',
          class_short: 'nahbemir',
          isActive: true,
     },
     {
          class_name:'Mutawassitah Sales',
          class_short: 'muta_sales',
          isActive: true,
     },
     {
          class_name:'Sanabiya Awal/Shorhebekaya',
          class_short: 'shorhebe',
          isActive: true,
     },
     {
          class_name:'Sanabiya Sani',
          class_short: 'sana_sani',
          isActive: true,
     },
     {
          class_name:'Hifz',
          class_short: 'hifz',
          isActive: true,
     },
     {
          class_name:'Pre Hifz',
          class_short: 'p_hifz',
          isActive: true,
     },
     {
          class_name:'Fozilat',
          class_short: 'fozilat',
          isActive: true,
     },
]);

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

let tout = null
watch(is_started_schedule, (a, b) => {
    clearTimeout(tout)
    tout = setTimeout(() => {
        checkAndStartAnnouncement()
    }, 1000);
})
 

 // Initial play when the component mounts
 let user_interacted = ref(false)
onMounted(() => { 
    document.addEventListener('click', () => {
        if(user_interacted.value) return;
        user_interacted.value = true;  
    })
})


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

onMounted(()=>{
    clearTimeout(schedule_timeout.value)
    classes.value = storage('classes').value || classes.value
    wattingList.value = storage('wattingList').value || wattingList.value
    schedule_start_time.value = storage('schedule_start_time').value || schedule_start_time.value

    checkAndStartAnnouncement()

    if(schedule_start_time.value){
        is_started_schedule.value = 1
    }
    

    setInterval(focusBarcodeInput__and__startAnnoucement, 1000);
})

</script>

<template>
    <!-- <SideBar>
        <routerView />
    </SideBar> -->
    <Toaster></Toaster>
    <TopNav></TopNav>
    <div class="page-contents" >
        <routerView />
        <Playlist v-if="play_in_playlist && user_interacted"></Playlist>
    </div>
    
</template>

<style scoped>
.page-contents{
    width: 100%;
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

