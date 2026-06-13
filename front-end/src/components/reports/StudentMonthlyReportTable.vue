<template>
  <div>
    <div v-if="selectedStudent" class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="table-title table-title-highlight">
        {{ helper.t('Monthly Attendance') }}:
        {{ selectedStudent.name || '-' }}
        <span class="table-title-meta">
          ({{ selectedStudent.class_name || selectedStudent.class_short || '-' }} • {{ selectedStudent.dakhela }})
        </span>
      </h6>
      <!-- <button class="btn btn-sm btn-close-light hide_onprint" @click="$emit('close')">Back</button> -->
    </div>
    <myTable class="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th StudentMonthlyReportTable>{{ helper.t('Month') }}</th>
            <th>{{ helper.t('Present(%)') }}</th>
            <th>{{ helper.t('Presentable Days') }}</th>
            <th>{{ helper.t('Common Leaves') }}</th>
            <th>{{ helper.t('Personal Leaves') }}</th>
            <th>{{ helper.t('Total Leaves') }}</th>
            <th>{{ helper.t('Lates Total') }}</th>
            <th>{{ helper.t('Average Late') }}</th>
            <th class="hide_onprint">{{ helper.t('Action') }}</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="row in rows" :key="'mth-' + row.monthKey">
          <td>{{ row.label }}</td>
          <td>{{ row.present_percent || 0 }}%</td>
          <td>{{ row.presentable_days || 0 }}</td>
          <td>{{ row.common_leaves || 0 }}</td>
          <td>{{ row.personal_leaves || 0 }}</td>
          <td>{{ row.total_leaves || 0 }}</td>
          <td>{{ row.late_days || 0 }} {{ helper.t('Days') }}</td>
          <td>{{ row.avg_late || 0 }} {{ helper.t('Minutes') }}</td>
          <td>
            <div class="d-flex gap-1">
              <button :disabled="!row.present_percent" class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', row)">{{ helper.t('Details') }}</button>
              <button :disabled="!row.total_leaves" class="btn btn-sm btn-secondary hide_onprint" @click="$emit('vacations', row)">{{ helper.t('Vacations') }}</button>
            </div>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="9" class="text-center text-muted">{{ helper.t('No data found') }}</td>
        </tr>
      </template>
    </myTable>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import myTable from '../myTable.vue'

const helper = inject('helper')
defineProps({
  rows: { type: Array, default: () => [] },
  selectedStudent: { type: Object, default: null },
})
defineEmits(['details', 'vacations', 'close'])
</script>

<style scoped>
.table-title{
  margin-bottom: 0px;
  background: white;
  padding: 6px 15px;
  border-radius: 10px;
}
.table-title-highlight{
  font-weight: 800; 
  font-size: 16px;
}
.table-title-meta{
  font-weight: 600;
  color: #6b7280;
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
