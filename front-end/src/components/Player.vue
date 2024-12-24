<template>
  <div class="audio-player-area" >
    <audio ref="audioElement" controls>
      <source v-if="srcOgg" :src="srcOgg" type="audio/ogg" />
      <source v-if="srcMp3" :src="srcMp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
    <span class="close" @click="$emit('close', true)">
        <i class='bx bxs-x-circle'></i>
    </span>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"; 
let emits = defineEmits([
    'close',
])

// Define props
let { src } = defineProps({
  src: {
    type: String,
    required: true,
  },
});

// Compute audio sources based on the provided src
const srcOgg = computed(() => src.replace(/\.\w+$/, ".ogg"));
const srcMp3 = computed(() => src.replace(/\.\w+$/, ".mp3"));

let audioElement = ref(null);

onMounted(() => {
  audioElement.value.play();
});
</script>

<style scoped>
.audio-player-area{
    position: relative;
    width: 250px;
}
audio{
    width: 100%;
    height: 40px;
}
.close{
    position: absolute;
    right: 9px;
    top: 8px;
    z-index: 9999991;
    cursor: pointer;
}
.close i{
    font-size: 24px;
}
</style>

 
