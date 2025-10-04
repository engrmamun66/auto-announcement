<script setup>
import { ref, inject, defineProps } from 'vue';
let defaults = inject('defaults');
let props = defineProps(['position']);

let {
    body_bg: color_body_bg,
    primary_bg: color_primary_bg,
    bg_grey: color_bg_grey,
    font_dark: color_font_dark,
    font_dark_low: color_font_dark_low,
    font_light: color_font_light,
    date_disable: color_date_disable,
    soft_border: color_soft_border,
} = defaults.colors
const color_transparent_1 = (color_primary_bg + '3d');
const color_transparent_2 = (color_primary_bg + '1c');

</script>

<template>
    <div class="display-are">
        <input type="text" />
        <div class="picker-sample">
            <P>pICKER</P>
        </div>
    </div>
</template>

<style scoped>
.display-area{
    width: 280px;
    height: 200px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
.display-area input[type="text"] {
    color: v-bind(color_font_dark);
    border: 1px solid v-bind(color_font_dark);
    background-color: transparent;
    width: 70px;
    height: 28px;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    background-clip: padding-box;
    display: block;
    border-radius: 3px;
    box-shadow: none;
    margin-left: auto;
    margin-right: auto;
    outline: 0;
}
.display-area .picker-sample {
    padding: 15px;
    border-radius: 3px;
    border: 1px solid v-bind(color_font_dark);
    background-color: v-bind(color_transparent_2);
    position: absolute;
    width: 80px;
    height: 140px;
}
</style>