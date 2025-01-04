<template> 
    <div class="blink-container" v-bind="$attrs">          
        <div class="led-box">
            <div class="led-red"></div> 
        </div> 
    </div> 
</template>

<style scoped>
 .blink-container {
  position: absolute;
  left: 3px;
  opacity: 0.8;
}

.led-box {
  height: 30px;
  width: 30px;
  margin: 2px 0;
  float: left;
}

.led-box p {
  font-size: 12px;
  text-align: center;
  margin: 1em;
}

.led-red {
  margin: 0 auto;
  width: 38px;
  height: 38px;
  background-color: #f00;
  border-radius: 5px; 
  box-shadow: rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #4e0f0f 0 -1px 9px, rgba(255, 0, 0, 0.5) 0 2px 12px; 
  animation: blinkRed 0.5s infinite;
}
 
@keyframes blinkRed {
  from {
    background-color: #f00;
  }
  50% {
    background-color: #a00;
    box-shadow: rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #441313 0 -1px 9px,
      rgba(255, 0, 0, 0.5) 0 2px 0;
  }
  to {
    background-color: #f00;
  }
}
   


</style>