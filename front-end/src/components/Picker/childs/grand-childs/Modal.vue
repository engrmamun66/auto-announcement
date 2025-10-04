<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  top: {
    default: false,
    required: false,
    type: Boolean,
  }
});

let emit = defineEmits(['makeFalse']);
let close = (event) => {
  emit('makeFalse', false);
}
 
</script>

<template>
  <teleport to="body">
    <div class="modal fade show" @click.stop="close()" v-bind="$attrs" style="display:block">
      <div class="modal-dialog" :class="[top ? '' : 'modal-dialog-centered']" style="max-width: 410px;height:0px">
        <div class="modal-content">          
          <div class="modal-body d-flex justify-content-center" @click.stop="false">
              <slot></slot>
          </div>
        </div>      
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal {
  background-color: #0000003b !important;
}

.modal.show .modal-body{
    animation: openModal 0.3s;
}
@keyframes openModal {
  from {
    transform: translateY(10px); 
    scale: 0.7;
  }
  to {
    transform: translateY(0px);
    scale: 1;
  }
}
.modal-dialog{
  max-width: 0px;
  height:0px;
}
.modal-content{
  background-color: transparent;
  border: none;
}
</style>


