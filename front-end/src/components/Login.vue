<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, inject } from 'vue'
import TermsContent from './TermsContent.vue'

const emit = defineEmits(['loggedIn'])

const http = inject('http')
const helper = inject('helper')
const route = inject('route')
const router = inject('router')
const emitter = inject('emitter');
const user_interacted = inject('user_interacted')

const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const passwordInput = ref(null)
const logoEl = ref(null)
const companyName = globalThis.GLOBAL_DATA?.env?.COMPANY || 'Calling Bird'
const showTerms = ref(false)

function onKeydown(e) {
  if (e.key === 'Escape') showTerms.value = false
}
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)

  // typing + clicking Login already counts as user interaction —
  // stops the "Click me to allow sound" overlay CSS from firing on this screen
  document.body.classList.add('user-interacted')

  if (globalThis.GLOBAL_DATA?.logo && logoEl.value) {
    logoEl.value.src = globalThis.GLOBAL_DATA.logo
    logoEl.value.style.width = globalThis.GLOBAL_DATA.logo_width || '140px'
  }

  const queryPassword = route?.query?.password
  if (queryPassword) {
    const { password: _discard, ...restQuery } = route.query
    router?.replace({ query: restQuery })
    password.value = String(queryPassword)
    submit()

    user_interacted.value = true
    // setTimeout(() => {
    //   try {
    //     const audio = document.createElement('audio')
    //     audio.src = 'https://cb2.softproit.cloud/media/DHM103-1789221963903-blob'
    //     document.body.appendChild(audio)
    //     audio.play()
    //     emitter.emit('toaster-success', { message: 'Auto play fired'})
    //   } catch (e) {
    //     console.error('audio play error', e)
    //   }
    // }, 1000)
  }

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
      <div class="login-logo">
        <img ref="logoEl" alt="logo" src="">
      </div>
      <h2 class="login-title">{{ companyName }}</h2>
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

      <a href="#" class="login-terms-link" @click.prevent="showTerms = true">
        {{ helper?.t?.('Terms & Conditions and Privacy Policy') || 'Terms & Conditions and Privacy Policy' }}
      </a>
    </div>
  </div>

  <!-- Full-screen, scrollable Terms & Conditions / Privacy Policy -->
  <Teleport to="body">
    <div v-if="showTerms" class="terms-modal" role="dialog" aria-modal="true">
      <div class="terms-modal__header">
        <span class="terms-modal__title">{{ helper?.t?.('Terms & Conditions and Privacy Policy') || 'Terms & Conditions and Privacy Policy' }}</span>
        <button class="terms-modal__close" aria-label="Close" @click="showTerms = false">&times;</button>
      </div>
      <div class="terms-modal__body">
        <TermsContent />
      </div>
    </div>
  </Teleport>
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

.login-logo {
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-logo img {
  max-width: 140px;
  max-height: 80px;
  object-fit: contain;
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

.login-terms-link {
  display: inline-block;
  margin-top: 16px;
  color: rgba(255, 230, 160, 0.6);
  font-size: 0.78rem;
  text-decoration: underline;
}
.login-terms-link:hover { color: #ffd700; }

.terms-modal {
  position: fixed;
  inset: 0;
  z-index: 1100; /* above .login-gate */
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.terms-modal__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  padding-top: calc(10px + env(safe-area-inset-top));
  background: #16130d;
  color: #f0e6c0;
}
.terms-modal__title {
  font-weight: 700;
  font-size: 1rem;
}
.terms-modal__close {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.terms-modal__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 24px 16px calc(32px + env(safe-area-inset-bottom));
  background: #fff;
}
</style>
