<script setup>
import { io } from 'socket.io-client';
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

  let sourceBuffer;

  mediaSource.addEventListener('sourceopen', () => {
    sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs=opus');

    socket.on('audio-play', (chunk) => {
      if (sourceBuffer.updating || !chunk) return;
      try {
        // Assume chunk is already an ArrayBuffer (not a Blob)
        sourceBuffer.appendBuffer(new Uint8Array(chunk));
      } catch (err) {
        console.error('Buffer append error:', err);
      }
    });
  });

  socket.on('call-ended', () => {
    alert('Call ended.');
    socket.disconnect();
  });
});
</script>
