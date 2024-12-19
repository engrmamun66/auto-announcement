<script setup>
import { ref, defineProps, defineEmits, onMounted, onBeforeUnmount } from 'vue';
import CustomerLogin from '../../modules/login-register/views/CustomerLogin.vue'
import { emitter } from '@/import-hub'; 

const props = defineProps({
  modelValue: {
        type: Boolean,
        default: false,
        required: true
  },
  title: {
    type: String,
    default: 'Terms & Conditions',
    required: false,
  },
  content: {
    type: String,
    default: '',
    required: false,
  },
  top: {
    type: Boolean,
    default: false,
    required: false,
  },
  hasCheckboxes: {
    type: Boolean,
    default: false,
    required: false,
  },
  
});
let emit = defineEmits(['update:modelValue', 'close', 'is-accepted']);
let close = (event) => {
  isCheckedAll();
  emit('close');
  emit('update:modelValue', false);
}

let isMounted = ref(null);
let status = ref(false);
const selector = 'input.rentmy_checkbox[name=rentmy_checkbox][type=checkbox]';
let contentDiv = ref(null);

let btn_class = RentMyEvent.apply_filters('cdn:btn_class:terms_and_condition:modal', 'RentMyBtn');

onMounted(() => {
  setTimeout(() => {
    let allCheckbox = Array.from(contentDiv.value.querySelectorAll('.rentmy_checkbox_label'));
    allCheckbox.forEach(label => {
      let span = label.querySelector('span');
      if(span) span.remove();
      let checkbox = label.querySelector('input[type=checkbox]');
      if(checkbox) checkbox.addEventListener('click', isCheckedAll);
    })
    isCheckedAll();
  }, 200)
})

onBeforeUnmount(() => {
  isCheckedAll();
})

function isCheckedAll(){
  let element = contentDiv.value;
  let checkboxes = Array.from(element.querySelectorAll(selector));

  if(!checkboxes?.length){
    emitter.emit('when-accepted-all-terms', true);
  } else {
    status.value = checkboxes.every(el => {
      if(el.checked) el.setAttribute('checked', true);
      else el.removeAttribute('checked');     
      return el.checked === true;
    });
    emitter.emit('when-accepted-all-terms', status.value);
  }
}



</script>

<template>
  <teleport to="body">
    <div
      class="modal fade RentMyOrderDetails"
      :class="{ show: modelValue }"
      @click.stop="close()"
      :style="modelValue ? 'display: block' : 'display: none'"
      v-bind="$attrs"
    >
      <div class="modal-dialog" :class="[top ? '' : 'modal-dialog-centered']">
        <div @click.stop="false" class="modal-content RentMyWrapper" wrapper-is-ready style="--duration:0.3s">
          <div class="modal-header">
              <h6 class="modal-title"> {{ title }} </h6>
              <button @click="close()" type="button" class="btn-close" aria-label="Close" style="background-color:transparent !important"><i class="la la-close"></i></button>
          </div>
          
          <div class="modal-body p-2 px-4">
              <div v-html="content" ref="contentDiv"></div>
          </div>     
           <div class="modal-footer d-flex justify-content-end">
            <button :disabled="hasCheckboxes ? !status : false" :style="hasCheckboxes ? `opacity:${status ? '1' : '0.5'}` : ''" @click="close()" type="button" :class="[ btn_class ]">{{ hasCheckboxes ? 'Continue' : 'OK' }}</button>
          </div>     
        </div>      
      </div>
    </div>
  </teleport>
</template>


