<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="btn-group bg-white hide_onprint" role="group" aria-label="Student report view">
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: activeView === 'monthly' }"
          @click="activeView = 'monthly'"
        >
          Monthly
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: activeView === 'summary' }"
          @click="activeView = 'summary'"
        >
          Summary
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: activeView === 'chart' }"
          @click="activeView = 'chart'"
        >
          Chart
        </button>
      </div>

      <div class="btn-group bg-white hide_onprint" role="group" aria-label="Sort by present percent">
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'desc' }"
          @click="setSort('desc')"
        >
          <i class='bx bx-sort-down transformY-2px'></i>
          Sort
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'asc' }"
          @click="setSort('asc')"
        >
          <i class='bx bx-sort-up transformY-2px'></i>
          Sort
        </button>
      </div>
    </div>

    <StudentWiseMonthlyTable
      v-if="activeView === 'monthly'"
      :students="students"
      :monthKeys="monthKeys"
      :sortOrder="sortOrder"
      @details="$emit('details', $event)"
    />

    <StudentWiseRankingTable
      v-else-if="activeView === 'summary'"
      :students="students"
      :sortOrder="sortOrder"
      @details="$emit('details', $event)"
    />

    <StudentsChart
      v-else
      :students="students"
      :sortOrder="sortOrder"
      @details="$emit('details', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StudentWiseMonthlyTable from './StudentWiseMonthlyTable.vue'
import StudentWiseRankingTable from './StudentWiseRankingTable.vue'
import StudentsChart from './StudentsChart.vue'

defineProps({
  students: { type: Array, default: () => [] },
  monthKeys: { type: Array, default: () => [] },
})
defineEmits(['details'])

const activeView = ref('monthly')
const sortOrder = ref('desc')

function setSort(order){
  sortOrder.value = order
}
</script>
