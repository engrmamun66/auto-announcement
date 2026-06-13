<template>
  <myTable class="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th MonthlyReportTable>{{ helper.t('Class') }}</th>
          <th v-for="m in monthKeys" :key="'h-' + m">{{ formatMonth(m) }}</th>
          <th MonthlyReportTable>{{ helper.t('Total') }}</th>
          <th class="hide_onprint">{{ helper.t('Action') }}</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="cls in classes" :key="'mon-' + cls.class_short">
        <td>{{ cls.class_name }}</td>
        <td v-for="m in monthKeys" :key="'c-' + cls.class_short + '-' + m">
          {{ getClassReport(cls.class_short, m)?.present_percent || 0 }}%
        </td>
        <td>{{ getClassReport(cls.class_short, 'total')?.present_percent || 0 }}%</td>
        <td>
          <button class="btn btn-sm btn-secondary hide_onprint" @click="$emit('details', cls)">{{ helper.t('Details') }}</button>
        </td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import { inject } from 'vue'
import moment from 'moment/moment'
import myTable from '../myTable.vue'

const helper = inject('helper')
const props = defineProps({
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
  monthKeys: { type: Array, default: () => [] },
})
defineEmits(['details'])

function getClassReport(class_short, monthKey='total'){
  return props.classWise?.[class_short]?.[monthKey] || {}
}

function formatMonth(value){
  return moment(value).format('MMM YYYY')
}
</script>
