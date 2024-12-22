<template>
    <span v-if="show" :style="`transform: translateX(${x}) translateY(${y});`" v-bind="$attrs" >
      <span 
        class="spinner-border text-secondary ms-1" :style="`--bs-spinner-animation-speed:${time}`"
        v-bind="{
          style: {
            margin: '0 0 0 0',
            width: `${size}!important`,
            height: `${size}!important`,
            fontSize: `${font_size}!important`,
            color: `${color || 'white'}!important`,
          }
        }" >
        <span class="visually-hidden">Loading...</span>
      </span>
    </span>
  </template>
  
  <script setup>

  const props = defineProps({
    show: {
      default: true,
      type: Boolean,
      required: false,
    },
    font_size: {
      default: "10px",
      type: String,
      required: false,
    },
    size: {
      default: "14px",
      type: String,
      required: false,
    },
    color: {
      default: "white",
      type: String,
      required: false,
    },
    x: {
      default: "-0px",
      type: String,
      required: false,
    },
    y: {
      default: "-0px",
      type: String,
      required: false,
    },
    strock: {
      default: "0.25em",
      type: String,
      required: false,
    },
    time: {
      default: "0.75s",
      type: String,
      required: false,
    },
  });
  //  This is a bootstrap loader
  let setBorder = `${props.strock} solid currentColor`
  </script>
  
  <style scoped>
  .spinner-border {
    border: v-bind(setBorder);
    color: v-bind(color) !important;
    border-left-color: transparent
  }
  </style>