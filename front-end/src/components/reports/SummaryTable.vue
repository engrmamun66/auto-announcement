<template>
  <myTable topMarginClass="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th>Class</th>
          <th>Students</th>
          <th>Open&nbsp;Days</th>
          <th>Present</th>
          <th>Absent</th>
          <th SummaryTable>Present(%)</th>
          <th>Action</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="cls in classes" :key="'sum-' + cls.class_short">
        <td>{{ cls.class_name }}</td>
        <td>{{ getClassReport(cls.class_short)?.total_students || 0 }}</td>
        <td>{{ getClassReport(cls.class_short)?.total_presentable_days || 0 }}</td>
        <td>{{ getClassReport(cls.class_short)?.total_present || 0 }}</td>
        <td>{{ getClassReport(cls.class_short)?.total_absent || 0 }}</td>
        <td>{{ getClassReport(cls.class_short)?.present_percent || 0 }}%</td>
        <td>
          <button class="btn btn-sm btn-secondary" @click="$emit('details', cls)">Details</button>
        </td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import myTable from '../myTable.vue'

const props = defineProps({
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
})
defineEmits(['details'])

function getClassReport(class_short){
  return props.classWise?.[class_short]?.total || {}
}
</script>
