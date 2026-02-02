<template>
  <myTable topMarginClass="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th MonthlyReportTable>Class</th>
          <th v-for="m in monthKeys" :key="'h-' + m">{{ formatMonth(m) }}</th>
          <th MonthlyReportTable>Total</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="cls in classes" :key="'mon-' + cls.class_short">
        <td>{{ cls.class_name }}</td>
        <td v-for="m in monthKeys" :key="'c-' + cls.class_short + '-' + m">
          {{ getClassReport(cls.class_short, m)?.present_percent || 0 }}%
        </td>
        <td>{{ getClassReport(cls.class_short, 'total')?.present_percent || 0 }}%</td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import moment from 'moment/moment'
import myTable from '../myTable.vue'

const props = defineProps({
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
  monthKeys: { type: Array, default: () => [] },
})

function getClassReport(class_short, monthKey='total'){
  return props.classWise?.[class_short]?.[monthKey] || {}
}

function formatMonth(value){
  return moment(value).format('MMM YYYY')
}
</script>
