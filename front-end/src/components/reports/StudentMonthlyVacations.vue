<template>
  <div v-if="selectedStudent">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="table-title table-title-highlight">
        Vacations & Leaves:
        {{ selectedStudent.name || '-' }}
        <span class="table-title-meta">
          ({{ selectedStudent.class_name || selectedStudent.class_short || '-' }} • {{ selectedStudent.dakhela }})
        </span>
      </h6>
      <div class="table-title-meta">{{ monthLabel || '-' }}</div>
    </div>

    <myTable class="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Scope</th>
            <th>Reason</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="(row, idx) in rows" :key="row.id || row.identity_string || row.date + '-' + idx">
          <td>
            <span
              class="badge"
              :class="row.type === 'vacation' ? 'bg-warning text-dark' : 'bg-info'"
            >
              {{ row.type === 'vacation' ? 'Vacation' : 'Leave' }}
            </span>
          </td>
          <td>{{ row.date || '-' }}</td>
          <td>{{ row.scope || '-' }}</td>
          <td>{{ row.reason || '-' }}</td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="4" class="text-center text-muted">No vacations or leaves found.</td>
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
  monthLabel: { type: String, default: '' },
})
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
</style>
