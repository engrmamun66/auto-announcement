<script setup>
import { ref, defineProps } from "vue";

let props = defineProps({
     title: {
        default: 'The Title',
     },
     note: {
        default: 'I can do anything once I\'ve had a cup of SleepyTime Tea, perhaps even fall sleep. ',
     },
     signature: {
        default: '',
     },
})

</script>

<template>
<div v-if="note" class="note-container">
  <i class="pin"></i>
  <blockquote class="note yellow">
    <h3 v-if="title" class="note-title ">{{title}}</h3>
    {{ note }}
    <cite class="author">{{String(signature)}}</cite>
  </blockquote>
</div>

</template>

<style>
.note-container {
  margin-top: 50px;
  position: relative;
}
 
.note-container .note {
  color: #333;
  position: relative;
  width: 300px;
  margin: 0 auto;
  padding: 20px;
  /* font-family: 'Barlow Condensed', sans-serif;; */
  font-size: 20px;
  box-shadow: 0 10px 10px 2px rgba(0,0,0,0.3);
}
.note-container .note .note-title {
  text-align: center;
  font-size: 27px;
}
.note-container .note .author {
  display: block;
  margin: 40px 0 0 0;
  text-align: right;
}

.note-container .yellow {
  background: #eae672;
}

.note-container .pin {
  background-color: #aaa;
  display: block;
  height: 32px;
  width: 2px;
  position: absolute;
  left: 50%;
  top: -16px;
  z-index: 1;
}

.note-container .pin:after {
  background-color: #A31;
  background-image: radial-gradient(25% 25%, circle, hsla(0,0%,100%,.3), hsla(0,0%,0%,.3));
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px hsla(0,0%,0%,.1), inset 3px 3px 3px hsla(0,0%,100%,.2), inset -3px -3px 3px hsla(0,0%,0%,.2), 23px 20px 3px hsla(0,0%,0%,.15);
  content: '';
  height: 12px;
  left: -5px;
  position: absolute;
  top: -10px;
  width: 12px;
}

.note-container .pin:before {
  background-color: hsla(0,0%,0%,0.1);
  box-shadow: 0 0 .25em hsla(0,0%,0%,.1);
  content: ''; 

  height: 24px;
  width: 2px;
  left: 0;
  position: absolute;
  top: 8px;
 
  transform: rotate(57.5deg);
  -moz-transform: rotate(57.5deg);
  -webkit-transform: rotate(57.5deg);
  -o-transform: rotate(57.5deg);
  -ms-transform: rotate(57.5deg);
 
  transform-origin: 50% 100%;
  -moz-transform-origin: 50% 100%;
  -webkit-transform-origin: 50% 100%;
  -ms-transform-origin: 50% 100%;
  -o-transform-origin: 50% 100%;
}
 
</style>