<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { Toaster } from '@/import-hub';

const instance = ref(null);
const selected = ref(null);
const controls = ref(['time']);
const responsive = ref({});
const startDayErrorMessage = ref('');


const props = defineProps({
    _id: {
        default: "timepicker",
        required: true
    },
    date: {
        default: null,
        required: false
    },
    isSingleEndDate: {
        default: false,
        required: false
    },
    stepMinute: {
        default: 15,
        required: false
    }
});


const emit = defineEmits([
    'dateModel',
    'reload'
])


function setDefaultConfigForMbscDatePicker() {
    controls.value = ['time'];
    responsive.value = {
        small: {
            display: 'center'
        },
        medium: {
            display: 'center'
        },
        large: {
            display: 'center'
        }
    };
}


function loadChanges() {

    if (props.date) {
        props.date = props.date?.includes(' ') ? (props.date + ":00").replace(' ', 'T') : props.date;
        const date = new Date(props.date);
        selected.value = [date];
    }

}

function getPlaceholder() {
    return selected.value;
}

function onCancel(event) {
    emit('cancel', true);
}
function onClose(inst) {

    const value = inst.value;
    if (!value) return;

    if (startDayErrorMessage.value.length) {
        // if start date is holiday show error message
        Toaster().error(startDayErrorMessage.value);
    }
    startDayErrorMessage.value = '';
    let date = formatDate(value);
    emit('dateModel', { startDate: date, isSingleEndDate: props.isSingleEndDate });
    setTimeout(() => {
        emit('reload', true);
    }, 500);


}


function formatDate(date) {
    const d = new Date(date);
    const dformat = [
        d.getFullYear(),
        ("0" + (d.getMonth() + 1)).slice(-2),
        ("0" + d.getDate()).slice(-2),
    ].join('-')
        + ' ' +
        [
            ("0" + d.getHours()).slice(-2),
            ("0" + d.getMinutes()).slice(-2)
        ].join(':');
    return dformat;
}

const loaded = ref(false);
function onInit() {
    setDefaultConfigForMbscDatePicker();
    startDayErrorMessage.value = "";
    loadChanges();
    loaded.value = true;
}
onInit();

// OPEN DATEPICKER
function openDatepicker() {
    instance.value = mobiscroll.datepicker(`#${props._id}`, {
        controls: controls.value,
        stepMinute: props.stepMinute,
        onClose: onClose,
        setText: 'Apply',
        responsive: responsive.value,
        touchUi: true,
        inRangeInvalid: true,
    })
    const element = document.getElementById(props._id);
    element.click();
}

</script>
<template>
    <div v-if="loaded">
        <input :id="props._id" @click="openDatepicker()" mbsc-input class="form-control" :placeholder="getPlaceholder()"
            readonly />
    </div>
</template>