<template>
  <div>
    <myTable topMarginClass="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th StudentMonthlyReportTable>Month</th>
            <th>Present(%)</th>
            <th>Presentable Days</th>
            <th>Lates Total</th>
            <th>Average Late</th>
            <th class="hide_onprint">Action</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="row in rows" :key="'mth-' + row.monthKey">
          <td>{{ row.label }}</td>
          <td>{{ row.present_percent || 0 }}%</td>
          <td>{{ row.presentable_days || 0 }}</td>
          <td>{{ row.late_days || 0 }} Days</td>
          <td>{{ row.avg_late || 0 }} Minutes</td>
          <td>
            <button class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', row)">Details</button>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="6" class="text-center text-muted">No data found.</td>
        </tr>
      </template>
    </myTable>
  </div>
</template>

<script setup>
import myTable from '../myTable.vue'

defineProps({
  rows: { type: Array, default: () => [] },
})
defineEmits(['details'])
</script>
