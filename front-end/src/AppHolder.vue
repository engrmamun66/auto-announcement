<script setup>
import { provide, inject, ref, computed, onMounted } from 'vue';

onMounted(()=>{
    updateVariables();   
    emitter.on('observed', updateVariables);
})

</script>

<template>
  
</template>