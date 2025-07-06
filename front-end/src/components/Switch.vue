<template>
  <div v-bind="$attrs" :style="`
    --sw-height: ${sw.height};
    --sw-width: ${sw.width};
    --sw-boxWidth: ${sw.boxWidth};
    --sw-boxHeight: ${sw.boxHeight};
    --sw-left: ${sw.left};
  `" >
    <div @click.stop="onClick" :class="{'switch-flexar': inline, 'grayscale': disabled}" :style="` --s-yes:'${yes}'; --s-no:'${no};'`">
        <label v-if="label" class="main-label" >{{label}}</label>
        <div class="switch-area" :class="{['-size-' + size]: true}" >
          <label class="switch" :class="{['-size-' + size]: true}" > 
            <input type="checkbox" :disabled="disabled" :v-model="modelValue" :checked="is_checked" class="switch-input" :class="{['-size-' + size]: true}" @change="(e)=>{
              $emit('update:modelValue', emtiableValue(e.target.checked));
              $emit('change', emtiableValue(e.target.checked));
            }" >
            <span class="switch-label" :data-on="yes" :data-off="no" :class="{['-size-' + size]: true, 'bothVisible': bothVisible}"></span>
            <span class="switch-handle" :class="{['-size-' + size]: true, 'bothVisible': bothVisible}"></span>
          </label>
        </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, computed, inject, ref } from 'vue';

let props = defineProps({
  modelValue: {
    default: 0,
    required: false,
  },  
  label: {
    default: '',
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  yes: { // -----------important
    type: String,
    default: 'Yes',
    required: false,
  },
  no: { // -----------important
    type: String,
    default: 'No',
    required: false,
  },
  yesNoValue: { // -----------important
    default: [1, 0],
    required: false,
  },
  size: {
    type: String,
    default: 'md', // md | lg | sm
    required: false,
  },
  inline: {
    default: false,
    required: false,
  },
  attr: {
    default: {},
    required: false,
  },
  bothVisible: {
    default: false,
    required: false,
  },  
})
let emit = defineEmits([ 'update:modelValue', 'change', 'click'])
let timeout = null
function onClick(e) {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('click', e)
  }, 0);

}



const emtiableValue = (isChecked)=>{
  let [yesValue, noValue] = props.yesNoValue;
  if(props.bothVisible){
    if(isChecked) return noValue;
    else return yesValue;
  } else {
    if(isChecked) return yesValue;
    else return noValue;
  }
}

const is_checked = computed(() => {
  let [yesValue, noValue] = props.yesNoValue;
  if(props.bothVisible){
    return noValue == props.modelValue;
  } else {
    return yesValue == props.modelValue;
  }
})

let sw = computed(() => {
  let { size } = props;
  switch (size) {
    case 'md':
      return {
        height: '36px',
        width: '76px',
        boxWidth: '30px',
        boxHeight: '30px',
        left: '42px',
        ...props.attr
      }
      break;
    case 'lg':
      return {
        height: '36px',
        width: '136px',
        boxWidth: '60px',
        boxHeight: '30px',
        left: '72px',
        ...props.attr
      }
      break;
    case 'sm':
      return {
        height: '26px',
        width: '56px',
        boxWidth: '20px',
        boxHeight: '20px',
        left: '32px',
        ...props.attr
      }
      break;
    case 'xsm':
      return {
        height: '24px',
        width: '50px',
        boxWidth: '17px',
        boxHeight: '18px',
        left: '30px',
        ...props.attr
      }
      break;
  }
})

</script>


<style scoped>
@media (min-width: 500px) {
  .switch-flexar{
    display: flex;
    justify-content: start;
    align-items: center;
    margin-top: 22px;
  }
  .switch-flexar label.main-label{
    margin-right: 10px;
    margin-bottom: 0;
    min-width: max-content;
  }
  
}
.switch-area{
  width: 100%;
}

.switch {
  display: block;
}

.switch {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: var(--sw-width);
  height: var(--sw-height);
  padding: 1px;
  border-radius: 3px;
  cursor: pointer;
}

.switch-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}
.switch-label {
  position: relative;
  display: block;
  height: inherit;
  font-size: 10px;
  /* text-transform: uppercase; */
  background: #0c0c0c;
  background: var(--grad1);
  border-radius: inherit;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 0 2px rgba(0, 0, 0, 0.15);
  -webkit-transition: 0.15s ease-out;
  -moz-transition: 0.15s ease-out;
  -o-transition: 0.15s ease-out;
  transition: 0.15s ease-out;
  -webkit-transition-property: opacity background;
  -moz-transition-property: opacity background;
  -o-transition-property: opacity background;
  transition-property: opacity background;
}
.switch-label:before, .switch-label:after {
  position: absolute;
  top: 50%;
  margin-top: -.5em;
  line-height: 1;
  -webkit-transition: inherit;
  -moz-transition: inherit;
  -o-transition: inherit;
  transition: inherit;
}
.switch-label:before {
  content: attr(data-off);
  right: 12px;
  color: #252525;
  text-shadow: 0 1px rgba(255, 255, 255, 0.2);
  font-weight: 400;
  font-size: 12px;
}

.switch-label.-size-sm:before {
  right: 5px;
  font-size: 11px;
}
.switch-label.-size-xsm:before {
  right: 5px;
  font-size: 9px;
}

.switch-label:after {
  content: attr(data-on);
  font-weight: 400;
  left: 10px;
  /* color: #f7f7f7; */
  text-shadow: 0 1px rgba(0, 0, 0, 0.2);
  opacity: 0;
  font-size: 13px;
}

.switch-label.-size-sm:after {
  left: 5px;
  font-size: 11px;
}
.switch-label.-size-xsm:after {
  left: 5px;
  font-size: 9px;
}
.switch-input:checked ~ .switch-label {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15), inset 0 0 3px rgba(0, 0, 0, 0.2);
}
.switch-input:checked ~ .switch-label:before {
  opacity: 0;
}
.switch-input:checked ~ .switch-label:after {
  opacity: 1;
}

.switch-label.bothVisible:before {
  opacity: 1 !important;
  color: #f7f7f7;
  z-index: 99999;
}
.switch-label.bothVisible:after {
  opacity: 1 !important;
  color: #f7f7f7;
  z-index: 99998;
}

.switch-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  width: var(--sw-boxWidth);
  height: var(--sw-boxHeight);
  /* background: #db2f04; */
  /* background: linear-gradient(90deg, #fa0a0a, #d20b6c82); */
  background: var(--grad3);
  border-radius: 3px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
  transition: left 0.15s ease-out;
  -webkit-transition: left 0.15s ease-out;
  -moz-transition: left 0.15s ease-out;
  -o-transition: left 0.15s ease-out;
  -webkit-transition: left 0.15s ease-out;
  -moz-transition: left 0.15s ease-out;
  -o-transition: left 0.15s ease-out;
}

.switch-input:not(:checked) ~ .switch-handle {
  background: linear-gradient(90deg, #f55128 0%, #c45012 100%);
} 

.switch-input:checked ~ .switch-handle {
  left: var(--sw-left);
  background-color: var(--bg-primary);
  box-shadow: -1px 1px 5px rgba(0, 0, 0, 0.2);
} 

.switch-green > .switch-input:checked ~ .switch-label {
  background: var(--bg-primary);
}

.switch-handle.bothVisible {
  background-color: var(--bg-cool-green) !important;
}

</style>