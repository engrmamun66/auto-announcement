<template>
  <div class="performance-chart">
    <highcharts v-if="hasData" :options="chartOptions" />
    <div v-else class="text-muted">{{ helper.t('No attendance data found') }}</div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const helper = inject('helper')
const props = defineProps({
  selectedStudent: { type: Object, default: null },
  grouped: { type: Array, default: () => [] },
  statusByDate: { type: Object, default: () => ({}) },
})

const statusToScore = (status) => {
  if (!status) return null
  const normalized = String(status).toLowerCase()
  if (normalized === helper.t('Present').toLowerCase()) return 1
  if (normalized === helper.t('Absent').toLowerCase()) return 0
  if (normalized === helper.t('Leave').toLowerCase()) return 0.5
  return null
}

const chartData = computed(() => {
  return (props.grouped || []).map(item => {
    const status = props.statusByDate?.[item.date] || item.status || ''
    const score = statusToScore(status)
    return {
      date: item.date,
      status,
      y: score,
    }
  })
})

const categories = computed(() => chartData.value.map(p => p.date))
const hasData = computed(() => chartData.value.some(p => typeof p.y === 'number'))

const chartOptions = computed(() => {
  return {
    chart: { type: 'spline', height: 360 },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: categories.value,
      labels: { rotation: -45 },
      title: { text: '' },
    },
    yAxis: {
      min: 0,
      max: 1,
      tickPositions: [0, 0.5, 1],
      title: { text: helper.t('Attendance') },
      labels: {
        formatter: function () {
          if (this.value === 1) return helper.t('Present')
          if (this.value === 0.5) return helper.t('Leave')
          if (this.value === 0) return helper.t('Absent')
          return ''
        },
      },
    },
    tooltip: {
      formatter: function () {
        const point = this.point || {}
        return `<b>${point.date || ''}</b><br/>${helper.t('Status')}: ${point.status || '-'}`;
      },
    },
    plotOptions: {
      series: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
        },
        connectNulls: false,
      },
    },
    series: [
      {
        name: helper.t('Attendance'),
        data: chartData.value.map(p => ({
          y: p.y,
          date: p.date,
          status: p.status,
        })),
        color: '#2563eb',
      },
    ],
  }
})
</script>

<style scoped>
.performance-chart{
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px;
}
</style>
