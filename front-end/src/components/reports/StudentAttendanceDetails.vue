<template>
  <div v-if="selectedStudent">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="table-title">
        Attendance Of: {{ selectedStudent.name || '-' }} ({{ selectedStudent.dakhela }})
      </h6>
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-sm btn-outline-primary btn-view-toggle"
          :class="{ active: viewMode === 'compact' }"
          @click="$emit('changeView', 'compact')"
        >
          Compact
        </button>

        <button
          class="btn btn-sm btn-outline-primary btn-view-toggle"
          :class="{ active: viewMode === 'details' }"
          @click="$emit('changeView', 'details')"
        >
          Details
        </button>
        <button class="btn btn-sm btn-close-light" @click="$emit('close')">Close</button>
      </div>
    </div>

    <div v-if="loading" class="text-muted">Loading...</div>

    <myTable v-else-if="viewMode === 'details'" topMarginClass="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th>Date</th>
            <th>In</th>
            <th>Out</th>
            <th>Status</th>
            <th>Late(min)</th>
            <th>Shift</th>
            <!-- <th>Remarks</th> -->
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="(row, idx) in rows" :key="'att-' + idx">
          <td>{{ row.date }}</td>
          <td>{{ row.in_time || '-' }}</td>
          <td>{{ row.out_time || '-' }}</td>
          <td>{{ statusByDate?.[row.date] || row.status || '-' }}</td>
          <td>{{ row.late_in_minute ?? 0 }}</td>
          <td>{{ row.shift_duration || '-' }}</td>
          <!-- <td>{{ row.remarks || '-' }}</td> -->
        </tr>
        <tr v-if="!rows.length">
          <td colspan="7" class="text-center text-muted">No attendance data found.</td>
        </tr>
      </template>
    </myTable>

    <myTable v-else topMarginClass="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th StudentAttendanceDetails>Date</th>
            <th>In</th>
            <th>Out</th>
            <th>Status</th>
            <th>Late(max)</th>
            <th>Entries</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr v-for="group in grouped" :key="'grp-' + group.date">
          <td>{{ group.date }}</td>
          <td>{{ group.first_in || '-' }}</td>
          <td>{{ group.last_out || '-' }}</td>
          <td>{{ group.status }}</td>
          <td>{{ group.max_late ?? 0 }}</td>
          <td>{{ group.rows?.length || 0 }}</td>
        </tr>
        <tr v-if="!grouped.length">
          <td colspan="6" class="text-center text-muted">No attendance data found.</td>
        </tr>
      </template>
    </myTable>
  </div>
</template>

<script setup>
import myTable from '../myTable.vue'

defineProps({
  selectedStudent: { type: Object, default: null },
  rows: { type: Array, default: () => [] },
  grouped: { type: Array, default: () => [] },
  statusByDate: { type: Object, default: () => ({}) },
  viewMode: { type: String, default: 'compact' },
  loading: { type: Boolean, default: false },
})
defineEmits(['changeView', 'close'])
</script>

<style scoped>
.table-title{
  margin-bottom: 0px;
  background: white;
  padding: 6px 15px;
  border-radius: 10px;
}
.btn-view-toggle.active{
  background-color: var(--primaryColor);
  color: #ffffff;
  border-color: var(--primaryColor);
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
