<template>
    <div class="alignCont">
        <div class="alignWrap">

            <div class="lock">
            <svg version="1.1" id="lockSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 -60 166.7 308.6" style="max-width: 100%; height: auto;" xml:space="preserve" data-locked="true">
                <g class="lockPinGroup">
                <path class="lockPin" d="M93.4,4H71.8C42.1,4,17.9,28.1,17.9,57.9v117.5H37V57.9C37,38.7,52.6,23,71.8,23h21.6 c19.2,0,34.9,15.6,34.9,34.9v50h4.3v7.4h-4.3v6.2h19.1v-6.2H143v-7.4h4.3v-50C147.4,28.1,123.2,4,93.4,4z" />
                </g>
                <g class="lockBodyGroup">
                <path class="lockBody" d="M157.6,99.3H9.1c-4,0-7.2,3.1-7.2,6.8v131.7c0,3.8,3.2,6.8,7.2,6.8h148.5c4,0,7.2-3.1,7.2-6.8V106.1 C164.8,102.4,161.6,99.3,157.6,99.3z" />
                <path class="lockBody" d="M5,243.4l-2-1.9C3.5,242.2,4.2,242.8,5,243.4z" />
                <path class="lockKeyHole" d="M83.4,147.6c-8.3,0-14.9,6.7-14.9,14.9c0,6,3.6,11.2,8.7,13.6v14c0,3.5,2.8,6.3,6.3,6.3s6.3-2.8,6.3-6.3v-14 c5.1-2.4,8.7-7.5,8.7-13.6C98.3,154.3,91.6,147.6,83.4,147.6z" />
                <path class="lockSoftShadow" d="M157.6,99.3H9.1c-3.1,0-5.7,1.8-6.8,4.4c24,4.9,51.6,7.7,81,7.7s56.9-2.8,81-7.7 C163.3,101.2,160.7,99.3,157.6,99.3z" />
                <path class="lockShadow" d="M2.4,240.2c1,2.6,3.7,4.4,6.8,4.4h148.5c3.1,0,5.7-1.9,6.8-4.4c-24-4.9-51.6-7.7-81-7.7S26.4,235.2,2.4,240.2z" />
                </g>
            </svg>
            </div>

        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
/* Sizing/Alignment */
body {
  margin: 0;
  padding: 0;
  background-color: #3e3704;
}

.alignCont {
    position: relative;
    display: table;
    width: 100%;
    height: 100%;
    min-width: 100vw;
    min-height: calc(100vh - 40px); 
    overflow: hidden;
}

.alignWrap {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.alignCont:after,
.alignCont:before {
  content: "";
  position: absolute;
  background: linear-gradient(90deg, transparent 50%, black 50%, #111),
    linear-gradient(82deg, transparent 50%, #3e3704 50%, #3e3704),
    linear-gradient(67deg, transparent 50%, #111 50%, #111),
    linear-gradient(52deg, transparent 50%, #3e3704 50%, #3e3704),
    linear-gradient(37deg, transparent 50%, #111 50%, #111),
    linear-gradient(22deg, transparent 50%, #3e3704 50%, #3e3704),
    linear-gradient(7deg, transparent 50%, #111 50%, #111),
    linear-gradient(-8deg, transparent 50%, #3e3704 50%, #3e3704),
    linear-gradient(-23deg, transparent 50%, #111 50%, #111),
    linear-gradient(-38deg, transparent 50%, #3e3704 50%, #3e3704),
    linear-gradient(-53deg, transparent 50%, #111 50%, #111),
    linear-gradient(-68deg, transparent 50%, #3e3704 50%, #3e3704),
    linear-gradient(-83deg, transparent 50%, #111 50%, #111),
    linear-gradient(-90deg, transparent 50%, #3e3704 50%, #3e3704);
  background-position: 0% 0%;
  background-size: 200% 100%;
  padding-top: 80%;
  width: 50%;
  top: 0;
  left: 0;
  z-index: -1;
}
.alignCont:before {
  left: 50%;
  transform: rotate(180deg);
}

.lock {
  display: inline-block;
  width: 100%;
  max-width: min(40vh, 50vw);
}
/* End of Sizing/Alignment */

.lockPin {
  fill: #e6e6e6;
}

.lockShadow {
  opacity: 0.15;
  fill: #000000;
}

.lockBody {
  fill: #ffd700;
}

.lockKeyHole {
  opacity: 0.75;
  fill: #000000;
}

.lockSoftShadow {
  opacity: 0.1;
  fill: #000000;
}
 
#lockPin {
  transform-origin: top;
  transition: transform 0.3s ease;
}

@keyframes lockUnlockBounce {
  0%,
  50% {
    transform: translateY(0);
  }

  25% {
    transform: translateY(2%);
  }

  100% {
    transform: translateY(-20%);
  }
}

@keyframes lockLockBounce {
  0% {
    transform: translateY(-20%);
  }

  50%,
  100% {
    transform: translateY(0);
  }

  75% {
    transform: translateY(2%);
  }
}

.lockPinGroup.unlocking {
  animation: lockUnlockBounce 0.25s ease-out forwards;
}

.lockPinGroup.locking {
  animation: lockLockBounce 0.25s ease-in forwards;
}

</style>