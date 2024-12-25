<script setup>
defineProps({
    scannig: {
        default: true,
        required: false,
    }
})
</script>

<template>
  <div v-bind="$attrs" class="preloader-scan">
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
    <div :class="{'diode': scannig}">
    <div :class="{'laser': scannig}" ></div>
    </div>
  </div>
</template>

<style scoped>
.preloader-scan {
  position: relative;
  left: 0;
  right: 0;
  max-width: 130px;
  margin: 0px;
}
.preloader-scan li:nth-child(1) {
  width: 3px;
}
.preloader-scan li:nth-child(2) {
  width: 1px;
}
.preloader-scan li:nth-child(3) {
  width: 3px;
}
.preloader-scan li:nth-child(4) {
  width: 4px;
}
.preloader-scan li:nth-child(5) {
  width: 1px;
}
.preloader-scan li:nth-child(6) {
  width: 4px;
}
.preloader-scan li:nth-child(7) {
  width: 4px;
}
.preloader-scan li:nth-child(8) {
  width: 1px;
}
.preloader-scan li:nth-child(9) {
  width: 3px;
}
.preloader-scan li:nth-child(10) {
  width: 4px;
}
.preloader-scan li:nth-child(11) {
  width: 5px;
}
.preloader-scan li:nth-child(12) {
  width: 5px;
}
.preloader-scan li:nth-child(13) {
  width: 5px;
}
.preloader-scan li:nth-child(14) {
  width: 1px;
}
.preloader-scan li:nth-child(15) {
  width: 3px;
}
.preloader-scan li:nth-child(16) {
  width: 2px;
}
.preloader-scan li:nth-child(17) {
  width: 4px;
}
.preloader-scan li:nth-child(18) {
  width: 2px;
}
.preloader-scan li:nth-child(19) {
  width: 4px;
}
.preloader-scan li:nth-child(20) {
  width: 5px;
}
.preloader-scan li:nth-child(21) {
  width: 3px;
}
.preloader-scan li:nth-child(22) {
  width: 1px;
}
.preloader-scan li:nth-child(23) {
  width: 1px;
}
.preloader-scan li:nth-child(24) {
  width: 4px;
}

.preloader-scan ul {
  list-style-type: none;
  display: flex;
  position: relative;
  width: 122px;
}

.preloader-scan li {
    width: 2px;
    height: 34px;
    background-color: #444444;
    margin-right: 2px;
}

.preloader-scan .diode {
  -webkit-animation: beam 0.01s infinite;
  animation: beam 0.01s infinite;
}

.preloader-scan .laser {
    position: absolute;
    width: calc(100% + 0px);
    background-color: tomato;
    height: 1px;
    top: 0;
    z-index: 2;
    box-shadow: 0 0 4px 1px red;
    transform: translateX(-2px);
    animation: scanning 2s infinite;
}
 
@keyframes beam {
  50% {
    opacity: 0;
  }
}
@keyframes scanning {
  50% {
    transform: translateY(34px);
  }
}
</style>
