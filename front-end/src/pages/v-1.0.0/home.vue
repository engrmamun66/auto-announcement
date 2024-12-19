<script setup>
import { onMounted, inject } from 'vue';
import showCode from '../../components/showCode.vue'
import Tabs from '../../components/tabs.vue'
import Note from '../../components/note.vue'
import numberedList from '../../components/numberedList.vue'
import myTable from '../../components/myTable.vue'
const version = inject('version')

let script_js = `<link rel="stylesheet" href="http://localhost:3200/assets/em-datetimepicker-documentaion.min.css">`
let script_file = `<script src="http://localhost:3200/assets/em-datetimepicker-documentaion.min.js">` + '<' + '/' + 'script' + '>'
 
 

</script>

<template>
     <h1>Introduction</h1> 
     <p>
          
          <div class="hl low-b">Em-DateTimePicker </div> is a vanila javascript cdn solution to use, date time picker in any website with any platform.
          <span class="hl red mt-2">HTML</span>
          <span class="hl cayan">Vue</span>
          <span class="hl yellow">React</span>
          <span class="hl green">Angular</span>
          
     </p>

     <h1>Script Loading Process</h1> 

      <Tabs :tabs="['CSS', 'Script']">
          <template #slot="{i}">
               <showCode v-show="i==0" lang="javascript" :inTabs="true" :code="script_js"></showCode>
               <showCode v-show="i==1" lang="javascript" :inTabs="true" :code="script_file"></showCode>
          </template>
      </Tabs>

     


     <numberedList :use-border="false" >
          <li>ONe</li>
          <li>Two </li>
          <li>Three</li>
     </numberedList>      


     <myTable></myTable>


      

<!-- 
     <hr v-for="x in 100" >

     <h3 id="TEST">asdf</h3> -->

</template>

<style>
  
</style>

