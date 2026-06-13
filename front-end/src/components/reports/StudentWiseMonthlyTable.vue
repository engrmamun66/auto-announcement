<template>
  <myTable class="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th StudentWiseMonthlyTable>{{ helper.t('Student Name') }}</th>
          <th>{{ helper.t('Dakhela') }}</th>
          <th v-for="m in monthKeys" :key="'h-' + m">{{ formatMonth(m) }}</th>
          <th StudentWiseMonthlyTable>{{ helper.t('Total') }}</th>
          <th class="hide_onprint">{{ helper.t('Action') }}</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="std in sortedStudents" :key="'std-m-' + std.dakhela">
        <td>{{ std.name || '-' }}</td>
        <td>{{ std.dakhela }}</td>
        <td v-for="m in monthKeys" :key="'m-' + std.dakhela + '-' + m">
          {{ std.monthly?.[m]?.present_percent || 0 }}%
        </td>
        <td>{{ std.present_percent || 0 }}%</td>
        <td>
          <button class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', std)">{{ helper.t('Details') }}</button>
        </td>
      </tr>
      <tr v-if="!students.length">
        <td :colspan="monthKeys.length + 4" class="text-center text-muted">{{ helper.t('No students found') }}</td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import { computed, inject } from 'vue'
import moment from 'moment/moment'
import myTable from '../myTable.vue'

const helper = inject('helper')
const props = defineProps({
  students: { type: Array, default: () => [] },
  monthKeys: { type: Array, default: () => [] },
  sortOrder: { type: String, default: 'desc' },
})
defineEmits(['details'])

const sortedStudents = computed(() => {
  const list = [...(props.students || [])]
  const direction = props.sortOrder === 'asc' ? 1 : -1
  return list.sort((a, b) => {
    const av = Number(a.present_percent || 0)
    const bv = Number(b.present_percent || 0)
    if (av === bv) return 0
    return av > bv ? direction : -direction
  })
})

function formatMonth(value){
  return moment(value).format('MMM YYYY')
}
</script>
