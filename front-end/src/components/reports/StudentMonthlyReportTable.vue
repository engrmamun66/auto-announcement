<template>
  <div>
    <div v-if="selectedStudent" class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="table-title">
        Monthly Attendance: {{ selectedStudent.name || '-' }} ({{ selectedStudent.dakhela }})
      </h6>
      <button class="btn btn-sm btn-close-light hide_onprint" @click="$emit('close')">Back</button>
    </div>
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
  selectedStudent: { type: Object, default: null },
})
defineEmits(['details', 'close'])
</script>

<style scoped>
.table-title{
  margin-bottom: 0px;
  background: white;
  padding: 6px 15px;
  border-radius: 10px;
}
.btn-close-light{
  color: #b42318;
  background-color: #fff5f5;
  border: 1px solid #f2c2c2;
}
.btn-close-light:hover{
  background-color: #ffecec;
}
</style>
