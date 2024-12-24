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

})

let emits = defineEmits(['update:modelValue', 'close'])

function close(){
    emits("update:modelValue", false);
    emits("close", false);
}

</script>

<template> 
    <Teleport to="body" >
        <div class="an-modal" v-if="modelValue" @click.stop="close()">
            <div class="modal__content" @click.stop="false">
                <slot name="title">
                    <h3 v-if="title">{{title}}</h3> 
                </slot>
                <slot>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente nihil assumenda voluptates voluptatem repellat cumque esse numquam quam soluta natus, deserunt facere maiores quos nobis similique, quis, nisi vel minus!
                </slot> 
                <a @click.stop.prevent="close()" class="modal__close">×</a>
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
  z-index: 99999999999999999999999999;
}
 
.modal__content {
  border-radius: 4px;
  position: relative;
  width: 500px;
  max-width: 90%;
  background: #fff;
  padding: 1em 2em;
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

</style>