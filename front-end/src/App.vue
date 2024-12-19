<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed } from 'vue';
import SideBar from './components/sidebar.vue'
 


let route = useRoute();
let router = useRouter();  
</script>

<template>
    <h1>sdfdf</h1>
    <SideBar>
        asdfasdf
        <routerView />
    </SideBar>
    
</template>

