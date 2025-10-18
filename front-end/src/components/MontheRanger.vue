<template>
    <div class="month-range-slider" ref="sliderRef">
      <!-- Months labels -->
      <div class="months-grid">
        <div
          v-for="month in months"
          :key="month.value"
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
  
      <!-- Display Value -->
      <div class="selection-display">
        Selected Range: {{ displayValue }}
      </div>
    </div>
  </template>
  
  <script>
  import moment from 'moment/moment';
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
  
  export default {
    name: 'DualMonthSlider',
    emits: ['update:modelValue'],
    setup(_, { emit }) {
      const months = [
        { label: 'Jan', value: 1 },
        { label: 'Feb', value: 2 },
        { label: 'Mar', value: 3 },
        { label: 'Apr', value: 4 },
        { label: 'May', value: 5 },
        { label: 'Jun', value: 6 },
        { label: 'Jul', value: 7 },
        { label: 'Aug', value: 8 },
        { label: 'Sep', value: 9 },
        { label: 'Oct', value: 10 },
        { label: 'Nov', value: 11 },
        { label: 'Dec', value: 12 },
      ];
  
      const sliderRef = ref(null);
      const trackRef = ref(null);
  
      const state = reactive({
        startMonth: moment().month() + 1,
        endMonth: moment().month() + 2,
        dragging: null
      });
  
      const startPercent = computed(() => ((state.startMonth - 1) / 11) * 100);
      const endPercent = computed(() => ((state.endMonth - 1) / 11) * 100);
  
      const displayValue = computed(() => {
        const startLabel = months.find(m => m.value === state.startMonth)?.label;
        const endLabel = months.find(m => m.value === state.endMonth)?.label;
        return `${startLabel} - ${endLabel}`;
      });
  
      const isInRange = (month) => month >= state.startMonth && month <= state.endMonth;
  
      const onDrag = (event) => {
        if (!state.dragging) return;
        const track = trackRef.value;
        const rect = track.getBoundingClientRect();
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        let value = Math.round((percent / 100) * 11) + 1;
  
        if (state.dragging === 'start') {
          state.startMonth = Math.min(value, state.endMonth);
        } else if (state.dragging === 'end') {
          state.endMonth = Math.max(value, state.startMonth);
        }
        emit('update:modelValue', [state.startMonth, state.endMonth]);
      };
  
      const stopDrag = () => {
        state.dragging = null;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', onDrag);
        window.removeEventListener('touchend', stopDrag);
      };
  
      const startDrag = (handle, event) => {
        state.dragging = handle;
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchmove', onDrag);
        window.addEventListener('touchend', stopDrag);
      };
  
      onBeforeUnmount(() => {
        stopDrag();
      });
  
      return {
        months,
        state,
        startPercent,
        endPercent,
        displayValue,
        isInRange,
        sliderRef,
        trackRef,
        startDrag
      };
    }
  };
  </script>
  
  <style scoped>
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
    user-select: none;
  }
  
  .month.selected {
    background: var(--primaryColor);
    color: white;
    font-weight: bold;
  }
  
  .slider-track {
    position: relative;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    margin: 16px 0;
  }
  
  .slider-range {
    position: absolute;
    height: 100%;
    background: var(--primaryColor);
    border-radius: 5px;
  }
  
  .handle {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    background: white;
    border: 2px solid var(--primaryColor);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 2;
  }
  
  .selection-display {
    font-weight: bold;
    font-size: 16px;
  }
  </style>
  