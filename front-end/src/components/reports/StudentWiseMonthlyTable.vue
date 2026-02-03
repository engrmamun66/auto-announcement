<template>
  <myTable topMarginClass="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th StudentWiseMonthlyTable>Student Name</th>
          <th>Dakhela</th>
          <th v-for="m in monthKeys" :key="'h-' + m">{{ formatMonth(m) }}</th>
          <th StudentWiseMonthlyTable>Total</th>
          <th class="hide_onprint">Action</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="std in students" :key="'std-m-' + std.dakhela">
        <td>{{ std.name || '-' }}</td>
        <td>{{ std.dakhela }}</td>
        <td v-for="m in monthKeys" :key="'m-' + std.dakhela + '-' + m">
          {{ std.monthly?.[m]?.present_percent || 0 }}%
        </td>
        <td>{{ std.present_percent || 0 }}%</td>
        <td>
          <button class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', std)">Detail</button>
        </td>
      </tr>
      <tr v-if="!students.length">
        <td :colspan="monthKeys.length + 4" class="text-center text-muted">No students found.</td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import moment from 'moment/moment'
import myTable from '../myTable.vue'

defineProps({
  students: { type: Array, default: () => [] },
  monthKeys: { type: Array, default: () => [] },
})
defineEmits(['details'])

function formatMonth(value){
  return moment(value).format('MMM YYYY')
}
</script>
