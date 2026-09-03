<script setup>
import { ref, nextTick, onMounted, inject } from 'vue'

const emit = defineEmits(['loggedIn'])

const http = inject('http')
const helper = inject('helper')

const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const passwordInput = ref(null)

onMounted(async () => {
  // typing + clicking Login already counts as user interaction —
  // stops the "Click me to allow sound" overlay CSS from firing on this screen
  document.body.classList.add('user-interacted')
  await nextTick()
  passwordInput.value?.focus()
})

async function submit() {
  if (!password.value) {
    errorMessage.value = helper?.t?.('Password required') || 'Password required'
    return
  }
  errorMessage.value = ''
  loading.value = true
  try {
    await http.post('/login', { password: password.value })
    emit('loggedIn')
  } catch (err) {
    errorMessage.value = helper?.t?.('Incorrect password') || 'Incorrect password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-gate">
    <div class="login-card">
      <div class="login-icon">
        <i class='bx bx-lock-alt'></i>
      </div>
      <h2 class="login-title">Calling Bird</h2>
      <p class="login-sub">Enter password to continue</p>

      <input
        ref="passwordInput"
        v-model="password"
        type="password"
        class="login-input"
        :placeholder="helper?.t?.('Password') || 'Password'"
        :disabled="loading"
        @keyup.enter="submit()"
      >

      <div v-if="errorMessage" class="login-error">{{ errorMessage }}</div>

      <button class="login-btn" :disabled="loading" @click="submit()">
        {{ loading ? (helper?.t?.('Logging in...') || 'Logging in...') : (helper?.t?.('Login') || 'Login') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-gate {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #16130d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 215, 0, 0.18);
  border-radius: 28px;
  padding: 44px 40px 36px;
  text-align: center;
  max-width: 340px;
  width: calc(100vw - 48px);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.login-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #ffd700;
}

.login-title {
  color: #f0e6c0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0 0 6px;
}

.login-sub {
  color: rgba(255, 230, 160, 0.6);
  font-size: 0.82rem;
  margin: 0 0 20px;
}

.login-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #fff;
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 14px;
  margin-bottom: 10px;
}
.login-input::placeholder { color: #888; }
.login-input:focus {
  border-color: #ffd700;
  background: #333;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.15);
}

.login-error {
  color: #ff6b6b;
  font-size: 0.78rem;
  margin-bottom: 10px;
}

.login-btn {
  width: 100%;
  padding: 11px 0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #ffd700;
  color: #16130d;
  transition: background 0.2s;
}
.login-btn:hover:not(:disabled) { background: #ffe44d; }
.login-btn:disabled { opacity: 0.6; cursor: default; }
</style>
