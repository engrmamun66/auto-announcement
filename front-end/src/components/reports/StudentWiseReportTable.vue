<template>
  <div>
    <div class="d-flex justify-content-end mb-2">
      <div class="btn-group bg-white" role="group" aria-label="Sort by present percent">
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'desc' }"
          @click="setSort('desc')"
        >
         <i class='bx bx-sort-down'></i>
          Rank
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'asc' }"
          @click="setSort('asc')"
        >
        <i class='bx bx-sort-up'></i>
          Rank
        </button>
      </div>
    </div>
    <myTable topMarginClass="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th StudentWiseReportTable>Student Name</th>
            <th>Dakhela</th>
            <th>Presentable Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th SingleClassSummaryTable>Present(%)</th>
            <th class="hide_onprint">Action</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="std in sortedStudents" :key="'std-' + std.dakhela">
          <td>{{ std.name || '-' }}</td>
          <td>{{ std.dakhela }}</td>
          <td>{{ std.total_presentable_days || 0 }}</td>
          <td>{{ std.total_present || 0 }}</td>
          <td>{{ std.total_absent || 0 }}</td>
          <td>{{ std.present_percent || 0 }}%</td>
          <td>
            <button class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', std)">Detail</button>
          </td>
        </tr>
      </template>
    </myTable>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import myTable from '../myTable.vue'

const props = defineProps({
  students: { type: Array, default: () => [] },
})
defineEmits(['details'])

const sortOrder = ref('desc')

const sortedStudents = computed(() => {
  const list = [...(props.students || [])]
  const direction = sortOrder.value === 'asc' ? 1 : -1
  return list.sort((a, b) => {
    const av = Number(a.present_percent || 0)
    const bv = Number(b.present_percent || 0)
    if (av === bv) return 0
    return av > bv ? direction : -direction
  })
})

function setSort(order){
  sortOrder.value = order
}
</script>
