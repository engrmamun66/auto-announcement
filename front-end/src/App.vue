<script setup>
import { ref, onMounted } from 'vue';
import AppHolder from './AppHolder.vue';
import { useGlobalStore } from './stores/global';
const globalStore = useGlobalStore();
let isMounted = ref(false);
onMounted( async ()=>{
    await globalStore.getContents();
    await globalStore.getCountries();
    await globalStore.getStoreAndLocations();
    isMounted.value = true;
})
</script>

<template>
    <template v-if="isMounted">
        <AppHolder></AppHolder>
    </template>    
</template>