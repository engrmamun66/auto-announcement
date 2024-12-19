<script setup>
import { ref, inject, defineProps, defineEmits, computed } from 'vue';

let props = defineProps({
    to: {
        default: 'right',
    },
    size: {
        default: '16px',
        required: false,
    },
    color: {
        default: '',
        required: false,
    },
})

let defaults = inject('defaults');
let { font_dark_low: color_font_dark_low } = defaults.colors 

let emits = defineEmits(['click']);


</script>

<template>
    <span @click="(event)=>emits('click', event)" class="svg-icon" :class="[`to-${to}`]" >
        <svg :fill="color || color_font_dark_low" :class="[to]" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 330 330" xml:space="preserve">
        <path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
            c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
            C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
            C255,161.018,253.42,157.202,250.606,154.389z"/>
        </svg>
    </span>
</template>

<style scoped>
span.svg-icon{
    cursor: pointer;
}
span.svg-icon.to-left{
    padding: 2px 10px 2px 0px;
}
span.svg-icon.to-right{
    padding: 2px 0px 2px 10px;
}

svg{
    width: v-bind(size);
    height: v-bind(size);
    cursor: pointer;
}
svg.up{
    transform: rotate(-90deg);
}
svg.down{
    transform: rotate(90deg);
}
svg.left{
    transform: rotate(185deg);
}
svg.right{
    transform: rotate(0deg);
}
</style>