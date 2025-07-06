<template>
  <button v-bind="$attrs" @click.stop="(e)=>$emit('click', e)" class="emb-buttons">
    <slot>
      Submit
    </slot>
  </button>
</template>


<script setup>
defineEmits(['click'])
</script>


<style scoped>
button {
  background: var(--grad3);
  border-radius: 5px;
  color: white;
  padding: 10px 20px;
  position: relative;
  text-align: center;
  border: none; /* Removes default border for button */
  text-decoration: none;
  cursor: pointer; /* Adds pointer cursor on hover */
}
button.sm{
  padding: 6px 15px;
  font-size: 12px;
}
button.xsm{
  padding: 2px 10px;
  font-size: 10px;
}
button.red{
  background-color: #ea6b1a;
}
button.sound{
  color: #141414c6;
  background-color: #ddf9f09c;
}


button:active {
  background-color: var(--primaryColor);
}
button.color:active {
  background-color: #d23109;
}
button.sound:active {
  background-color: #bbf3e1;
}

 
button:hover {
  background: var(--secondaryColor);
}

button.red:hover {
  background: #df5330;
}
 
button.sound:hover {
  background: #bbf3e1;
}
 

div.right-align > emb-buttons:not(:last-child) {
  margin-right: 20px;
}

</style>
