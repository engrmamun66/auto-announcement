<template>

    
<table>

    <tr>
        <th>Class Name</th>
        <th>Name</th>
        <th>Date</th>
        <th>Present(%)</th>
    </tr>
    <template v-for="studentData in attendaceData">
        <!-- <template v-for="item in studentData">
            <tr>
                <td @click="log({item})">{{ item?.class_name }}</td>
                <td>{{ item?.student_name }}</td>
                <td>{{ item?.date }}</td>
                <td>{{ item?.is_present }}</td>
            </tr> 
        </template> -->

        
        <tr>
            <td @click="log({item})">{{ studentData[0]?.class_name }}</td>
            <td>{{ studentData[0]?.student_name }}</td>
            <td>{{ moment(studentData[0]?.date).format('MMM Y') }}</td>
            <td>{{ getPercent(studentData, 'preset') }}%</td>
        </tr>  
    </template>
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

function getPercent(data, action){
    if(action == 'preset'){
        let total = data.length
        let count = data.filter(item => item?.is_present === true).length
        return Number((100 * count) / total).toFixed(2)
    }
} 

onMounted(()=>{
    // console.log(attendaceData, startDate, endDate);
})

</script>