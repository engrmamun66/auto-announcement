<!-- <Loader margin="0 5px"></Loader> -->
<!-- <Loader v-if="loader" margin="5px 0px 0px 5px" absolute="true" top="13px" right="60px"></Loader> -->
<template>
  <span class="m-loader" 
  :class="[`${size} ${absolute ? 'absolute' : ''}`]"
  :style="(absolute ? `top:${top};right:${right};` : '') + (`--cdn-btn-loader-color: ${color}`)" v-bind="$attrs">
  &nbsp;
  </span>
</template>

<script setup>
import { defineProps } from 'vue'

let props = defineProps({
  size: {
    default: '',
    required: false,
    validator(value) {
      return [ '', 'md', 'lg' ].includes(value)
    }
  },
  color: {
    default: '#dfe2ea',
    required: false,
  },
  margin: {
    default: '0px 0px 0px 5px',
    required: false,
  },
  absolute: {
    default: '',
    required: false,
  },
  top: {
    default: 'relative',
    required: false,
  },
  right: {
    default: 'relative',
    required: false,
  },
})

</script>

<style>
.m-loader {
    position: relative;
    margin: v-bind(margin);
    padding: 1px;
}
.m-loader.absolute {
    position: absolute;
    top: 0px;
    right: 0px;
}

.m-loader:before {
    content: '';
    position: absolute;
    width: 1.25rem;
    height: 1.25rem;
    top: 0;
    left:0;
    border: 2px solid transparent;
    border-top-width: 2px;
    border-right-width: 2px;
    border-top: 2px solid var(--rentmy-btn-load-color, var(--cdn-btn-loader-color, #dfe2ea));;
    border-bottom: 2px solid var(--rentmy-btn-load-color, var(--cdn-btn-loader-color, #dfe2ea));;
    box-sizing: border-box;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    -ms-border-radius: 50%;
    -o-border-radius: 50%;
    border-radius: 50%;
    -webkit-animation: m-loader-rotate 0.6s linear infinite;
    -moz-animation: m-loader-rotate 0.6s linear infinite;
    -ms-animation: m-loader-rotate 0.6s linear infinite;
    -o-animation: m-loader-rotate 0.6s linear infinite;
    animation: m-loader-rotate 0.6s linear infinite;
}

@media screen and (-ms-high-contrast: active),
(-ms-high-contrast: none) {
    .m-loader:before {
        animation: none !important;
    }
}

.m-loader.lg:before {
    width: 2rem;
    height: 2rem;
    border-top-width: 3px;
    border-right-width: 3px;
}

.m-loader.sm:before {
    width: 1rem;
    height: 1rem;
    border-top-width: 1px;
    border-right-width: 1px;
}

@-webkit-keyframes m-loader-rotate {
    to {
        transform: rotate(360deg);
    }
}

@-moz-keyframes m-loader-rotate {
    to {
        transform: rotate(360deg);
    }
}

@-o-keyframes m-loader-rotate {
    to {
        transform: rotate(360deg);
    }
}

@keyframes m-loader-rotate {
    to {
        transform: rotate(360deg);
    }
}

</style>
