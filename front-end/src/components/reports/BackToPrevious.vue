<template>
  <span class="back-to-previous" @click="$emit('click')">
    <i class="fa fa-arrow-left me-2"></i>
    {{ helper.t('Back to view') }}
  </span>
</template>

<script setup>
import { inject } from 'vue'
const helper = inject('helper')
defineEmits(['click'])
</script>

<style scoped>
.back-to-previous{
  cursor: pointer;
  color: var(--primaryColor);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background-color: #f5f7fb;
  border: 1px solid #e2e8f0;
}
.back-to-previous:hover{
  background-color: #eef2f7;
  text-decoration: none;
}
</style>
