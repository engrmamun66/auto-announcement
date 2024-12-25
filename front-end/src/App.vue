<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
import Toaster from './components/Toaster.vue'
const emitter = inject('emitter');
import moment from 'moment/moment'


let storage = inject('storage')
let route = useRoute();
let router = useRouter();  

let schedule_start_time = ref(null) // will set always 25 hours format > example: 13:20
let is_started_schedule = ref(0) 
provide('schedule_start_time', schedule_start_time)
provide('is_started_schedule', is_started_schedule)


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

 


let wattingList = ref([
    // {
    //     id: 1,
    //     name: 'Safiyya meherin Dola sdf asdf  1',
    //     class: 'Play',
    // },
])


provide('wattingList', wattingList)


function focusBarcodeInput(){
    if(is_started_schedule.value){
        let inputEl = document.getElementById('BARCODE_INPUT')
        if(inputEl) inputEl.focus()
    }
}


onMounted(()=>{
    classes.value = storage('classes').value || classes.value
    wattingList.value = storage('wattingList').value || wattingList.value
    schedule_start_time.value = storage('schedule_start_time').value || schedule_start_time.value
    if(schedule_start_time.value){
        is_started_schedule.value = 1
    } 

    setInterval(focusBarcodeInput, 1000);
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
    </div>
    
</template>

<style scoped>
.page-contents{
    width: 100%;
    height: auto;
    margin: 0px;
    padding: 20px;
    min-height: max-content;
}
</style>

