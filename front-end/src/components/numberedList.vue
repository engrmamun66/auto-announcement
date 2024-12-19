<script setup>
import { defineProps } from 'vue'
 /**
  * Use Example
  * ================
   <numberedList>
      <li>ONe</li>
      <li>Two </li>
      <li>Three</li>
    </numberedList>
  */

let props = defineProps(['useBorder'])

</script>

<template>
<div class="numbered-list-wrapper" :class="{'use-border': useArea}">
  <ol>
    <slot></slot>
  </ol>
</div>

</template>

<style>
.numbered-list-wrapper.use-border{
  border: 1px solid var(--borderColor);
  padding: 10px 20px;
}
.numbered-list-wrapper{
  ol{
    margin: 0 0 1em 0;
    padding: 0;
    counter-reset: li;
    list-style: none;
    li{
      display: block;
      overflow: hidden;
      position: relative;
      padding-left: 50px;
      min-height: 35px;
      margin: 10px 0px;
      padding-top: 4px;
      &:before{
        position: absolute;
        top: 4px;
        left: 0px;
        border: 1px solid #969696;
        background-color: #d5d5d5;
        border-radius: 50%;
        background: linear-gradient(45deg, #28ee76, transparent);
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        color: #000;
        content: counter(li);
        counter-increment: li;
      }
    }
  }
}
</style>