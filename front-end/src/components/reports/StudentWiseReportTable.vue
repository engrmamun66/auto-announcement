<template>
  <div>
    <myTable topMarginClass="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Dakhela</th>
            <th>Presentable Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Present(%)</th>
            <th>Action</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="std in students" :key="'std-' + std.dakhela">
          <td>{{ std.name || '-' }}</td>
          <td>{{ std.dakhela }}</td>
          <td>{{ std.total_presentable_days || 0 }}</td>
          <td>{{ std.total_present || 0 }}</td>
          <td>{{ std.total_absent || 0 }}</td>
          <td>{{ std.present_percent || 0 }}%</td>
          <td>
            <button class="btn btn-sm btn-light" @click="$emit('details', std)">Detail</button>
          </td>
        </tr>
      </template>
    </myTable>
  </div>
</template>

<script setup>
import myTable from '../myTable.vue'

defineProps({
  students: { type: Array, default: () => [] },
})
defineEmits(['details'])
</script>
