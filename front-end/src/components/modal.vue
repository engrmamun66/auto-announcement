<script setup>
import { ref } from 'vue'

let props = defineProps({
    modelValue: {
        default: true,
        required: false,
        type: Boolean,
    },
    title: {
        default: 'Modal Title',
        required: false,
    },
    closeIconInOutside: {
        default: false,
        required: false,
    },

})

let emits = defineEmits(['update:modelValue', 'close'])

function close(){
    emits("update:modelValue", false);
    emits("close", false);
    document.body.click() // it will hide all pickers
}

</script>

<template> 
    <Teleport to="body" >
        <!-- <div class="an-modal" v-if="modelValue" @click.stop="close()"> -->
        <div class="an-modal" v-if="modelValue" @click.stop="false">
            <div class="modal__content fadeUp" @click.stop="false">
                <slot name="title">
                    <h3 v-if="title">{{title}}</h3> 
                </slot>
                <slot>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente nihil assumenda voluptates voluptatem repellat cumque esse numquam quam soluta natus, deserunt facere maiores quos nobis similique, quis, nisi vel minus!
                </slot> 
                <a @click.stop.prevent="close()" class="modal__close" :class="{'closeIconInOutside': closeIconInOutside}" >×</a>
            </div>
        </div>
    </Teleport>   
</template>

<style>

.an-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(77, 77, 77, .7);
  transition: all .4s;
  z-index: 999;
}
 
.modal__content {
  border-radius: 4px;
  position: relative;
  width: 600px;
  max-width: 95%;
  background: #fff;
  padding: 1em 2em;
  max-height: 90vh;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
}

@media screen and (max-width: 600px) {
  .modal__content {
    padding: 1em 0.75em;
    max-width: 98%;
  }
  /* Neutralise Bootstrap .row negative margins inside modal on mobile */
  .modal__content .row {
    margin-left: 0;
    margin-right: 0;
  }
  .modal__content .row > [class*="col"] {
    padding-left: 8px;
    padding-right: 8px;
  }
}
 
.modal__close {
    position: absolute;
    top: 0px;
    right: 10px;
    color: #585858;
    text-decoration: none;
    font-size: 24px;
    cursor: pointer;
}
.modal__close.closeIconInOutside {
    top: -32px;
    color: white;
    right: 0px;
}

</style>