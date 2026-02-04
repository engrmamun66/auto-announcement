<template>
  <div class="summary-chart">
    <highcharts v-if="hasData" :options="chartOptions" />
    <div v-else class="text-muted">No data found.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['details'])

const classList = computed(() => props.classes || [])
const hasData = computed(() => Object.keys(props.classWise || {}).length > 0)

function getClassReport(class_short){
  return props.classWise?.[class_short]?.total || {}
}

function getPercent(class_short){
  const value = Number(getClassReport(class_short)?.present_percent || 0)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

const chartOptions = computed(() => {
  const categories = classList.value.map(cls => cls.class_name || cls.class_short)
  const data = classList.value.map(cls => getPercent(cls.class_short))

  return {
    chart: { type: 'column', height: 420 },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: { categories, crosshair: true },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: 'Present (%)' },
    },
    tooltip: { pointFormat: '<b>{point.y}%</b>' },
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              const cls = classList.value[this.index]
              if (cls) emit('details', cls)
            },
          },
        },
      },
    },
    series: [
      {
        name: 'Present %',
        data,
        color: '#198754',
      },
    ],
  }
})
</script>

<style scoped>
.summary-chart{
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px;
}
</style>
