<template>
  <myTable topMarginClass="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th>Ranking</th>
          <th>Class</th>
          <th RangkigTable>Present(%)</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="(clsShort, idx) in rankings" :key="'rank-' + clsShort">
        <td>{{ idx + 1 }}</td>
        <td>{{ getClassName(clsShort) }}</td>
        <td>{{ getClassReport(clsShort, 'total')?.present_percent || 0 }}%</td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import myTable from '../myTable.vue'

const props = defineProps({
  rankings: { type: Array, default: () => [] },
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
})

function getClassReport(class_short, monthKey='total'){
  return props.classWise?.[class_short]?.[monthKey] || {}
}

function getClassName(class_short){
  return props.classes.find(c => c.class_short === class_short)?.class_name || class_short
}
</script>
