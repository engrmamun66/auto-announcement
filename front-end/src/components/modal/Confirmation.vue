<script setup>
defineProps({
  modelValue: {
        type: Boolean,
        default: false,
        required: true
  },
  title: {
    type: String,
    default: 'Confirmation',
    required: false,
  },
  top: {
    type: Boolean,
    default: false,
    required: false,
  },
  labelYes: {
    type: String,
    default: 'Yes',
    required: false,
  },
  labelNo: {
    type: String,
    default: '',
    required: false,
  },
});
let emit = defineEmits(['update:modelValue', 'clicked-yes', 'clicked-no'])
let yes = (event) => {
  emit('clicked-yes')
  emit('update:modelValue', false)
}
let no = (event) => {
  emit('clicked-no')
  emit('update:modelValue', false)
}
let close = (event) => {
  emit('clicked-no')
  emit('update:modelValue', false)
}

</script>


<template>
  <!-- How To Use
  ==================================
  <modal-confirm v-model="isShow" @clicked-yes="false" @clicked-no="false">
    <div class="pt-3">
      <p class="text-muted">Custom Message Here</p>
    </div>
  </modal-confirm>
  ==================================
   -->
  <teleport to="body">
    <div
      class="modal fade RentMyConfirmationModal"
      :class="{ show: modelValue }"
      :style="modelValue ? 'display: block' : 'display: none'"
    >
      <div class="modal-dialog" :class="[top ? '' : 'modal-dialog-centered']">
        <div @click="$event.stopPropagation()" class="modal-content">
          <div class="modal-header">
              <h6 class="modal-title"> {{ title }} </h6>
              <!-- <button @click="close()" type="button" class="btn-close" aria-label="Close"><i class="la la-close"></i></button> -->
          </div>
          
          <div class="modal-body">
            <div class="col-12"> 
              <slot>
                <!-- Sloted Content -->
              </slot>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-center">
            <button v-if="labelYes" @click="yes()" type="button" class="btn btn-success me-1">{{labelYes}}</button>
            <button v-if="labelNo" @click="no()" type="button" class="btn btn-danger ">{{ labelNo }}</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

