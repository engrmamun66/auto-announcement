<script setup>
import { useRoute, useRouter } from "vue-router";
import { provide, inject, ref, computed } from 'vue';
import SideBar from './components/sidebar.vue'
import TopNav from './components/TopNav.vue'
import Toaster from './components/Toaster.vue'
const emitter = inject('emitter');


let route = useRoute();
let router = useRouter();  
</script>

<template>
    <!-- <SideBar>
        <routerView />
    </SideBar> -->
    <Toaster></Toaster>
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

