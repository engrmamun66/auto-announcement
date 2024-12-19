<script setup>
/**
 * Use Example
  
 <Tabs :tabs="['JQuery', 'Javascript']">
      <template #slot="{i}">
            <showCode v-show="i==0" lang="javascript" :inTabs="true" :code="`let name = 'Jquery Example'`"></showCode>
            <showCode v-show="i==1" lang="javascript" :inTabs="true" :code="`let name = 'Javascript Example'`"></showCode>
      </template>
  </Tabs>
 */
import showCodeView from './showCode.vue'
import { ref, defineProps } from "vue";
let { tabs } = defineProps({
    tabs: {
        default: [ 'Tab-1', 'Tab-2', 'Tab-3' ],
        required: false,
    }
})

let tabList = ref(tabs.map((name, i) => ({name, show: i==0 ? true : false})));

function toggleLoopItem (data, index, key = "show") {
  if (!data) return;
  data?.forEach((item, i) => {
    if (i == index) {
      item[key] = !(item[key] ?? false);
    } else {
      item[key] = false;
    }
  });
}
</script>

<template>
    <div v-if="tabList?.length">
        <ul class="edoc-tabs">
            <template v-for="(tab, i) in tabList" >
                <li @click="toggleLoopItem(tabList, i)" :class="{'active-tab': tab.show}">{{ tab.name }}</li>
            </template>  
        </ul>
    
        <ul class="tabs-content">
            <template v-for="(tab, i) in tabList" >
                <div v-show="tab.show">
                    <slot name="slot" :i="i">
                        {{ tab.name }}
                    </slot>
                </div>
            </template>  
        </ul>
    </div>
</template>

<style>

 
.edoc-tabs {
  margin-top: 20px;
  padding: 0;
  list-style: none;
  position: relative;
  border-bottom: 1px solid var(--borderColor);
}
.edoc-tabs .active-tab {
  border-top: 1px solid var(--borderColor);
  border-left: 1px solid var(--borderColor);
  border-right: 1px solid var(--borderColor);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom: none;
  position: relative;
  color: black;
  background: linear-gradient(180deg, #3a3f4817, transparent);
}
.edoc-tabs .active-tab:after {
  width: 100%;
  height: 2px;
  position: absolute;
  content: "";
  bottom: -0.1em;
  left: 0;
  background: white;
}
.edoc-tabs li {
  display: inline-block;
  cursor: pointer;
  color: #303030;
  padding: 5px 10px;
}
.edoc-tabs li:first-child {
  margin-left: 10px;
}

.edoc-tabs .edoc-tabs-content {
  margin: 20px;
  padding: 0;
  list-style: none;
}
.edoc-tabs-content li {
  display: none;
}
</style>