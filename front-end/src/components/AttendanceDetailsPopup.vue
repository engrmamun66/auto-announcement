<template>

    
<table>
    <tr v-for="studentData in attendaceData">
        <th @click="log(studentData)">{{ studentData?.id || 'ss' }}</th>
    </tr>
</table>

</template>

<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
const helper = inject("helper");
let log = console.log

let { cls, startDate, endDate } = defineProps({ 
    cls: {},
    startDate: null,
    endDate: null,
})

let {data: attendaceData } = cls || {}

onMounted(()=>{
    console.log(attendaceData, startDate, endDate);
})

</script>