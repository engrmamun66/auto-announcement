<template>
  <div class="report-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="report-tab"
      :class="{ active: active === tab.key }"
      @click="$emit('change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, default: () => [] },
  active: { type: String, default: '' },
})
defineEmits(['change'])
</script>

<style scoped>
.report-tabs{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.report-tab{
  border: 1px solid #d9d9d9;
  background-color: #ffffff;
  color: #333333;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.report-tab:hover{
  background-color: #f1f1f1;
}
.report-tab.active{
  background-color: var(--primaryColor);
  color: #ffffff;
  border-color: var(--primaryColor);
}
</style>
