<template>
    <span class="access-loader"></span>
</template>

<style scoped>
.access-loader {
  width: 100%;
  height: 4px;
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}
.access-loader::after {
  content: '';  
  width: 100%;
  height: 4px;
  background-color: #1f1f1f;
  font-size: 10px;
  /* background-image: linear-gradient(45deg, rgb(255, 255, 255) 25%, transparent 25%, transparent 50%, rgb(155, 17, 17) 50%, rgb(244, 181, 9) 75%, transparent 75%, transparent); */
  background-size: 1em 1em;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  animation: animFw 5s ease-in infinite,  barStripe 1s linear infinite;
}

@keyframes barStripe {
  0% {
    background-position: 2em 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes animFw {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
    
</style>