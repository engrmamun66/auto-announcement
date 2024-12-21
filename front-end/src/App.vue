<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
 


let route = useRoute();
let router = useRouter();  
</script>

<template>
    <!-- <SideBar>
        <routerView />
    </SideBar> -->
    <TopNav></TopNav>
    <div class="page-contents" >
        <routerView />
    </div>
    
</template>

<style scoped>
.page-contents{
    width: 100%;
    height: auto;
    margin: 0px;
    padding: 20px;
    min-height: max-content;
}
</style>

