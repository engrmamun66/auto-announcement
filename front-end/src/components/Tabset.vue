<template>
  <div class="tabset">
    <!-- Tab 1 -->
    <input type="radio" name="tabset" id="tab1" aria-controls="marzen" checked @click.stop="emits('onTab', 1)" />
    <label for="tab1" @click.stop="emits('onTab', 1)">General</label>

    <!-- Tab 2 -->
    <input type="radio" name="tabset" id="tab2" aria-controls="rauchbier" @click.stop="emits('onTab', 2)" />
    <label for="tab2" @click.stop="emits('onTab', 2)">Punch History</label>


    <!-- Tab 3 -->
    <!-- <input type="radio" name="tabset" id="tab3" aria-controls="dunkles" />
    <label for="tab3">Dunkles Bock</label> -->

   
  </div>
</template>

<script setup>
let emits = defineEmits('onTab')
</script>



<style scoped>
/*
 CSS for the main interaction
*/
.tabset{
  height: 32px;
  margin-bottom: 20px;
}
.tabset > input[type="radio"] {
  position: absolute;
  left: -200vw;
}

.tabset .tab-panel {
  display: none;
}

.tabset > input:first-child:checked ~ .tab-panels > .tab-panel:first-child,
.tabset > input:nth-child(3):checked ~ .tab-panels > .tab-panel:nth-child(2),
.tabset > input:nth-child(5):checked ~ .tab-panels > .tab-panel:nth-child(3),
.tabset > input:nth-child(7):checked ~ .tab-panels > .tab-panel:nth-child(4),
.tabset > input:nth-child(9):checked ~ .tab-panels > .tab-panel:nth-child(5),
.tabset > input:nth-child(11):checked ~ .tab-panels > .tab-panel:nth-child(6) {
  display: block;
}

/*
 Styling
*/
body {
  font: 16px/1.5em "Overpass", "Open Sans", Helvetica, sans-serif;
  color: #333;
  font-weight: 300;
}

.tabset > label {
  position: relative;
  display: inline-block;
  padding: 4px 15px 15px 0px;
  border: 1px solid transparent;
  border-bottom: 0;
  cursor: pointer;
  font-weight: 400;
  color: var(--secondaryColor);
  margin-bottom: 15px;
}

.tabset > label::after {
  content: "";
  position: absolute;
  left: 0px;
  bottom: 10px;
  width: 60%;
  height: 2px;
  background: #6c6c6c99;
}

input:focus-visible + label {
  outline: 2px solid rgba(0, 102, 204, 0);
  border-radius: 3px;
}

.tabset > label:hover,
.tabset > input:focus + label,
.tabset > input:checked + label {
  color: var(--primaryColor);
}

.tabset > label:hover::after,
.tabset > input:focus + label::after,
.tabset > input:checked + label::after {
  background: var(--primaryColor);
}

.tabset > input:checked + label {
    border-color: #ccc;
    border-bottom: 1px solid #fff;
    margin-bottom: -1px;
    border-radius: 1px;
    border-top-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
    font-weight: 600;
}

.tab-panel {
  padding: 30px 0;
  border-top: 1px solid #ccc;
}

/*
 Demo purposes only
*/
*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  padding: 30px;
}

.tabset {
  max-width: 65em;
}
</style>
