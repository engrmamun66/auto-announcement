<template>
  <myTable class="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th StudentWiseRankingTable>{{ helper.t('Rank') }}</th>
          <th>{{ helper.t('Student Name') }}</th>
          <th>{{ helper.t('Dakhela') }}</th>
          <th>{{ helper.t('Presentable Days') }}</th>
          <th>{{ helper.t('Present') }}</th>
          <th>{{ helper.t('Absent') }}</th>
          <th>{{ helper.t('Present(%)') }}</th>
          <th class="hide_onprint">{{ helper.t('Action') }}</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="(std, idx) in rankedStudents" :key="'std-r-' + std.dakhela">
        <td>{{ idx + 1 }}</td>
        <td>{{ std.name || '-' }}</td>
        <td>{{ std.dakhela }}</td>
        <td>{{ std.total_presentable_days || 0 }}</td>
        <td>{{ std.total_present || 0 }}</td>
        <td>{{ std.total_absent || 0 }}</td>
        <td>{{ std.present_percent || 0 }}%</td>
        <td>
          <button class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', std)">{{ helper.t('Details') }}</button>
        </td>
      </tr>
      <tr v-if="!rankedStudents.length">
        <td colspan="8" class="text-center text-muted">{{ helper.t('No students found') }}</td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import { computed, inject } from 'vue'
import myTable from '../myTable.vue'

const helper = inject('helper')
const props = defineProps({
  students: { type: Array, default: () => [] },
  sortOrder: { type: String, default: 'desc' },
})
defineEmits(['details'])

const rankedStudents = computed(() => {
  const list = [...(props.students || [])]
  const direction = props.sortOrder === 'asc' ? 1 : -1
  return list.sort((a, b) => {
    const av = Number(a.present_percent || 0)
    const bv = Number(b.present_percent || 0)
    if (av === bv) return 0
    return av > bv ? direction : -direction
  })
})
</script>
