

<script setup>
import { provide, inject, ref, computed, watch, onMounted } from 'vue';

let props = defineProps({
    modelValue: {
        type: Boolean,
        default: true
    },
    port: {
        type: Number,
        required: true
    },
});
let CONFIG = inject('CONFIG');
let emit = defineEmits(['update:modelValue', 'change']);

function updateModelValue(value) {
	value = Number(!value)
    emit('update:modelValue', value);
    emit('change', value);
}


</script>


<template>
    <div class="switch-wrap" v-bind="$attrs">
		<span class="screw one"></span>
		<span class="screw two"></span>
		<span class="screw three"></span>
		<span class="screw four"></span>
		<div class="inner-wrap">
			<input type="checkbox" :checked="modelValue" @change="updateModelValue(modelValue)">
			<span class="custom-checkbox"></span>
		</div>
        <span v-if="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'" class="locked"> <i class='bx bxs-lock-alt'></i> </span>
        <span class="port">{{ port }}</span>
	</div>
</template>



<style scoped>
.switch-wrap {
	/* 🔧 Size variables */
	--switch-size: 60px;      /* overall switch height */
	--switch-width: 30px;      /* inner width */
	--screw-size: 10px;        /* screw circle size */
	--indicator-size: 20px;     /* LED light size */
	--spacing: 8px;            /* screw inset */
	--border-radius: 5px;      /* outer box radius */

	width: calc(var(--switch-width) * 2.6);
	height: calc(var(--switch-size) * 2.0);
	margin: 20px auto 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #ededed;
	border-radius: var(--border-radius);
	position: relative; 
}

.inner-wrap {
	height: var(--switch-size);
	width: var(--switch-width);
	position: relative;
}

.inner-wrap .custom-checkbox {
	position: absolute;
	box-shadow: 0 -1px 3px 0px #434343;
    background: linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(192,192,192,1) 100%);
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	cursor: pointer;
	transition: 300ms all;
}

.inner-wrap input:checked + span {
    background: linear-gradient(0deg, rgba(192,192,192,1) 0%, rgba(255,255,255,1) 100%);
	box-shadow: 0 1px 3px 0px #434343;
}

.inner-wrap input {
	margin: 0;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	display: block;
	height: 100%;
	width: 100%;
	z-index: 1;
	opacity: 0;
	cursor: pointer;
}

/* LED toggle visibility */
input:not(:checked) + span::before,
input:checked + span::after { opacity: 0; }
input:checked + span::before,
input:not(:checked) + span::after { opacity: 1; }

.inner-wrap .custom-checkbox::before,
.inner-wrap .custom-checkbox::after {
	position: absolute;
	content: "";
	height: var(--indicator-size);
	width: var(--indicator-size);
	border-radius: 2px;
	left: 50%;
	transform: translateX(-50%);
	transition: 300ms all ease-in-out;
}

/* Red LED */
.inner-wrap .custom-checkbox::before {
	top: calc(var(--indicator-size) * 2.5);
    width: 80%;
    height: 5px;
    background: linear-gradient(to right, rgba(0,128,0,1) 0%, rgb(6, 150, 6) 100%);
	box-shadow: 0 0 0px 0px #ff0000;
}

/* Green LED */
.inner-wrap .custom-checkbox::after {
    bottom: calc(var(--indicator-size) * 2.5);
    width: 80%;
    height: 5px;
    background: linear-gradient(to right, rgba(255,0,0,1) 0%, rgba(255,100,100,1) 100%);
	box-shadow: 0 0 0px 0px rgb(0,128,0);
}

/* Screws */
.screw {
	position: absolute;
	height: var(--screw-size);
	width: var(--screw-size);
	border-radius: 50%;
	box-shadow: 0 0px 2px 0px #aeafaf;
	background: linear-gradient(0deg, rgba(192,192,192,1) 0%, rgba(255,255,255,1) 100%);
}
.screw::after {
	position: absolute;
	height: 2px;
	left: 1px;
	right: 0px;
	background-color: #f7f7f7;
	content: "";
	top: 40%;
	transform: rotate(30deg);
}
.screw.one   { left: var(--spacing); top: var(--spacing); }
.screw.two   { right: var(--spacing); top: var(--spacing); }
.screw.three { bottom: var(--spacing); left: var(--spacing); }
.screw.four  { right: var(--spacing); bottom: var(--spacing); }

.port{
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translate(-50%);
    font-size: 14px;
    font-weight: 700;
    color: #565454;
    text-shadow: -1px 1px 0px white;
}
.locked{
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translate(-50%);
    font-size: 14px;
    font-weight: 700;
    color: #828181;
    text-shadow: -1px 1px 0px white;
}
</style>