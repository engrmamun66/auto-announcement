<template>
  <div class="students-chart">
    <highcharts v-if="hasData" :options="chartOptions" />
    <div v-else class="text-muted">No students found.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  students: { type: Array, default: () => [] },
  sortOrder: { type: String, default: 'desc' },
})

const emit = defineEmits(['details'])

const sortedStudents = computed(() => {
  const list = [...(props.students || [])]
  const direction = props.sortOrder === 'asc' ? 1 : -1
  return list.sort((a, b) => {
    const av = Number(a.present_percent || 0)
    const bv = Number(b.present_percent || 0)
    if (av === bv) return 0
    return av > bv ? direction : -direction
  })
})

const hasData = computed(() => sortedStudents.value.length > 0)

const chartOptions = computed(() => {
  const categories = sortedStudents.value.map(std => `${std.name || '-'} (${std.dakhela || '-'})`)
  const data = sortedStudents.value.map(std => Number(std.present_percent || 0))

  return {
    chart: { type: 'bar', height: Math.min(600, 80 + sortedStudents.value.length * 24) },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: { categories, title: { text: '' } },
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
              const std = sortedStudents.value[this.index]
              if (std) emit('details', std)
            },
          },
        },
      },
    },
    series: [
      {
        name: 'Present %',
        data,
        color: '#0c8b8b',
      },
    ],
  }
})
</script>

<style scoped>
.students-chart{
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px;
}
</style>
