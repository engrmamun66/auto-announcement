<template>
  <button v-bind="$attrs" class="emb-buttons">
    <slot>
      Submit
    </slot>
  </button>
</template>


<script setup>

</script>


<style scoped>
button {
  background-color: var(--primaryColor);
  border-radius: 5px;
  color: white;
  padding: 10px 30px;
  position: relative;
  text-align: center;
  border: none; /* Removes default border for button */
  text-decoration: none;
  cursor: pointer; /* Adds pointer cursor on hover */
}
button.red{
  background-color: #ea6b1a;
  box-shadow: 0px -1px 2px 0 #6f1701 inset, 0px 1px 1px 1px #ccc;
}


button:active {
  background-color: var(--primaryColor);
}
button.color:active {
  background-color: #d23109;
}

 
button:hover {
  background: var(--secondaryColor);
}

button.red:hover {
  background: #df5330;
}
 

div > emb-buttons:not(:last-child) {
  margin-right: 20px;
}

</style>
