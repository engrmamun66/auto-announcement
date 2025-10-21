<template>
  <div class="month-range-slider" ref="sliderRef">

    <!-- Display Value -->
    <div class="selection-display mb-2">
        {{ displayValue }}
    </div>

    <!-- Months labels -->
    <div class="months-grid">
      <div
        v-for="month in months"
        :key="month.value"
        @click.stop="onClickMontSort(month)"
        @dblclick.stop="state.startMonth = month.value; state.endMonth = month.value"
        :class="['month', isInRange(month.value) ? 'selected' : '']"
      >
        {{ month.label }}
      </div>
    </div>

    <!-- Slider track -->
    <div class="slider-track" ref="trackRef">
      <div
        class="slider-range"
        :style="{
          left: startPercent + '%',
          width: (endPercent - startPercent) + '%'
        }"
      ></div>

      <!-- Start Handle -->
      <div
        class="handle start-handle"
        :style="{ left: startPercent + '%' }"
        @mousedown.prevent="startDrag('start', $event)"
        @touchstart.prevent="startDrag('start', $event)"
      ></div>

      <!-- End Handle -->
      <div
        class="handle end-handle"
        :style="{ left: endPercent + '%' }"
        @mousedown.prevent="startDrag('end', $event)"
        @touchstart.prevent="startDrag('end', $event)"
      ></div>
    </div>

    
  </div>
</template>

<script setup>
import moment from "moment/moment";
import {
  ref,
  reactive,
  computed,
  onMounted,
  defineEmits,
  onBeforeUnmount,
} from "vue";
let emits = defineEmits(["update:modelValue", "change"]);

const months = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

const sliderRef = ref(null);
const trackRef = ref(null);

const state = reactive({
  startMonth: moment().month() + 1,
  endMonth: moment().month() + 2,
  dragging: null,
});

const startPercent = computed(() => ((state.startMonth - 1) / 11) * 100);
const endPercent = computed(() => ((state.endMonth - 1) / 11) * 100);

const displayValue = computed(() => {
  const startLabel = months.find((m) => m.value === state.startMonth)?.label;
  const endLabel = months.find((m) => m.value === state.endMonth)?.label;
  return `${moment(startLabel, "MMM").format("D MMMM")} - ${moment(
    endLabel,
    "MMM"
  )
    .endOf("months")
    .format("D MMMM")}`;
});

const isInRange = (month) =>
  month >= state.startMonth && month <= state.endMonth;

const onDrag = (event) => {
  if (!state.dragging) return;
  const track = trackRef.value;
  const rect = track.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  let percent = ((clientX - rect.left) / rect.width) * 100;
  percent = Math.max(0, Math.min(100, percent));
  let value = Math.round((percent / 100) * 11) + 1;

  if (state.dragging === "start") {
    state.startMonth = Math.min(value, state.endMonth);
  } else if (state.dragging === "end") {
    state.endMonth = Math.max(value, state.startMonth);
  }
  updateModelValueAndChange()
};


function updateModelValueAndChange() {
  let start_date = moment().month(state.startMonth - 1).startOf('month').format('Y-MM-DD');
  let end_date = moment().month(state.endMonth - 1).endOf('month').format('Y-MM-DD');

  
  emits("change", [start_date, end_date]);
  emits("update:modelValue", [start_date, end_date]);
}



function stopDrag() {
  state.dragging = null;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("touchmove", onDrag);
  window.removeEventListener("touchend", stopDrag);
}

function startDrag(handle, event) {
  state.dragging = handle;
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchmove", onDrag);
  window.addEventListener("touchend", stopDrag);
}

function onClickMontSort({ value }) {
  if (value < state.startMonth) {
    state.startMonth = value;
  } else {
    state.endMonth = value;
  }
  updateModelValueAndChange()
}

onMounted(() => {
  updateModelValueAndChange()
})

onBeforeUnmount(() => {
  stopDrag();
});
</script>

<style scoped>
.month-range-slider {
  background-color: #ffffff47;
  padding: 10px 10px 20px 10px;
  border-radius: 10px;
}
.months-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month {
  width: 100%;
  text-align: center;
  padding: 4px 0;
  border-radius: 0px;
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
  font-size: 15px;
}

.month.selected {
  background: var(--primaryColor);
  color: white;
  font-weight: bold;
  border-radius: 0px;
}

.slider-track {
  position: relative;
  height: 10px;
  background: #f6f6f6;
  border-radius: 5px;
  margin: 16px calc(6% - 20px);
}
@media (min-width: 768px) {
  .slider-track {
    margin: 16px calc(6% - 16px);
  }
}
@media (min-width: 1200px) {
  .slider-track {
    margin: 16px calc(6% - 24px);
  }
}
@media (min-width: 1600px) {
  .slider-track {
    margin: 16px calc(6% - 122px);
  }
}

.slider-range {
  position: absolute;
  height: 100%;
  background: var(--primaryColor);
  border-radius: 0px;
  transition: all 0.2s;
}

.handle {
  position: absolute;
  top: 50%;
  width: 6px;
  height: 20px;
  background: var(--primaryColor);
  border: 2px solid var(--primaryColor);
  border-radius: 2px;
  transform: translate(-50%,-50%);
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
}
.handle:hover {  
  width: 10px;
  background: linear-gradient(45deg, var(--primaryColor), #ffffff);
}

.selection-display {
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}
</style>
  