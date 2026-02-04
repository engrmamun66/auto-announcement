<template>
  <div class="chart-summary">
    <div v-if="!hasData" class="text-muted">No data found.</div>

    <div v-else class="chart-list">
      <div class="chart-row" v-for="cls in classes" :key="'chart-' + (cls.class_short || cls.class_name)">
        <div class="chart-label">
          <div class="label-title">{{ cls.class_name || cls.class_short }}</div>
          <div class="label-meta">
            Students: {{ getClassReport(cls.class_short)?.total_students || 0 }}
            · Present: {{ getClassReport(cls.class_short)?.total_present || 0 }}
            · Absent: {{ getClassReport(cls.class_short)?.total_absent || 0 }}
          </div>
        </div>

        <div class="chart-bar-wrap">
          <div class="chart-bar" :style="{ width: getPercent(cls.class_short) + '%' }">
            <span class="chart-value">{{ getPercent(cls.class_short) }}%</span>
          </div>
          <div class="chart-track"></div>
        </div>

        <div class="chart-actions hide_onprint">
          <button class="btn btn-sm btn-secondary" @click="$emit('details', cls)">Details</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
})

defineEmits(['details'])

const hasData = computed(() => Object.keys(props.classWise || {}).length > 0)

function getClassReport(class_short){
  return props.classWise?.[class_short]?.total || {}
}

function getPercent(class_short){
  const value = Number(getClassReport(class_short)?.present_percent || 0)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}
</script>

<style scoped>
.chart-summary{
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-list{
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-row{
  display: grid;
  grid-template-columns: minmax(180px, 1.2fr) minmax(200px, 2.5fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f7f7;
  border: 1px solid #e4e4e4;
}

.label-title{
  font-weight: 600;
}

.label-meta{
  font-size: 12px;
  color: #666;
}

.chart-bar-wrap{
  position: relative;
  height: 28px;
  border-radius: 999px;
  background: #eaeaea;
  overflow: hidden;
}

.chart-track{
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255,255,255,0.4), rgba(0,0,0,0));
  pointer-events: none;
}

.chart-bar{
  height: 100%;
  border-radius: inherit;
  /* background: linear-gradient(90deg, #198754, #2ecc71); */
  background: var(--primaryColor);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: #fff;
  font-weight: 600;
  transition: width 0.3s ease;
  min-width: 32px;
}

.chart-value{
  font-size: 12px;
}

.chart-actions{
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .chart-row{
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .chart-actions{
    justify-content: flex-start;
  }
}

@media print {
  .chart-bar-wrap,
  .chart-bar,
  .chart-track{
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .chart-bar-wrap{
    background: #e0e0e0 !important;
  }
  .chart-bar{
    background: #666;
    color: #ffffff !important;
  }
  .chart-track{
    background: transparent !important;
  }

  .chart-list{
    break-inside: auto;
  }
  .chart-row{
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
