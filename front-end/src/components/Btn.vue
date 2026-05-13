<template>
  <button v-bind="$attrs" @click.stop="(e)=>$emit('click', e)" class="emb-buttons" :class="{'with-cbinput': cbinput, 'opacity-50 nc': disabled}" type="button"> 
    <slot>
      Submit
    </slot>
  </button>
</template>


<script setup>
import { defineProps, defineEmits } from 'vue'
let props = defineProps({
  cbinput: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
})
defineEmits(['click'])
</script>


<style scoped>
button {
  background: var(--grad3);
  border-radius: 8px;
  color: white;
  padding: 7px 18px;
  position: relative;
  text-align: center;
  border: none;
  text-decoration: none;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: opacity 0.15s, box-shadow 0.15s, transform 0.1s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
button:hover {
  opacity: 0.88;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  opacity: 1;
}
button.with-cbinput {
  padding: 8px 18px;
}
button.sm {
  padding: 5px 13px;
  font-size: 12px;
  border-radius: 6px;
}
button.xsm {
  padding: 2px 10px;
  font-size: 11px;
  border-radius: 5px;
}
button.red {
  background: linear-gradient(90deg, #c0392b 0%, #e74c3c 100%);
}
button.white,
button.white:active,
button.white:hover {
  color: var(--primaryColor);
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  cursor: default;
  opacity: 1;
}
button.sound {
  color: #065f46;
  background: #d1fae5;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
button.sound:hover {
  background: #a7f3d0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  opacity: 1;
}
button.sound:active {
  background: #6ee7b7;
}
button.opacity-50 {
  opacity: 0.45 !important;
  cursor: not-allowed;
  pointer-events: none;
}

div.right-align > emb-buttons:not(:last-child) {
  margin-right: 20px;
}
</style>
