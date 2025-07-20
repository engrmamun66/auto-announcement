<script setup>
import { io } from 'socket.io-client'; // ✅ import socket.io-client
import { onMounted } from 'vue';

const secretKey = '1234';
const socket = io('http://localhost:2400');
onMounted(() => {
    console.warn('Receiver Side');
  socket.emit('join-call', { secretKey, role: 'receiver' });

  const audio = new Audio();
  audio.autoplay = true;

  const mediaSource = new MediaSource();
  audio.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener("sourceopen", () => {
    const sourceBuffer = mediaSource.addSourceBuffer("audio/webm; codecs=opus");

    socket.on("audio-play", (chunk) => {
      const reader = new FileReader();
      reader.onload = () => {
        sourceBuffer.appendBuffer(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(chunk);
    });
  });

  socket.on("call-ended", () => {
    alert("Call ended.");
  });
});
</script>



<template>
    <audio ref="audioRef" controls autoplay></audio>
  </template>
  