<template>
    <div style="width: 24px;">
        <div class="playing">
            <span class="playing__bar playing__bar1"></span>
            <span class="playing__bar playing__bar2"></span>
            <span class="playing__bar playing__bar3"></span>
            <span class="playing__bar playing__bar5"></span>
        </div>
    </div>
</template>

<style scoped>
.playing {
  background: transparent;
  width: 3rem;
  height: 3rem;
  border-radius: 0.3rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.5rem;
  box-sizing: border-box;
  zoom: 0.5;
}

.playing__bar {
  display: inline-block;
  /* background: var(--primaryColor); */
  background: red;
  width: 0.5rem;
  height: 100%;
  animation: up-and-down 1.3s ease infinite alternate;
}
.playing__bar:not(:last-child) {
  margin-right: 2px;
}

.playing__bar1 {
  height: 60%;
}

.playing__bar2 {
  height: 30%;
  animation-delay: -2.4s;
}

.playing__bar3 {
  height: 75%;
  animation-delay: -3.7s;
}

.playing__bar4 {
  height: 75%;
  animation-delay: -4.2s;
}
.playing__bar5 {
  height: 75%;
  animation-delay: -4.9s;
}

@keyframes up-and-down {
  10% {
    height: 30%;
  }

  30% {
    height: 100%;
  }

  60% {
    height: 50%;
  }

  80% {
    height: 75%;
  }

  100% {
    height: 20%;
  }
}

 

</style>