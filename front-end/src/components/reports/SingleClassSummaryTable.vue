<template>
  <div v-if="classInfo">
    <!-- <div class="d-flex justify-content-center align-items-center hide_onprint">
      <h5 class="table-title">{{ classInfo.class_name }} Summary</h5>
    </div> -->
    <myTable topMarginClass="mt-2">
      <template #thead>
        <thead>
          <tr>
            <th SingleClassSummaryTable>Class</th>
            <th>Students</th>
            <th>Presentable Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th SingleClassSummary>Present(%)</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <tr>
          <td>{{ classInfo.class_name }}</td>
          <td>{{ summary?.total_students || 0 }}</td>
          <td>{{ summary?.total_presentable_days || 0 }}</td>
          <td>{{ summary?.total_present || 0 }}</td>
          <td>{{ summary?.total_absent || 0 }}</td>
          <td>{{ summary?.present_percent || 0 }}%</td>
        </tr>
      </template>
    </myTable>
  </div>
</template>

<script setup>
import myTable from '../myTable.vue'

defineProps({
  classInfo: { type: Object, default: null },
  summary: { type: Object, default: () => ({}) },
})
</script>

<style scoped>
.table-title{
  margin-bottom: 0px;
  background: white;
  padding: 6px 15px;
  border-radius: 10px;
}
</style>
