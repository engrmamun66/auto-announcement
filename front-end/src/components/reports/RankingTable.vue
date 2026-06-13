<template>
  <myTable class="mt-2">
    <template #thead>
      <thead>
        <tr>
          <th RankingTable>{{ helper.t('Ranking') }}</th>
          <th>{{ helper.t('Class') }}</th>
          <th RangkigTable>{{ helper.t('Present(%)') }}</th>
          <th class="hide_onprint">{{ helper.t('Action') }}</th>
        </tr>
      </thead>
    </template>
    <template #rows>
      <tr v-for="(clsShort, idx) in rankings" :key="'rank-' + clsShort">
        <td>{{ idx + 1 }}</td>
        <td>{{ getClassName(clsShort) }}</td>
        <td>{{ getClassReport(clsShort, 'total')?.present_percent || 0 }}%</td>
        <td>
          <button
            class="btn btn-sm btn-secondary hide_onprint"
            :disabled="!getClassInfo(clsShort)"
            @click="$emit('details', getClassInfo(clsShort))"
          >
            {{ helper.t('Details') }}
          </button>
        </td>
      </tr>
    </template>
  </myTable>
</template>

<script setup>
import { inject } from 'vue'
import myTable from '../myTable.vue'

const helper = inject('helper')
const props = defineProps({
  rankings: { type: Array, default: () => [] },
  classes: { type: Array, default: () => [] },
  classWise: { type: Object, default: () => ({}) },
})
defineEmits(['details'])

function getClassReport(class_short, monthKey='total'){
  return props.classWise?.[class_short]?.[monthKey] || {}
}

function getClassName(class_short){
  return getClassInfo(class_short)?.class_name || class_short
}

function getClassInfo(class_short){
  return props.classes.find(c => c.class_short === class_short) || null
}
</script>
