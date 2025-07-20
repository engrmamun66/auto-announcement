<script setup>
import { io } from 'socket.io-client'; // ✅ import socket.io-client
import { onMounted, inject, ref } from 'vue';
const emitter = inject('emitter');

const secretKey = '1234';
const audioRef = ref(null);
const socket = io('http://localhost:2400');
onMounted(() => {
    console.warn('Receiver Side');
    socket.emit('join-call', { secretKey, role: 'receiver' });

    const audio = audioRef.value
    audio.autoplay = true;

    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", () => {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/webm; codecs=opus"); 

        socket.on("audio-play", (chunk) => {
            if (sourceBuffer && !sourceBuffer.updating) {
                try {
                // ✅ Directly append chunk if it's already binary (ArrayBuffer/Uint8Array)
                sourceBuffer.appendBuffer(new Uint8Array(chunk));
                } catch (err) {
                console.error("appendBuffer error", err);
                }
            }
        });
    });

  socket.on("call-ended", () => {
    emitter.emit('toaster-error', { message: 'Call Ended'})
  });
});
</script>



<template>
    <audio ref="audioRef" controls autoplay></audio>
  </template>
  