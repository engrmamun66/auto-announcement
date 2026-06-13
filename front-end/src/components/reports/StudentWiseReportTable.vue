<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="btn-group bg-white hide_onprint" role="group" aria-label="Student report view">
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: activeView === 'monthly' }"
          @click="activeView = 'monthly'"
        >
          {{ helper.t('Monthly') }}
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: activeView === 'summary' }"
          @click="activeView = 'summary'"
        >
          {{ helper.t('Summary') }}
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: activeView === 'chart' }"
          @click="activeView = 'chart'"
        >
          {{ helper.t('Chart') }}
        </button>
      </div>

      <div class="btn-group bg-white hide_onprint" role="group" aria-label="Sort by present percent">
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'desc' }"
          @click="setSort('desc')"
        >
          <i class='bx bx-sort-down transformY-2px'></i>
          {{ helper.t('Sort') }}
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: sortOrder === 'asc' }"
          @click="setSort('asc')"
        >
          <i class='bx bx-sort-up transformY-2px'></i>
          {{ helper.t('Sort') }}
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
import { ref, inject, watch } from 'vue'
import StudentWiseMonthlyTable from './StudentWiseMonthlyTable.vue'
import StudentWiseRankingTable from './StudentWiseRankingTable.vue'
import StudentsChart from './StudentsChart.vue'

const helper = inject('helper')
const props = defineProps({
  students: { type: Array, default: () => [] },
  monthKeys: { type: Array, default: () => [] },
  activeView: { type: String, default: 'monthly' },
})
defineEmits(['details'])

const activeView = ref(props.activeView)

watch(() => props.activeView, (newView) => {
  if (newView) {
    activeView.value = newView
  }
})
const sortOrder = ref('desc')

function setSort(order){
  sortOrder.value = order
}
</script>
