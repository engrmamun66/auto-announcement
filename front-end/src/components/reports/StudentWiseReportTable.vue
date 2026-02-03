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
          :class="{ active: activeView === 'ranking' }"
          @click="activeView = 'ranking'"
        >
          Ranking
        </button>
      </div>

      <div v-if="activeView === 'ranking'" class="btn-group bg-white hide_onprint" role="group" aria-label="Sort by present percent">
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'desc' }"
          @click="setSort('desc')"
        >
          <i class='bx bx-sort-down transformY-2px'></i>
          Rank
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'asc' }"
          @click="setSort('asc')"
        >
          <i class='bx bx-sort-up transformY-2px'></i>
          Rank
        </button>
      </div>
    </div>

    <StudentWiseMonthlyTable
      v-if="activeView === 'monthly'"
      :students="students"
      :monthKeys="monthKeys"
      @details="$emit('details', $event)"
    />

    <StudentWiseRankingTable
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
